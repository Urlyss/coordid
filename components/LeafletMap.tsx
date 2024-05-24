"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses images from ~leaflet package
import "leaflet-defaulticon-compatibility";
import "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import "leaflet-spin/leaflet.spin"
import L, { LeafletMouseEvent, LocationEvent } from "leaflet";
import { LatLng } from "leaflet";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import * as countryCoder from "@rapideditor/country-coder";

function LocationMarker({
  updateLatlng,
  boundary,
  setCountry,
  customPosition = false,
}: {
  setCountry: (arg: string) => void;
  updateLatlng: (arg: number[]) => void;
  boundary: Feature<Geometry, GeoJsonProperties> | undefined;
  customPosition: boolean;
}) {
  const [position, setPosition] = useState<LatLng>();
  const map = useMap();

  map.on("locationfound", (e) => {
    geoLocate(e);
  });

  map.on("click", (e) => {
    geoLocate(e);
  });

  useEffect(() => {
    try {
      L.control
        .locate({
          position: "bottomright",
          flyTo: true,
          drawCircle: false,
          drawMarker: false,
          initialZoomLevel: map.getMaxZoom(),
          icon: "locate",
          iconLoading: "loading",
          iconElementTag: "div",
          strings: { title: "Find My Coord" },
        })
        .addTo(map);
    } catch (error) {
      console.error(error);
    }
    map.locate({ setView: true });
  }, []);

  useEffect(() => {
    //@ts-ignore
    map.spin(false);
    //@ts-ignore
    map.spin(true);
    const layer = L.geoJSON(boundary);
    let center = null;
    try {
      if (boundary) {
        center = layer.getBounds().getCenter();
        map.panTo(center);
        layer.addTo(map);
        if (customPosition) {
          setPosition(new LatLng(center.lat, center.lng));
        }
        map.flyToBounds(layer.getBounds());
        setTimeout(() => {
          //@ts-ignore
          map.spin(false);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    }

    return () => {
      map.removeLayer(layer);
    };
  }, [boundary]);

  const geoLocate = (e: LocationEvent | LeafletMouseEvent) => {
    try {
      const geolocation = countryCoder.feature([e.latlng.lng, e.latlng.lat]);
    setCountry(geolocation?.properties.iso1A3 || "");
    setPosition(e.latlng);
    updateLatlng([e.latlng.lng, e.latlng.lat]);
    map.flyTo(e.latlng, map.getMaxZoom());
    } catch (error) {
      console.error(error)
    }
  };

  return !position ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

const Map = ({
  updateLatlng,
  boundary,
  setCountry,
  customPosition = false,
}: {
  setCountry: (arg: string) => void;
  updateLatlng: (arg: number[]) => void;
  boundary: Feature<Geometry, GeoJsonProperties> | undefined;
  customPosition: boolean;
}) => {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    isMounted && (
      <>
        <MapContainer zoom={18} className="h-full z-10">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles dark:filter invert-[1] hue-rotate-180 brightness-[95%] contrast-[90%] filter-none"
          />
          <LocationMarker
            setCountry={setCountry}
            updateLatlng={updateLatlng}
            boundary={boundary}
            customPosition={customPosition}
          />
        </MapContainer>
      </>
    )
  );
};

export default Map;
