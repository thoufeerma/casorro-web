"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import dynamic from "next/dynamic";
import { INITIAL_CHAPTER } from "@/lib/constants";
import { ChapterInfo } from "@/lib/types";

const CinematicSection = dynamic(() => import("@/components/cinematic/CinematicSection"), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-[#141312] flex items-center justify-center">
      <img src="/images/Casorro_Logo_3.webp" alt="CASORRO" className="h-16 w-auto object-contain animate-pulse" />
    </div>
  )
});
const FutureContentSection = dynamic(() => import("@/components/content/FutureContentSection").then(mod => mod.FutureContentSection));
const ProductCtaSection = dynamic(() => import("@/components/product/ProductCtaSection").then(mod => mod.ProductCtaSection));

export default function Home() {
  const [activeChapter, setActiveChapter] = useState<ChapterInfo>(INITIAL_CHAPTER);

  return (
    <main className="relative min-h-screen bg-brand-charcoal-deep text-brand-ivory">
      {/* Fixed Luxury Navigation Syncing Dynamic Chapter */}
      <Header activeChapter={activeChapter} />

      {/* Cinematic Frame Animation Experience */}
      <CinematicSection onChapterChange={setActiveChapter} />

      {/* Fragrance Narrative Section slides over the sticky hero */}
      <div className="relative z-10 -mt-[100vh] shadow-[0_-4px_24px_rgba(0,0,0,0.05)] border-t border-brand-charcoal-deep/10">
        <FutureContentSection />
      </div>

      {/* Product Reservation & Footer */}
      <ProductCtaSection />
    </main>
  );
}
