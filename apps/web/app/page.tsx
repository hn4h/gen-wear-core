"use client";

import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Hero } from "@/src/components/home/Hero";

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-900">
            <Header />
            <Hero />
            <Footer />
        </main>
    );
}
