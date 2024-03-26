"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SearchBar() {
    const router = useRouter();

    return (
        <div className="w-full px-8 py-5  justify-center items-center top-0 flex-1">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const search = (e.target as HTMLFormElement)["search"].value;
                    (e.target as HTMLFormElement)["search"].value = "";
                    router.push("/browse?" + search);
                }}
            >
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        name="search"
                        placeholder="Search games..."
                        className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                    />
                </div>
            </form>
        </div>
    );
}
