'use client'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as turf from "@turf/turf";
import { Feature, FeatureCollection } from "geojson";
import { MongoClient } from "mongodb";
import * as Realm from "realm-web";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retrieves the Level 3 boundary from the provided GeoJSON data based on the given coordinates.
 *
 * @param {object} geoJsonData - The GeoJSON data containing the Level 3 boundaries.
 * @param {array} coordinates - The coordinates to check against the Level 3 boundaries.
 * @returns {object|null} - An object containing the index and feature of the matching Level 3 boundary, or null if no match is found.
 */
function getLevel3Boundary(
  geoJsonData: FeatureCollection,
  coordinates: number[]
) {
  try {
    // Create a Turf.js point from the provided coordinates
    const pt = turf.point(coordinates);

    // Iterate through the features in the GeoJSON data
    for (let index = 0; index < geoJsonData.features.length; index++) {
      const feat = geoJsonData.features[index];

      // Check if the point is within the current feature's geometry
      if (turf.booleanPointInPolygon(pt, feat.geometry)) {
        // Return the index and feature of the matching Level 3 boundary
        return { id: index, feature: feat };
      }
    }

    // If no matching Level 3 boundary is found, return null
    return null;
  } catch (error) {
    // Handle any exceptions that may occur during the function execution
    console.error("Error in getLevel3Boundary:", error);
    return null;
  }
}

/**
 * Creates a grid of hexagonal cells within the provided polygon coordinates.
 *
 * @param {object} coordinates - The GeoJSON coordinates of the polygon.
 * @param {number} cellSide - The length of each side of the hexagonal cells.
 * @returns {array} - An array of GeoJSON polygon features representing the grid cells.
 */
function createGrid(coordinates: Feature, cellSide: number) {
  try {
    // Create an empty array to store the grid cells
    const grid: Feature[] = [];

    // Create a Turf.js polygon from the provided coordinates
    const area = turf.polygon(coordinates.geometry.coordinates[0]);

    // Get the bounding box of the polygon
    const bbox = turf.bbox(coordinates);

    // Create a hexagonal grid using the Turf.js hexGrid function
    const hexgrid = turf.hexGrid(bbox, cellSide);

    // Iterate through the features in the hexagonal grid
    hexgrid.features.forEach((poly: Feature) => {
      // Check if the current hexagonal cell is contained within the polygon
      const intersects = turf.booleanContains(area, poly);

      // If the cell is contained, add it to the grid array
      if (intersects) {
        grid.push(poly);
      }
    });

    // Return the grid array
    return grid;
  } catch (error) {
    // Handle any exceptions that may occur during the function execution
    console.error("Error in createGrid:", error);
    return [];
  }
}

/**
 * Retrieves the ID and element of the grid cell that contains the given coordinates.
 *
 * @param {array} grid - An array of GeoJSON polygon features representing the grid cells.
 * @param {array} coordinates - The coordinates to check against the grid cells.
 * @returns {object|null} - An object containing the index and element of the matching grid cell, or null if no match is found.
 */
function getGridId(grid: Feature[], coordinates: number[]) {
  try {
    // Create a Turf.js point from the provided coordinates
    const pt = turf.point(coordinates);

    // Iterate through the grid cells
    for (let index = 0; index < grid.length; index++) {
      const cell = grid[index];

      // Check if the point is within the current grid cell's geometry
      if (turf.booleanPointInPolygon(pt, cell.geometry)) {
        // Return the index and element of the matching grid cell
        return {
          id: index,
          elt: cell,
        };
      }
    }

    // If no matching grid cell is found, return null
    return null;
  } catch (error) {
    // Handle any exceptions that may occur during the function execution
    console.error("Error in getGridId:", error);
    return null;
  }
}

/**
 * The main function that orchestrates the execution of the other functions.
 *
 * @param {object} geoJsonData - The GeoJSON data containing the Level 3 boundaries.
 * @param {string} countryCode - The country code to filter the Level 3 boundaries.
 * @param {array} coordinates - The coordinates to check against the Level 3 boundaries and grid cells.
 * @returns {object|null} - An object reprensenting The UUID of the grid cell that contains the provided coordinates and the feature of the matching Level 3 boundary, or null if not found.
 */
