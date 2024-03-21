import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import WalletAccount from "@/lib/walletData";
import { Wallet } from "lucide-react";
import React, { useState } from "react";

export default function Web3wallet() {
    const [walletConnected, setWalletConnected] = useState(false);

    const connect = async () => {
        if (!window.mina) {
            toast({
                title: "Wallet not found",
                description: "Please install the Auro wallet",
            });
            return;
        }
        const addresses = await window.mina!.requestAccounts();
        if (addresses[0]) {
            WalletAccount.setAddress(addresses[0]);
            setWalletConnected(true);
        }
    };

    const disconnect = async () => {
        WalletAccount.disconnect();
        setWalletConnected(false);
    };
    return (
        <div>
            {walletConnected ? (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="w-full flex justify-start px-2 ">
                            {/* <Wallet className="mr-2 h-4 w-4" /> */}
                            <span className="ml-4 truncate">
                                {WalletAccount.getWalletData().address}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className=" w-auto ml-2">
                        <h4 className="px-4 w-full text-sm font-normal tracking-tight text-wrap">
                            {WalletAccount.getWalletData().address}
                        </h4>
                        <p className=" px-4 pt-2 w-full text-xs font-normal tracking-tight text-wrap">
                            {String(WalletAccount.getWalletData().minaBalance)} MINA
                        </p>
                        <p className=" px-4 pt-2 w-full text-xs font-normal tracking-tight text-wrap">
                            {WalletAccount.getWalletData().acquiredGames.length} Games
                        </p>
                        <Button className=" mt-2" variant="ghost" onClick={disconnect}>
                            Disconnect
                        </Button>
                    </PopoverContent>
                </Popover>
            ) : (
                <Button variant="ghost" className="w-full justify-start" onClick={connect}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                </Button>
            )}
        </div>
    );
}
