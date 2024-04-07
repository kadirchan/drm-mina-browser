"use client";
import { useSearchParams } from "next/navigation";
import Store from "./store/page";

export default function Home() {
    const params = useSearchParams()?.get("device");
    console.log("params", params);
    JSON.parse(params || "{}");
    return <Store />;
}
