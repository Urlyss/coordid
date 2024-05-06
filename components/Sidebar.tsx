import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { camelCaseToSentence, cn } from "@/lib/utils";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { FaFlag, FaGlobe, FaMapMarkerAlt, FaRegCopy } from "react-icons/fa";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "./ui/use-toast";
import { useState } from "react";
import { LucideCopy, LucideCopyCheck } from "lucide-react";
import { Badge } from "./ui/badge";

type CardProps = React.ComponentProps<typeof Card>;

export function Sidebar({
  className,
  uuid,
  latlng,
  address,
}: {
  className: string;
  uuid: string;
  latlng: number[] | undefined;
  address:
    | {
        id?: number;
        feature: Feature<Geometry, GeoJsonProperties>;
      }
    | undefined;
}) {
  const { toast } = useToast();
  const [currentIcon,setCurrentIcon] = useState(<LucideCopy className="h-4 w-4" />)
  const onCopy = (txt: string) => {
    setCurrentIcon(<LucideCopyCheck className="h-4 w-4" />)
    navigator.clipboard.writeText(txt);
    toast({
      description: "Your ID has been copied.",
      style:{backgroundColor:"rgba(0,255,0,0.2)"},
    });
    setTimeout(() => {
      setCurrentIcon(<LucideCopy className="h-4 w-4" />)
    }, 3000);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>
          {uuid.length > 0 ? (
            <div className="flex justify-between items-center">
              {uuid}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onCopy(uuid)}
                    >
                      {currentIcon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Click to copy</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <Skeleton className="h-6 w-full" />
          )}
        </CardTitle>
        <CardDescription>Details of the address.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <FaFlag />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Country</p>
            {!address ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {camelCaseToSentence(address.feature.properties?.COUNTRY)}
              </p>
            )}
          </div>
        </div>
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <FaGlobe className="opacity-100" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Level 1 Administrative area
            </p>
            {!address ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {camelCaseToSentence(address.feature.properties?.NAME_1)}
              </p>
            )}
          </div>
        </div>
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <FaGlobe className="opacity-70" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Level 2 Administrative area
            </p>
            {!address ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {camelCaseToSentence(address.feature.properties?.NAME_2)}
              </p>
            )}
          </div>
        </div>
        <div
          className={`flex items-center space-x-4 rounded-md border p-4 ${
            !address?.feature.properties?.NAME_3 && "hidden"
          }`}
        >
          <FaGlobe className="opacity-50" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Level 3 Administrative area
            </p>
            {!address ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {camelCaseToSentence(address.feature.properties?.NAME_3)}
              </p>
            )}
          </div>
        </div>
        <div
          className={`flex items-center space-x-4 rounded-md border p-4 ${
            !address?.feature.properties?.NAME_4 && "hidden"
          }`}
        >
          <FaGlobe className="opacity-50" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Level 4 Administrative area
            </p>
            {!address ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {camelCaseToSentence(address.feature.properties?.NAME_4)}
              </p>
            )}
          </div>
        </div>
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <FaMapMarkerAlt />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Coordinates</p>
            {!latlng ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {`Lng: ${latlng[0]}`}
                <br />
                {`Lat: ${latlng[1]}`}
              </p>
            )}
          </div>
        </div>
        <Button disabled className="flex justify-around">Claim that ID<Badge variant="secondary">Soon</Badge></Button>
      </CardContent>
    </Card>
  );
}
