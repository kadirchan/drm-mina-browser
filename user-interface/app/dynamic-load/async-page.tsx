"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Store from "../store/page";
import { useEffect } from "react";
import { useDeviceStore } from "@/lib/stores/deviceStore";
import useHasMounted from "@/lib/customHooks";

export default function Home() {
    const gameName = useSearchParams()?.get("game");
    console.log("gameName", gameName);
    const device = useSearchParams()?.get("device");
    console.log("device", device);

    const router = useRouter();
    const deviceStore = useDeviceStore();

    useEffect(() => {
        if (device || gameName) {
            if (device) {
                deviceStore.setDevice(JSON.parse(device));
            }
            if (gameName) router.push("/game-detail?game=" + gameName);
        }
    }, []);

    return <Store />;
}
