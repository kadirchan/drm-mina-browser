import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DynamicLayout from "./dynamic-load/dynamic-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DRM Mina",
    description: "Game marketplace on Mina",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <DynamicLayout>{children}</DynamicLayout>
            </body>
        </html>
    );
}
