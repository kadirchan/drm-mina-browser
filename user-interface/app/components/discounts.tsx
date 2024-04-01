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
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";
import { fetchGameData, toggleGameWishlist } from "@/lib/api";
import { useRouter } from "next/navigation";
// import { shuffleArray } from "@/lib/helpers";
import { useGamesStore } from "@/lib/stores/gameStore";
import { useUserStore } from "@/lib/stores/userWallet";

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
                                            alt={game.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <Badge className="absolute top-2 left-2 text-sm font-normal bg-green-500 hover:bg-green-400">
                                            {"- " +
                                                Math.floor((game.discount / game.price) * 100) +
                                                "%"}
                                        </Badge>
                                        <Bookmark
                                            className=" absolute top-2 right-2 w-6 h-6 cursor-pointer "
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (userStore.isConnected) {
                                                    const status = await toggleGameWishlist(
                                                        // @ts-ignore
                                                        userStore.userPublicKey,
                                                        index
                                                    );
                                                    console.log(status);
                                                    if (!status) {
                                                        toast({
                                                            description: "Removed from wishlist",
                                                        });
                                                        // TODO fill none
                                                    } else {
                                                        toast({ description: "Added to wishlist" });
                                                        // TODO fill white
                                                    }
                                                } else {
                                                    toast({
                                                        description: "Please connect your wallet",
                                                    });
                                                }
                                            }}
                                        ></Bookmark>
                                    </CardContent>
                                    <CardFooter className="w-</CardContent>full flex justify-between">
                                        <CardDescription>{game.name}</CardDescription>
                                        <Button
                                            onClick={() => {
                                                toast({
                                                    description: "You have bought the game",
                                                });
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
