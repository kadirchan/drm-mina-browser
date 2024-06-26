"use client";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { useGamesStore } from "@/lib/stores/gameStore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const ENDPOINT = "http://localhost:8080/";

export default function Browse() {
    const router = useRouter();
    const params = useSearchParams().get("search") || "";
    const gameStore = useGamesStore();
    const [games, setGames] = useState<Game[]>([]);

    useEffect(
        () =>
            setGames(
                gameStore.games.filter((game) =>
                    game.name.toLowerCase().replace(" ", "").includes(params.toLowerCase())
                )
            ),
        [params]
    );

    return (
        <div className="grid grid-cols-4 gap-4 p-8">
            {games.map((game) => (
                <Card
                    key={game.gameId}
                    className=" aspect-square w-[300px] cursor-pointer mb-16"
                    onClick={() => router.push("/game-detail?" + game.name)}
                >
                    <CardContent className=" absolute p-4 flex justify-center items-center aspect-square w-[300px]">
                        <img
                            src={ENDPOINT + game.cover}
                            crossOrigin="anonymous"
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
            ))}
        </div>
    );
}
