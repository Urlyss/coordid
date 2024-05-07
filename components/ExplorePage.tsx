"use client";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { useImmer } from "use-immer";
import { getCountryMap, getGridCellFromUUID, getUUID } from "@/lib/utils";
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from "geojson";
import { useToast } from "./ui/use-toast";
import { ToastAction } from "./ui/toast";
import * as turf from "@turf/turf";
import { useIsOnline } from 'react-use-is-online';




export const ExplorePage = () => {
  const { toast } = useToast();
  const { isOnline, isOffline, error } = useIsOnline();

  const Map = React.useMemo(
    () => dynamic(() => import("@/components/Map"), { ssr: false }),
    []
  );
  const [uuid, updateUuid] = useImmer("");
  const [country, updateCountry] = useImmer("");
  const [latlng, updatelatlng] = useImmer([0, 0]);
  const [displayLatlng, updatedisplayLatlng] = useImmer<number[]|undefined>(undefined);
  const [customPos, updatecustomPos] = useImmer(false);
  const [addressDetail, setAddressDetail] = useImmer<
    | {
        id?: number;
        feature: Feature<Geometry, GeoJsonProperties>;
      }
    | undefined
  >(undefined);
  const [gridDetail, setGridDetail] = useImmer<
    Feature<Geometry, GeoJsonProperties> | undefined
  >(undefined);


  useEffect(() => {
    if (latlng[0] != 0 && latlng[1] != 0) {
      updateUuid("");
      updatedisplayLatlng(latlng)
      updatecustomPos(false)
      setAddressDetail(undefined);
      setGridDetail(undefined);
      findUUID();
    }
  }, [latlng]);

  const findUUID = async () => {
    const countryMap = await getCountryMap(country);
    if (countryMap != null) {
      const geoJSON = countryMap.geoJsonMap as unknown;
      const uuid = getUUID(
        geoJSON as FeatureCollection<Geometry, GeoJsonProperties>,
        country,
        latlng
      );
      if (uuid) {
        updateUuid(uuid?.uuid);
        setAddressDetail(uuid.level3Boundary);
        setGridDetail(uuid.gridBoundary);
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
          action: (
            <ToastAction altText="Try again" onClick={() => findUUID()}>
              Try again
            </ToastAction>
          ),
        });
      }
    } else {
      return toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Your country is not supported yet.",
      });
    }
  };

  const findCoord = async (uuidCoord: string) => {
    updatedisplayLatlng(undefined)
    updateUuid("");
    setAddressDetail(undefined);
    setGridDetail(undefined);
    const [country, boundaryId, gridId] = uuidCoord.split("-");
    if (country && boundaryId && gridId) {
      const countryMap = await getCountryMap(country);
      if (countryMap != null) {
        const grid = getGridCellFromUUID(countryMap.geoJsonMap, uuidCoord);
        if (grid && grid?.level3Zone && grid?.gridCell) {
          updateUuid(uuidCoord);
          setAddressDetail({ feature: grid?.level3Zone });
          setGridDetail(grid?.gridCell);
          updatecustomPos(true)
          var center = turf.center(grid?.gridCell);
          updatedisplayLatlng(center?.geometry?.coordinates?.reverse())
        } else {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
            action: (
              <ToastAction altText="Try again" onClick={() => findUUID()}>
                Try again
              </ToastAction>
            ),
          });
        }
      } else {
        return toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Your country is not supported yet.",
        });
      }
    } else {
      return toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Wrong Coord id.",
      });
    }
  };
  
  
  
  
  return (
    <Suspense>
      {isOffline && <div className="bg-destructive w-full h-4 p-3 flex justify-center items-center text-destructive-foreground text-sm">You seems to be offline.</div>}
      <SearchBar findCoord={findCoord}/>
      <div className="flex md:flex-row flex-col-reverse gap-4 m-4 max-w-full md:h-[70dvh] h-dvh">
        <aside className="h-full flex-[20%] w-full">
          <Sidebar
            className="h-full p-2 overflow-auto"
            uuid={uuid}
            latlng={displayLatlng}
            address={addressDetail}
          />
        </aside>
        <main className="w-full flex-[80%] h-full">
          <Card className={"h-full w-full"} id="map">
            {Map ? (
              <Map
                setCountry={updateCountry}
                updateLatlng={updatelatlng}
                boundary={gridDetail}
                customPosition={customPos}
              />
            ) : (
              <div>Loading Map</div>
            )}
          </Card>
        </main>
      </div>
    </Suspense>
  );
};
