"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Wallet, Bookmark, Store, Gamepad2, Search, Shapes } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
    const [currentPath, setCurrentPath] = useState<string>("/");
    const router = useRouter();

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
        router.push(path);
    };

    return (
        <div className={cn("flex flex-col justify-between h-screen border-r", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Marketplace</h2>
                    <div className="space-y-1">
                        <Button
                            variant={
                                currentPath == "/store" || currentPath == "/"
                                    ? "secondary"
                                    : "ghost"
                            }
                            className="w-full justify-start"
                            onClick={() => handleNavigate("/store")}
                        >
                            <Store className="mr-2 h-4 w-4" />
                            Store
                        </Button>
                        <Button
                            variant={currentPath == "/browse" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleNavigate("/browse")}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Browse
                        </Button>
                        <Button
                            variant={currentPath == "/categories" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleNavigate("/categories")}
                        >
                            <Shapes className="mr-2 h-4 w-4" />
                            Categories
                        </Button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Account</h2>
                    <div className="space-y-1">
                        <Button
                            variant={currentPath == "/library" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleNavigate("/library")}
                        >
                            <Gamepad2 className="mr-2 h-4 w-4" />
                            Library
                        </Button>
                        <Button
                            variant={currentPath == "/wishlist" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleNavigate("/wishlist")}
                        >
                            <Bookmark className="mr-2 h-4 w-4" />
                            Wishlist
                        </Button>
                        <Button
                            variant={currentPath == "/wallet" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleNavigate("/wallet")}
                        >
                            <Wallet className="mr-2 h-4 w-4" />
                            Wallet
                        </Button>
                    </div>
                </div>
            </div>
            <div className="px-6 flex w-full justify-between self-end absolute bottom-4">
                <ModeToggle /> <Badge variant="outline">v0.0.1</Badge>
            </div>
        </div>
    );
}
