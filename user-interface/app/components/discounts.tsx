"use client";
import React from "react";
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
import { toggleGameWishlist } from "@/lib/api";
import WalletAccount from "@/lib/walletData";

export default function Discounts() {
    const { toast } = useToast();

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
                    {Array.from({ length: 9 }).map((_, index) => (
                        <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/3">
                            <div className="p-2">
                                <Card>
                                    <CardContent className="relative flex items-center justify-center p-6 lg:aspect-3/4 md:aspect-square">
                                        Image
                                        <Badge className="absolute top-2 left-2 text-sm font-normal bg-green-500 hover:bg-green-400">
                                            -60%
                                        </Badge>
                                        <Bookmark
                                            className=" absolute top-2 right-2 w-6 h-6 cursor-pointer "
                                            onClick={() => {
                                                toggleGameWishlist(
                                                    WalletAccount.getWalletData().address ||
                                                        "123123",
                                                    index
                                                );
                                                toast({ description: "Added to wishlist" });
                                            }}
                                        ></Bookmark>
                                    </CardContent>
                                    <CardFooter className="w-full flex justify-between">
                                        <CardDescription>Description</CardDescription>
                                        <Button
                                            onClick={() => {
                                                toast({
                                                    description: "You have bought the game",
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
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    );
}
