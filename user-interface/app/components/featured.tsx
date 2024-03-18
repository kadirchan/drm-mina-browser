"use client";
import React from "react";
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

export default function Featured() {
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
                    {Array.from({ length: 9 }).map((_, index) => (
                        <CarouselItem key={index} className="md:basis-full lg:basis-full">
                            <div className="p-2">
                                <Card>
                                    <CardContent className="flex items-center justify-center p-6 lg:aspect-video md:aspect-square">
                                        Image
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