export function getUUID(
  geoJsonData: FeatureCollection,
  countryCode: string,
  coordinates: number[]
) {
  try {
    // Step 1: Retrieve the Level 3 boundary for the specified country code
    const level3Boundary = getLevel3Boundary(geoJsonData, coordinates);
    if (!level3Boundary) {
      console.log(
        "No matching Level 3 boundary found for the specified country code."
      );
      return null;
    }

    // Step 2: Create a grid of hexagonal cells within the Level 3 boundary
    const grid = createGrid(level3Boundary.feature, 0.025);

    // Step 4: Retrieve the ID and element of the grid cell that contains the provided coordinates
    const gridCellInfo = getGridId(grid, coordinates);
    if (!gridCellInfo) {
      console.log("No matching grid cell found for the provided coordinates.");
      return null;
    }

    // Construct the UUID from the grid cell information and the country code
    const { id: gridId, elt: gridBoundary } = gridCellInfo;
    const level3Id = level3Boundary.id;
    const uuid = `${countryCode}-${level3Id}-${gridId}`;

    // Return the UUID
    return { uuid, level3Boundary, gridBoundary };
  } catch (error) {
    // Handle any exceptions that may occur during the function execution
    console.error("Error in main:", error);
    return null;
  }
}

/**
 * Retrieves the grid cell coordinates for the specified UUID.
 *
 * @param {object} geoJsonData - The GeoJSON data containing the Level 3 boundaries.
 * @param {string} uuid - The UUID of the grid coordinates to retrieve.
 * @returns {object|null} - An object representing The GeoJSON polygon feature representing the grid cell and the feature of the matching Level 3 boundary, or null if not found.
 */
export function getGridCellFromUUID(geoJsonData: FeatureCollection, uuid: string) {
  try {
    // Split the UUID into its components
    const [countryCode, level3Id, gridId] = uuid.split("-");

    // Log the UUID components for debugging purposes
    console.log(
      "countryCode:",
      countryCode,
      "level3Id:",
      level3Id,
      "gridId:",
      gridId
    );

    // Retrieve the Level 3 zone feature from the GeoJSON data
    const level3Zone: Feature = geoJsonData.features[level3Id];

    // Create a grid of hexagonal cells within the Level 3 zone
    const grid = createGrid(level3Zone, 0.025);

    // Retrieve the grid cell corresponding to the provided grid ID
    const gridCell: Feature = grid[gridId];

    // Return the grid cell
    return { gridCell, level3Zone };
  } catch (error) {
    // Handle any exceptions that may occur during the function execution
    console.error("Error in getGridCellFromUUID:", error);
    return null;
  }
}

/**
 * The main function that orchestrates the execution of the other functions.
 *
 * @param {string} countryCode - The country code to filter the Level 3 boundaries.
 * @returns {object|null} geoJsonData - The GeoJSON data containing the Level 3 boundaries.
 */
export async function getCountryMap(countryCode: string) {
  const uri = process.env.NEXT_PUBLIC_MONGO_URI;
  const id = process.env.NEXT_PUBLIC_APP_ID;
  if (!uri || !id) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }
  
  const app = Realm.getApp(id)
  if (app && !app.currentUser) {
    const anonymousUser = Realm.Credentials.anonymous();
    app.logIn(anonymousUser);
  }
  //const client = new MongoClient(uri);
  try {
    let geoJsonMap = null;
    if (app?.currentUser) {
      const mongo = app?.currentUser?.mongoClient("mongodb-atlas");
      const database = mongo.db("coord")
      const countries = database.collection("countries");
      const country = await countries.findOne({ code:countryCode })
      if(country){
        geoJsonMap = country.map
      }
      if (!geoJsonMap) {
        console.log("No GeoJSON data found for the specified country code.");
        return null;
      }
      return { geoJsonMap };
    }
  
  } catch (error) {
    // Handle any exceptions that may occur during the function execution
    console.error("Error in main:", error);
    return null;
  }
}

export function camelCaseToSentence(str:string) {
  if(str){
    // Use a regular expression to split the string into an array of words
    const words = str.split(/(?=[A-Z])|[-]|(?=\d)/);
    // Capitalize the first letter of each word and join them into a sentence
    const sentence = words.map(word => {
      // Check if the word contains a number
      if (/\d/.test(word)) {
        // If the word contains a number, return it as is
        return word;
      } else {
        // Otherwise, capitalize the first letter
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
    }).join(' ');

    // Capitalize the first letter of each word and join them into a sentence
    return sentence
  }else{
    return str
  }
}
