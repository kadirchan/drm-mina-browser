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
import { toast } from "sonner";
import { fetchGameData, fetchWishlist } from "@/lib/api";
import WalletAccount from "@/lib/walletData";
import { useRouter } from "next/navigation";
import { shuffleArray } from "@/lib/helpers";

const ENDPOINT = "http://localhost:8080/";

export default function Featured() {
    const [data, setData] = useState(new Array<Game>());
    const [wishlist, setWishlist] = useState(new Array<Game>());

    const router = useRouter();

    const updateWishlist = () => {
        fetchWishlist(WalletAccount.getWalletData().address || "123123").then((data) =>
            setWishlist(data)
        );
    };

    useMemo(() => {
        fetchGameData().then((data) => setData(data));
        updateWishlist();
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
                    {shuffleArray(Array.from(data)).map((game, index) => (
                        <CarouselItem key={index} className="md:basis-full lg:basis-full">
                            <div className="p-2">
                                <Card
                                    className=" overflow-hidden"
                                    onClick={() => router.push("/game-detail?" + game.name)}
                                >
                                    <CardContent className="flex items-center justify-center p-6 lg:aspect-video md:aspect-square">
                                        <img
                                            src={ENDPOINT + game.cover}
                                            alt={game.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </CardContent>
                                    <CardFooter className="w-full flex justify-between">
                                        <CardTitle>{game.name}</CardTitle>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
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
                                            {"Buy For: " + (game.price - game.discount) + " Mina"}
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
