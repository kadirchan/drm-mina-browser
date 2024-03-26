"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Wallet, Bookmark, Store, Gamepad2, Search, Shapes, Package2, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Web3wallet from "./web3wallet";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Gamepad2 className="h-6 w-6" />
                            <span className="">DRM Mina</span>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                                    <Bell className="h-4 w-4" />
                                    <span className="sr-only">Toggle notifications</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>News</DropdownMenuLabel>
                                <DropdownMenuSeparator></DropdownMenuSeparator>
                                <div className="p-1 text-sm text-center">
                                    Everything up to date{" "}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {/* <h2 className="my-2 px-4 text-lg font-semibold tracking-tight">Marketplace</h2> */}
                    <div className="space-y-1 my-2">
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
                        {/* <Button
                            variant={currentPath == "/browse" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleNavigate("/browse")}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Browse
                        </Button> */}
                        <Button
                            variant={currentPath == "/categories" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleNavigate("/categories")}
                        >
                            <Shapes className="mr-2 h-4 w-4" />
                            Categories
                        </Button>
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
                        <Web3wallet />
                    </div>
                </div>
            </div>
            <div className="px-6 flex w-full justify-between self-end absolute bottom-4">
                <ModeToggle />{" "}
                <Badge className=" rounded-lg text-center items-center" variant="outline">
                    v0.0.1
                </Badge>
            </div>
        </div>
    );
}
