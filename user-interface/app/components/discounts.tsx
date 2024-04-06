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
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";
import { fetchGameData, toggleGameWishlist } from "@/lib/api";
import { useRouter } from "next/navigation";
// import { shuffleArray } from "@/lib/helpers";
import { useGamesStore } from "@/lib/stores/gameStore";
import { useUserStore } from "@/lib/stores/userWallet";
import GameBookmark from "./bookmark";
import DiscountRate from "./discountRate";

const ENDPOINT = "http://localhost:8080/";

export default function Discounts() {
    const { toast } = useToast();
    const gameStore = useGamesStore();
    const userStore = useUserStore();

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
                                        <Button
                                            onClick={(e) => {
                                                toast({
                                                    description: "Soon",
                                                });
                                                e.stopPropagation();
                                            }}
                                        >
                                            {game.price - game.discount + " Mina"}
                                        </Button>
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
