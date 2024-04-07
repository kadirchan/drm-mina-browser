"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Store from "./store/page";
import { useEffect } from "react";
import { useDeviceStore } from "@/lib/stores/deviceStore";
import useHasMounted from "@/lib/customHooks";

export default function Home() {
    const params = useSearchParams()?.get("device");
    const router = useRouter();
    const deviceStore = useDeviceStore();

    useEffect(() => {
        if (params) {
            deviceStore.setDevice(JSON.parse(params));
            router.replace("/");
        }
    }, []);

    return <Store />;
}
