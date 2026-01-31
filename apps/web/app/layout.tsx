import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gen Wear - AI Generative Patterns",
    description: "Generate and visualize bandana patterns in 3D",
};

import { CartSheet } from "@/src/components/cart/CartSheet";

// ...

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                {children}
                <CartSheet />
            </body>
        </html>
    );
}
