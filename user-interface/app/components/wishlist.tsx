"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import "./wishlist.css";
import { fetchGameData } from "@/lib/api";
import { useRouter } from "next/navigation";

const ENDPOINT = "http://localhost:8080/";

export default function WishlistItems() {
    const [data, setData] = useState(new Array<Game>());
    const router = useRouter();

    useEffect(() => {
        fetchGameData().then((data) => setData(data));
    }, []);
    return (
        <div className=" flex w-full flex-wrap gap-4 justify-center">
            {data.map((game, index) => {
                return (
                    <Card
                        key={index}
                        className=" card-hover-effect aspect-square w-[300px] cursor-pointer mb-16"
                        onClick={() => router.push("/game-detail?" + game.name)}
                    >
                        <CardContent className=" absolute p-4 flex justify-center items-center aspect-square w-[300px]">
                            <img
                                src={ENDPOINT + game.cover}
                                alt={game.name}
                                className="w-full flex h-full object-cover rounded-lg"
                            />
                        </CardContent>
                        <div className="flex flex-col gap-3 card-drawer bg-background h-full items-center p-3">
                            <CardTitle className="flex">{game.name}</CardTitle>
                            <CardDescription className=" flex">{game.description}</CardDescription>
                        </div>
                        <CardFooter className="flex justify-between mt-4">
                            <h3 className="text-lg font-medium">{game.name}</h3>
                            <h3 className="text-lg font-medium">{game.price}</h3>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
