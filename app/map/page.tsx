import { ExplorePage } from "@/components/ExplorePage";
import { getCountryMap, getGridCellFromUUID, getUUID } from "@/lib/utils";
import { FeatureCollection } from "geojson";
import { Db, MongoClient } from "mongodb";
import React from "react";

let instance: Db | null = null;

async function getMongoDBInstance(): Promise<Db | null> {
  if (instance) {
    return instance;
  }

  const uri = process.env.MONGO_URI || ""
  const dbName = 'coord';

  try {
    const client = await MongoClient.connect(uri);
    instance = client.db(dbName);
    return instance;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    return null;
  }
}

async function getCountryMapSSR(countryCode: string){
  "use server"
  const client = await getMongoDBInstance()
  return await getCountryMap(countryCode,client)
}

async function getGridCellFromUUIDSSR(geoJsonData: FeatureCollection, uuid: string){
  "use server"
  return getGridCellFromUUID(geoJsonData, uuid)
}

async function getUUIDSSR(geoJsonData: FeatureCollection, countryCode: string, coordinates: number[]){
  "use server"
  return getUUID(geoJsonData, countryCode,coordinates)
}

const page = () => {
  return (
    <ExplorePage 
    getCountryMap={getCountryMapSSR} 
    getGridCellFromUUID={getGridCellFromUUIDSSR}
    getUUID={getUUIDSSR}
    />
  );
};

export default page;
