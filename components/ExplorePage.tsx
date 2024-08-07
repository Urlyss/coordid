"use client";
import React, { Suspense,  useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { useImmer } from "use-immer";
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from "geojson";
import { useToast } from "./ui/use-toast";
import { ToastAction } from "./ui/toast";
//@ts-ignore
import * as turf from "@turf/turf";
import { useIsOnline } from 'react-use-is-online';




export const ExplorePage = ({
  getCountryMap,
  getUUID,
  getGridCellFromUUID
}:{
  getCountryMap:(countryCode: string)=> Promise<{geoJsonMap: any;} | null | undefined>
  getUUID:(geoJsonData: FeatureCollection, countryCode: string, coordinates:number[])=> Promise<{
    uuid: string;
    level3Boundary: {id: number;feature: Feature<Geometry, GeoJsonProperties>;};
    gridBoundary: Feature;
} | null>
  getGridCellFromUUID:(geoJsonData: FeatureCollection, uuid: string)=> Promise<{
    gridCell: Feature<Geometry, GeoJsonProperties>;
    level3Zone: Feature<Geometry, GeoJsonProperties>;
} | null>
}) => {
  const { toast } = useToast();
  const { isOnline, isOffline, error } = useIsOnline();

  const CustomMap = React.useMemo(
    () => dynamic(() => import("./CustomMap"), { ssr: false }),
    []
  );
  const [uuid, updateUuid] = useImmer("");
  const [country, updateCountry] = useImmer("");
  const [latlng, updatelatlng] = useImmer([0, 0]);
  const [displayLatlng, updatedisplayLatlng] = useImmer<number[]|undefined>(undefined);
  const [searchMode, updateSearchMode] = useImmer(false);
  const [loadingMap, updateLoadingMap] = useImmer(false);
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
      updateSearchMode(false)
      setAddressDetail(undefined);
      setGridDetail(undefined);
      findUUID();
    }
  }, [latlng]);

  const findUUID = async () => {
    setTimeout(() => {
      updateLoadingMap(true)
    }, 3000);
    
      const countryMap = await getCountryMap(country);
      if(countryMap == null){
          return toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
            action: (
              <ToastAction altText="Try again" onClick={() => findUUID()}>
                Try again
              </ToastAction>
            ),
            duration:60000
          });
      }
      if(!countryMap ) {
    updateLoadingMap(false)
        return toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Your country is not supported yet.",
        });
      }else {
        const geoJSON = countryMap.geoJsonMap as unknown;
        const uuid = await getUUID(
          geoJSON as FeatureCollection<Geometry, GeoJsonProperties>,
          country,
          latlng
        );
        if (uuid) {
          updateUuid(uuid?.uuid);
          setAddressDetail(uuid.level3Boundary);
          setGridDetail(uuid.gridBoundary);
          setTimeout(() => {
            updateLoadingMap(false)
          }, 2000);
        } else {
    updateLoadingMap(false)
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
            action: (
              <ToastAction altText="Try again" onClick={() => findUUID()}>
                Try again
              </ToastAction>
            ),
            duration:60000
          });
        }
    }
  };

  const findCoord = async (uuidCoord: string) => {
    updateLoadingMap(true)
    updateSearchMode(false)
    updatedisplayLatlng(undefined)
    updateUuid("");
    setAddressDetail(undefined);
    setGridDetail(undefined);
    const [country, boundaryId, gridId] = uuidCoord.split("-");
    if (country && boundaryId && gridId) {
      const countryMap = await getCountryMap(country);
      if(countryMap == null){
        return toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
          action: (
            <ToastAction altText="Try again" onClick={() => findUUID()}>
              Try again
            </ToastAction>
          ),
          duration:60000
        });
    }
    if(!countryMap ) {
      updateLoadingMap(false)
        return toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Your country is not supported yet.",
        });
    }
      else{
        const grid = await getGridCellFromUUID(countryMap.geoJsonMap, uuidCoord);
        if (grid && grid?.level3Zone && grid?.gridCell) {
          updateUuid(uuidCoord);
          setAddressDetail({ feature: grid?.level3Zone });
          setGridDetail(grid?.gridCell);
          updateSearchMode(true)
          var center = turf.center(grid?.gridCell);
          updatedisplayLatlng(center?.geometry?.coordinates?.reverse())
          setTimeout(() => {
            updateLoadingMap(false)
          }, 2000);
        } else {
          updateLoadingMap(false)
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
      } 
    } else {
    updateLoadingMap(false)
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
      <div className="flex lg:flex-row flex-col-reverse gap-4 m-4 max-w-full lg:h-[70dvh]">
        <aside className="h-full flex-1 w-full">
          <Sidebar
            className="h-full p-2 overflow-auto"
            uuid={uuid}
            latlng={displayLatlng}
            address={addressDetail}
          />
        </aside>
        <main className="w-full flex-[3]">
          <Card className={"h-full w-full relative"} id="map">
            {CustomMap ? (
              <CustomMap
                setCountry={updateCountry}
                updateLatlng={updatelatlng}
                boundary={gridDetail}
                searchMode={searchMode}
                customPosition={displayLatlng}
                loading={loadingMap}
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
