"use client";
import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { TbMapPinSearch } from "react-icons/tb";
import { useRouter, useSearchParams } from "next/navigation";

export const SearchBar = ({
  findCoord
}: {
  findCoord: (arg: string) => void;
}) => {
  const [currentUuid, setCurrentUuid] = useState("");
  const searchParams = useSearchParams()

  
  const paramsUuid = searchParams.get('coordId') 
  useEffect(() => {
    if(paramsUuid != null && paramsUuid.length > 0){
      setCurrentUuid(paramsUuid)
    }
  }, [searchParams])
  
  const search = () => {
    if (currentUuid.length > 0) {
      findCoord(currentUuid)
    }
  };

  const onChangeUuid=(e:React.ChangeEvent<HTMLInputElement>)=>{
    setCurrentUuid(e.target.value)
  }

  return (
    <Card className={"flex justify-between items-center m-4 p-4 gap-6"}>
      <Input
        placeholder="Coord"
        className="border-0 border-b w-full"
        value={currentUuid}
        onChange={onChangeUuid}
      />
      <div>
        <Button className="w-full" onClick={search}>
          <TbMapPinSearch className="md:mr-2 h-4 w-4" /> Search
        </Button>
      </div>
    </Card>
  );
};
