"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "../components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import SearchBar from "../components/searchbar";
import { ReactNode, useEffect } from "react";
import { fetchGameData } from "@/lib/api";
import { useGamesStore } from "@/lib/stores/gameStore";

export default function AsyncLayout({ children }: { children: ReactNode }) {
    const gameStore = useGamesStore();

    useEffect(() => {
        fetchGameData().then((data) => gameStore.setGames(data));
    }, []);

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <div className="border-t absolute inset-0">
                <div className="bg-background absolute inset-0">
                    <div className="grid grid-cols-6">
                        <Sidebar className="col-span-1 sticky top-0" />
                        <main className=" overflow-hidden col-start-2 col-end-7">
                            <SearchBar></SearchBar>
                            {children}
                        </main>
                        <Toaster />
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
