"use client";
import React from "react";
import { useRouter } from "next/navigation";
import WishlistItems from "../components/wishlist";

export default function Wishlist() {
    const [wishlist, setWishlist] = React.useState([]);
    const router = useRouter();

    return (
        <div className=" p-8">
            {wishlist.length === 1 ? (
                <div className=" flex w-full justify-center ">
                    <h2 className="mb-2 text-lg font-medium tracking-tight">
                        Your Wishlist Is Empty
                    </h2>

                    <h3
                        className="mb-2 text-lg absolute align-middle top-1/2 font-medium tracking-tight underline underline-offset-2 hover:underline-offset-4 cursor-pointer"
                        onClick={() => router.push("/store")}
                    >
                        Explore the store
                    </h3>
                </div>
            ) : (
                <WishlistItems />
            )}
        </div>
    );
}
