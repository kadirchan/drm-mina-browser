"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function Browse() {
    const router = useRouter();
    const params = useSearchParams();
    return <div>Browse {params}</div>;
}
