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
//@ts-ignore
import * as turf from "@turf/turf";
import { useIsOnline } from 'react-use-is-online';
import { toast } from "sonner";
import { getCountryMap } from "@/lib/utils";
import { useMapState } from "@/lib/hooks/useMapState";




export const ExplorePage = () => {
  const {  isOffline } = useIsOnline();

  const CustomMap = React.useMemo(
    () => dynamic(() => import("./CustomMap"), { ssr: false }),
    []
  );
  const { uuid, displayLatlng, searchMode, loadingMap, addressDetail, gridDetail, findCoord,updateCountry,updatelatlng } = useMapState();
  
  
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
