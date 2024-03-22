"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import "./wishlist.css";
import { fetchGameData } from "@/lib/api";

const ENDPOINT = "http://165.227.156.229/";

export default function WishlistItems() {
    const [data, setData] = useState(new Array<Game>());

    useEffect(() => {
        fetchGameData().then((data) => setData(data));
    }, []);
    return (
        <div className=" flex w-full flex-wrap gap-4 justify-center">
            {data.map((game, index) => {
                return (
                    <Card
                        key={index}
                        className=" relative card-hover-effect aspect-square w-[300px] "
                    >
                        <CardContent className=" absolute flex justify-center items-center aspect-square w-[300px]">
                            <img
                                src={ENDPOINT + game.cover}
                                alt={game.name}
                                className="w-full h-full object-cover"
                            />
                        </CardContent>
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
