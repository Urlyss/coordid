import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from "geojson";
import { useImmer } from "use-immer";
//@ts-ignore
import * as turf from "@turf/turf";
import { getCountryMap, getGridCellFromUUID, getUUID } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type MapState = {
    uuid: string;
    country: string;
    latlng: number[];
    displayLatlng: number[] | undefined;
    searchMode: boolean;
    loadingMap: boolean;
    addressDetail: {
        id?: number;
        feature: Feature<Geometry, GeoJsonProperties>;
      }
    | undefined;
    gridDetail: Feature<Geometry, GeoJsonProperties> | undefined;
    findUUID: () => void;
    findCoord: (arg0: string) => void;
    updateCountry: (arg0: string) => void;
    updatelatlng: (arg0: number[]) => void;
}

export function useMapState(): MapState {
  const [uuid, updateUuid] = useImmer("");
  const [country, updateCountry] = useImmer("");
  const [latlng, updatelatlng] = useImmer([0, 0]);
  const [displayLatlng, updatedisplayLatlng] = useImmer<number[] | undefined>(
    undefined
  );
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

  const router = useRouter()
  const searchParams = useSearchParams()
  const paramsUuid = searchParams.get('coordId') 
  
  useEffect(() => {
    if(paramsUuid != null && paramsUuid.length > 0){
      findCoord(paramsUuid)
    }else{
    findUUID()
    }
  }, [paramsUuid,latlng])

  const findUUID = async () => {
    console.log("findUUID")
    setTimeout(() => {
      updateLoadingMap(true);
    }, 3000);

    if(country.length > 0 && latlng[0] != 0 && latlng[1] != 0){
    const countryMap = await getCountryMap(country);
    if (countryMap == null) {
      toast.error("There was a problem with your request.", {
        action: {
          label: "Try again",
          onClick: () => {
            findUUID();
          },
        },
        duration: 60000,
      });
      return;
    }
    if (!countryMap) {
      updateLoadingMap(false);
      toast.error("Your country is not supported yet.");
      return;
    } else {
      const geoJSON = countryMap.geoJsonMap as unknown;
      const uuid = await getUUID(
        geoJSON as FeatureCollection<Geometry, GeoJsonProperties>,
        country,
        latlng
      );
      if (uuid) {
        toast.getHistory().forEach(item => toast.dismiss(item.id));
        updateUuid(uuid?.uuid);
        setAddressDetail(uuid.level3Boundary);
        setGridDetail(uuid.gridBoundary);
        updatedisplayLatlng(latlng)
        setTimeout(() => {
          updateLoadingMap(false);
        }, 2000);
      } else {
        updateLoadingMap(false);
        toast.error("There was a problem with your request.", {
          duration: 60000,
          action: {
            label: "Try again",
            onClick: () => {
              findUUID();
            },
          },
        });
        return;
      }
    }
}
  };

  const findCoord = async (uuidCoord: string) => {
    console.log("findCoord")
    router.push(`?coordId=${uuidCoord}`)
    updateLoadingMap(true);
    updateSearchMode(false);
    updatedisplayLatlng(undefined);
    updateUuid("");
    setAddressDetail(undefined);
    setGridDetail(undefined);
    const [country, boundaryId, gridId] = uuidCoord.split("-");
    if (country && boundaryId && gridId) {
      const countryMap = await getCountryMap(country);
      if (countryMap == null) {
        toast.error("There was a problem with your request.", {
          duration: 60000,
          action: {
            label: "Try again",
            onClick: () => {
              findCoord(uuidCoord);
            },
          },
        });
        return;
      }
      if (!countryMap) {
        updateLoadingMap(false);
        toast.error("Your country is not supported yet.");
        return;
      } else {
        const grid = await getGridCellFromUUID(
          countryMap.geoJsonMap,
          uuidCoord
        );
        if (grid && grid?.level3Zone && grid?.gridCell) {
            toast.getHistory().forEach(item => toast.dismiss(item.id));
          updateUuid(uuidCoord);
          setAddressDetail({ feature: grid?.level3Zone });
          setGridDetail(grid?.gridCell);
          updateSearchMode(true);
          var center = turf.center(grid?.gridCell);
          updatedisplayLatlng(center?.geometry?.coordinates?.reverse());
          setTimeout(() => {
            updateLoadingMap(false);
          }, 2000);
        } else {
          updateLoadingMap(false);
          toast.error("There was a problem with your request.", {
            duration: 60000,
            action: {
              label: "Try again",
              onClick: () => {
                findCoord(uuidCoord);
              },
            },
          });
          return;
        }
      }
    } else {
      updateLoadingMap(false);
      toast.error("Wrong Coord id.", {
        duration: 60000,
      });
      return;
    }
  };

  return {
    uuid,
    country,
    latlng,
    displayLatlng,
    searchMode,
    loadingMap,
    addressDetail,
    gridDetail,
    findUUID,
    findCoord,
    updateCountry,
    updatelatlng,
  };
}
