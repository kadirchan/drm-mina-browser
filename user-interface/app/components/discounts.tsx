"use client";
import React, { useMemo } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardFooter, CardShadow, CardTitle } from "@/components/ui/card";
import { fetchGameData } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useGamesStore } from "@/lib/stores/gameStore";
import GameBookmark from "./bookmark";
import DiscountRate from "./discountRate";

const ENDPOINT = "http://localhost:8080/";

export default function Discounts() {
    const gameStore = useGamesStore();

    const router = useRouter();

    useMemo(() => {
        fetchGameData().then((data) => {
            data = data.filter((game: Game) => game.discount > 0);
            gameStore.setDiscountGames(data);
        });
    }, []);

    return (
        <div className="row-span-1 col-span-3 lg:col-span-5 flex justify-center">
            <Carousel
                plugins={[
                    Autoplay({
                        delay: 6000,
                    }),
                ]}
                opts={{
                    align: "start",
                }}
                className="w-full p-4 max-w-4xl justify-center"
            >
                <h3 className="mb-2 mt-2 text-lg font-medium tracking-tight">On Discount</h3>
                <CarouselContent>
                    {Array.from(gameStore.discountGames).map((game, index) => (
                        <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/3">
                            <div className="p-2">
                                <Card
                                    className=" overflow-hidden cursor-pointer"
                                    onClick={() => router.push("/game-detail?game=" + game.name)}
                                >
                                    <CardContent className="relative flex items-center justify-center p-6 lg:aspect-3/4 md:aspect-square">
                                        <img
                                            src={ENDPOINT + game.cover}
                                            crossOrigin="anonymous"
                                            alt={game.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <DiscountRate game={game} />
                                        <GameBookmark gameId={game.gameId} />
                                    </CardContent>
                                    <CardFooter className="w-</CardContent>full flex justify-between">
                                        <CardTitle className=" text-base">{game.name}</CardTitle>
                                        <CardShadow className=" flex flex-col justify-center items-start px-3 rounded-sm">
                                            <span className=" text-xs strikethrough text-gray-500">
                                                &nbsp;{game?.price}&nbsp;
                                            </span>
                                            <div className="flex justify-center items-center gap-1">
                                                <span className=" text-lg">
                                                    {game?.price - game?.discount}
                                                </span>
                                                <img
                                                    src={"/mina.png"}
                                                    alt="mina"
                                                    className=" w-4 h-4 inline-block"
                                                />
                                            </div>
                                        </CardShadow>
                                    </CardFooter>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    );
}
