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
    // We subtract an extra windowHeight because the next section overlaps by 100vh
    // This ensures the frame sequence hits 100% exactly when the slide-over begins.
    const totalScrollableDistance = rect.height - (2 * windowHeight);

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

      {/* Pinned Scroll Container (1500vh height provides slow, premium scrolling for the sequence) */}
      <section
        ref={containerRef}
        id="cinematic-view"
        aria-label="Scroll Controlled Fragrance Cinematic Experience"
        className="relative w-full h-[1500vh] bg-brand-charcoal-deep"
      >
        {/* Sticky Fullscreen Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-brand-charcoal-deep">
          {/* HTML5 Canvas Rendering Frame Sequence */}
          <FrameCanvas
            currentFrameIndex={currentFrame}
            onProgress={handleProgress}
            onInitialLoadComplete={handleInitialLoadComplete}
          />

          {/* Subtle dark overlay to ensure text readability against bright frames */}
          <div className="absolute inset-0 pointer-events-none bg-black/30 z-[5]" aria-hidden="true" />

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
