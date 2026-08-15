"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import FrameCanvas from "./FrameCanvas";
import ChapterOverlay from "./ChapterOverlay";
import CinematicPreloader from "./CinematicPreloader";
import IngredientOverlay from "./IngredientOverlay";
import { PHASE_RANGES, TOTAL_FRAMES, FramePhaseRange } from "@/lib/framesManifest";
import { ChapterInfo } from "@/lib/types";

interface CinematicSectionProps {
  onChapterChange?: (chapter: ChapterInfo) => void;
}

export const CinematicSection: React.FC<CinematicSectionProps> = ({
  onChapterChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [activePhase, setActivePhase] = useState<FramePhaseRange>(PHASE_RANGES[0]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Calculate scroll position and active frame index
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalScrollableDistance = rect.height - windowHeight;

    if (totalScrollableDistance <= 0) return;

    // How far we have scrolled inside containerRef
    const scrolledDistance = -rect.top;
    const rawProgress = Math.max(0, Math.min(1, scrolledDistance / totalScrollableDistance));

    // Map progress (0 to 1) to frame index (0 to TOTAL_FRAMES - 1)
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(rawProgress * TOTAL_FRAMES));
    setCurrentFrame(frameIndex);

    // Find active phase
    const phase = PHASE_RANGES.find(
      (p) => frameIndex >= p.startIndex && frameIndex <= p.endIndex
    );

    if (phase && phase.phaseFolder !== activePhase.phaseFolder) {
      setActivePhase(phase);
      onChapterChange?.(phase.chapter);
    }
  }, [activePhase, onChapterChange]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial position check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleProgress = useCallback((p: number) => {
    setLoadProgress(p);
  }, []);

  const handleInitialLoadComplete = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      {/* Preloader overlay while initial priority frames stream */}
      <CinematicPreloader progress={loadProgress} isLoaded={isLoaded} />

      {/* Pinned Scroll Container (700vh height provides smooth 842-frame scrolling) */}
      <section
        ref={containerRef}
        id="cinematic-view"
        aria-label="Scroll Controlled Fragrance Cinematic Experience"
        className="relative w-full h-[700vh] bg-brand-charcoal-deep"
      >
        {/* Sticky Fullscreen Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-brand-charcoal-deep">
          {/* HTML5 Canvas Rendering Frame Sequence */}
          <FrameCanvas
            currentFrameIndex={currentFrame}
            onProgress={handleProgress}
            onInitialLoadComplete={handleInitialLoadComplete}
          />

          {/* Synchronized Ingredient Typography Overlay */}
          <IngredientOverlay currentFrame={currentFrame} />

          {/* Ambient Editorial Chapter Typography Overlay */}
          <ChapterOverlay
            currentPhase={activePhase}
            currentFrame={currentFrame}
            totalFrames={TOTAL_FRAMES}
          />
        </div>
      </section>
    </>
  );
};

export default CinematicSection;
