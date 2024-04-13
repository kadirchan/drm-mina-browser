"use client";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import "./wishlist.css";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/userWallet";
import { useGamesStore } from "@/lib/stores/gameStore";
import { useEffect } from "react";
import { fetchWishlist } from "@/lib/api";

export default function WishlistItems() {
    const router = useRouter();

    const gameStore = useGamesStore();

    const userStore = useUserStore();

    useEffect(() => {
        if (userStore.isConnected) {
            fetchWishlist(userStore.userPublicKey || "").then((data) => {
                userStore.setWishlist(data);
            });
        }
    }, []);

    return (
        <div className=" flex w-full flex-wrap gap-4 justify-center">
            {gameStore.games
                .filter((game: Game) => userStore.wishlist.includes(game.gameId))
                .map((game, index) => {
                    return (
                        <Card
                            key={index}
                            className=" card-hover-effect aspect-square w-[300px] cursor-pointer mb-16"
                            onClick={() => router.push("/game-detail?game=" + game.name)}
                        >
                            <CardContent className=" absolute p-4 flex justify-center items-center aspect-square w-[300px]">
                                <img
                                    src={process.env.NEXT_PUBLIC_ENDPOINT + game.cover}
                                    crossOrigin="anonymous"
                                    alt={game.name}
                                    className="w-full flex h-full object-cover rounded-lg card-image"
                                />
                            </CardContent>
                            <div className="flex flex-col gap-3 card-drawer bg-background h-full items-center p-3">
                                <CardTitle className="flex">{game.name}</CardTitle>
                                <CardDescription className=" flex">
                                    {game.description}
                                </CardDescription>
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
