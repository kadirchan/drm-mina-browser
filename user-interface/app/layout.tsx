import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "./components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import SearchBar from "./components/searchbar";

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
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
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
            </body>
        </html>
    );
}
