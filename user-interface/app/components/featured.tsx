"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNextBig,
    CarouselPreviousBig,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchGameData, fetchWishlist } from "@/lib/api";
import { useRouter } from "next/navigation";
// import { shuffleArray } from "@/lib/helpers";
import { useGamesStore } from "@/lib/stores/gameStore";
import GameBookmark from "./bookmark";
import DiscountRate from "./discountRate";
import { useToast } from "@/components/ui/use-toast";

const ENDPOINT = "http://localhost:8080/";

export default function Featured() {
    const gameStore = useGamesStore();
    const router = useRouter();
    const { toast } = useToast();

    useMemo(() => {
        fetchGameData().then((data) => gameStore.setGames(data));
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
                    {Array.from(gameStore.games).map((game, index) => (
                        <CarouselItem key={index} className="md:basis-full lg:basis-full">
                            <div className="p-2">
                                <Card
                                    className=" overflow-hidden cursor-pointer"
                                    onClick={() => router.push("/game-detail?game=" + game.name)}
                                >
                                    <CardContent className="flex items-center justify-center p-6 lg:aspect-video md:aspect-square relative">
                                        <img
                                            src={ENDPOINT + game.cover}
                                            crossOrigin="anonymous"
                                            alt={game.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <DiscountRate variant={"bg"} game={game} />
                                        <GameBookmark className=" h-8 w-8" gameId={game.gameId} />
                                    </CardContent>
                                    <CardFooter className="w-full flex justify-between">
                                        <CardTitle>{game.name}</CardTitle>
                                        <div className=" flex flex-row mt-8 p-2 gap-3">
                                            <div className=" flex gap-1 justify-center items-center bg-gray-800 px-3 rounded-sm">
                                                {game?.discount || 0 > 0 ? (
                                                    <span className="text-base strikethrough text-gray-500 px-2">
                                                        {game?.price}
                                                    </span>
                                                ) : (
                                                    <></>
                                                )}
                                                <span className=" text-xl">
                                                    {game?.price - game?.discount}
                                                </span>
                                                <img
                                                    src={"/mina.png"}
                                                    alt="mina"
                                                    className=" w-5 h-5 inline-block"
                                                />
                                            </div>
                                            <Button
                                                variant={"default"}
                                                onClick={(e) => {
                                                    toast({
                                                        description: "Soon",
                                                    });
                                                    e.stopPropagation();
                                                }}
                                            >
                                                Buy Game
                                            </Button>
                                        </div>
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
