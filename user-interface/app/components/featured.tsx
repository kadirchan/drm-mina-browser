"use client";
import React, { useEffect, useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNextBig,
    CarouselPreviousBig,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchGameData } from "@/lib/api";

const ENDPOINT = "http://165.227.156.229/";

export default function Featured() {
    const [data, setData] = useState(new Array<Game>());

    useEffect(() => {
        fetchGameData().then((data) => setData(data));
    }, []);
    return (
        <div className="row-span-1 col-span-3 lg:col-span-5 flex justify-center py-8">
            <Carousel
                plugins={[
                    Autoplay({
                        delay: 4000,
                    }),
                ]}
                opts={{
                    align: "start",
                }}
                className="w-full p-4 max-w-2xl justify-center"
            >
                <h3 className="mb-2 text-lg font-medium tracking-tight">Featured Games</h3>
                <CarouselContent>
                    {Array.from(data).map((game, index) => (
                        <CarouselItem key={index} className="md:basis-full lg:basis-full">
                            <div className="p-2">
                                <Card className=" overflow-hidden">
                                    <CardContent className="flex items-center justify-center p-6 lg:aspect-video md:aspect-square">
                                        <img
                                            src={ENDPOINT + game.cover}
                                            alt={game.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </CardContent>
                                    <CardFooter className="w-full flex justify-between">
                                        <CardDescription>Description</CardDescription>
                                        <Button
                                            onClick={() => {
                                                console.log("Game bought");
                                                toast("Game bought", {
                                                    description: "You have bought the game",
                                                    action: {
                                                        label: "Undo",
                                                        onClick: () => console.log("Undo"),
                                                    },
                                                });
                                            }}
                                        >
                                            {"Buy For: " + " $"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPreviousBig />
                <CarouselNextBig />
            </Carousel>
        </div>
    );
}
