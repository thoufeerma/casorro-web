import React, { useState, useEffect } from "react";
import { BRAND_NAME, FRAGRANCE_NAME } from "@/lib/constants";

interface PreloaderProps {
  progress: number; // 0 to 100
  isLoaded: boolean;
}

export const CinematicPreloader: React.FC<PreloaderProps> = ({
  progress,
  isLoaded,
}) => {
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [shouldUnmount, setShouldUnmount] = useState(false);

  // Guarantee at least 2 seconds of loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const shouldHide = isLoaded && minTimePassed;

  // Unmount completely after animation finishes (1 second)
  useEffect(() => {
    if (shouldHide) {
      const timer = setTimeout(() => {
        setShouldUnmount(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldHide]);

  if (shouldUnmount) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading cinematic experience"
      className={`fixed inset-0 z-50 bg-[#141312] flex flex-col items-center justify-center px-6 transition-transform duration-[1000ms] ease-[cubic-bezier(0.7,0,0.3,1)] ${
        shouldHide ? "-translate-y-full pointer-events-none" : "translate-y-0"
      }`}
    >
      <div className="max-w-xs text-center space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-sans tracking-ultra uppercase text-brand-rose">
            Parfum Extraordinaire
          </p>
          <div className="flex justify-center mb-4">
            <img 
              src="/images/Casorro_Logo_3.webp" 
              alt="CASORRO" 
              className="h-12 sm:h-16 w-auto object-contain animate-pulse" 
            />
          </div>
          <p className="font-serif text-lg italic text-brand-champagne/80 font-light">
            {FRAGRANCE_NAME}
          </p>
        </div>

        {/* Minimal luxury loading progress bar */}
        <div className="space-y-3 pt-4">
          <div className="w-full h-[2px] bg-brand-charcoal-light/80 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-brand-rose via-brand-champagne to-brand-rose transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          {/* Text and percentage removed as per user request */}
        </div>
      </div>
    </div>
  );
};

export default CinematicPreloader;
