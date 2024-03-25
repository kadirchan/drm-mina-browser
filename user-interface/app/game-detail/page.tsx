"use client";
import React from "react";

import Autoplay from "embla-carousel-autoplay";
import { useRouter, useSearchParams } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ChevronLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GameDetail() {
    const gameId = useSearchParams();
    const router = useRouter();

    return (
        <div>
            <div className=" grid grid-cols-5 w-full p-4">
                <div className=" col-span-3 h-full mt-8">
                    <Button variant={"outline"} onClick={() => router.back()} className=" ml-4">
                        <ChevronLeft size={24} /> Back to Store
                    </Button>
                    <Carousel
                        plugins={[
                            Autoplay({
                                delay: 5000,
                            }),
                        ]}
                        opts={{
                            align: "start",
                        }}
                        className="w-full p-4 justify-center"
                    >
                        <CarouselContent>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <CarouselItem key={i}>
                                    <img
                                        src="https://via.placeholder.com/1920x1080"
                                        alt="Game"
                                        className="w-full h-full object-cover"
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </div>
                <div className=" h-full col-span-2">
                    <div className=" flex flex-col items-center h-full p-8 mt-8 justify-between">
                        <h1 className=" text-3xl font-bold p-4">Game Title</h1>
                        <p className=" text-lg mt-8">Game Description</p>
                        <div className="flex flex-col items-center gap-4 ">
                            <div className=" flex flex-row mt-8 p-2 gap-4 border border-gray-300 rounded-lg">
                                <div className=" flex gap-1 justify-center items-center ">
                                    <div className=" text-lg text-green-600 bg-green-900 rounded-lg p-1">
                                        -%20
                                    </div>
                                    <span className="text-base line-through text-gray-600 px-2">
                                        15
                                    </span>
                                    <span className="text-base">10</span>
                                    <img
                                        src={"/mina.png"}
                                        alt="mina"
                                        className=" w-4 h-4 inline-block"
                                    />
                                </div>
                                <Button variant={"default"} className="">
                                    Buy Game
                                </Button>
                            </div>
                            <Button variant={"link"} className="">
                                <Download size={24} />
                                Download Game
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
