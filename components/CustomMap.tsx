"use client";
import React, { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { GeoJsonProperties, Geometry, Feature } from "geojson";
import mapboxgl, { LngLat, LngLatLike,  MapMouseEvent } from "mapbox-gl";
import * as countryCoder from "@rapideditor/country-coder";

const CustomMap = ({
  updateLatlng,
  boundary,
  setCountry,
  customPosition = undefined,
  searchMode = false,
  loading = false
}: {
  setCountry: (arg: string) => void;
  updateLatlng: (arg: number[]) => void;
  boundary: Feature<Geometry, GeoJsonProperties> | undefined;
  customPosition: number[] | undefined;
  searchMode: boolean;
  loading: boolean;
}) => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const mapContainer = useRef(null);
  const map = useRef(null);
  const zoom = 16;
  const [position, setPosition] = useState<LngLatLike>();

  useEffect(() => {
    if (map.current) return; // initialize map only once
    try {
        //@ts-ignore
        map.current = new mapboxgl.Map({
            //@ts-ignore
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            zoom: zoom,
          });

          const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            showUserLocation: false,
          });
          const zoomCtrl = new mapboxgl.NavigationControl({ showZoom: true })
          //@ts-ignore
          map.current.addControl(geolocate);
          //@ts-ignore
          map.current.addControl(zoomCtrl);
          geolocate.on("geolocate", (data) => {
            if (data) {
              geoLocateCallback(data as GeolocationPosition);
            }
          });
          
          map.current &&
          //@ts-ignore
            map.current.on("load", () => {
              geolocate.trigger();
            });
            map.current &&
            //@ts-ignore
            map.current.on("click", function (ev: MapMouseEvent) {
              geoLocateCallback(ev.lngLat);
            });

    } catch (error) {
        console.error(error)
    }
  });

  const geoLocateCallback = (e: GeolocationPosition | LngLat) => {
    try {
      let coordinates;
      if ("coords" in e) {
        coordinates = new mapboxgl.LngLat(
          e.coords.longitude,
          e.coords.latitude
        );
      } else if ("lng" in e) {
        coordinates = e;
      }
      const geolocation = countryCoder.feature([
        coordinates!.lng,
        coordinates!.lat,
      ]);
      setCountry(geolocation?.properties.iso1A3 || "");
      setPosition(coordinates);
      updateLatlng([coordinates!.lng, coordinates!.lat]);
      map.current &&
      //@ts-ignore
        map.current.flyTo({
          center: coordinates,
          zoom: zoom,
          essential: true, // this animation is considered essential with respect to prefers-reduced-motion
        });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let marker = null;
    if (map.current && position) {
      marker = new mapboxgl.Marker().setLngLat(position).addTo(map.current);
    }
    return () => {
      marker != null && marker.remove();
    };
  }, [position]);

  useEffect(() => {
    let source = null;
    if (boundary && map.current) {
      if (searchMode && customPosition) {
        const pos = new mapboxgl.LngLat(customPosition[1], customPosition[0]);
        setPosition(pos);
        //@ts-ignore
        map.current.flyTo({
          center: pos,
          zoom: zoom,
          essential: true, // this animation is considered essential with respect to prefers-reduced-motion
        });
      }

      //@ts-ignore
      const currentSource = map.current.getSource("boundary");
      if (currentSource) {
        //@ts-ignore
        map.current.removeSource("boundary");
      }
      // Define a source before using it to create a new layer
      //@ts-ignore
      source = map.current.addSource("boundary", {
        type: "geojson",
        data: boundary,
      });

      // Add a new layer to visualize the polygon.
      //@ts-ignore
      map.current.addLayer({
        id: "polygon",
        type: "fill",
        source: "boundary", // reference the data source
        layout: {},
        paint: {
          "fill-color": "#0080ff", // blue color fill
          "fill-opacity": 0.5,
        },
      });
      // Add a black outline around the polygon.
      //@ts-ignore
      map.current.addLayer({
        id: "outline",
        type: "line",
        source: "boundary",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      });
    }
    
    return () => {
      if (source != null) {
        //@ts-ignore
        map.current && map.current.removeLayer("polygon");
        //@ts-ignore
        map.current && map.current.removeLayer("outline");
      }
    };
  }, [boundary]);

  return (
    <>
      <div ref={mapContainer} className="map-container lg:h-full z-10 min-h-[60dvh]" />
      {loading && (
        <div
          id="loader"
          className="rounded-lg w-full h-full absolute top-0 left-0 z-20 bg-primary/80 backdrop-blur-[1px] flex justify-center items-center"
        >
          <div className="border-[16px] border-solid border-secondary border-t-[16px] border-t-solid border-t-primary rounded-full w-32 h-32 animate-spin m-auto"></div>
        </div>
      )}
    </>
  );
};

export default CustomMap;
