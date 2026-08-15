import React, { useState, useEffect } from "react";
import { FRAGRANCE_NAME } from "@/lib/constants";

interface PreloaderProps {
  progress: number; // 0 to 100
  isLoaded: boolean;
}

export const CinematicPreloader: React.FC<PreloaderProps> = ({
  progress,
  isLoaded,
}) => {
  const [shouldUnmount, setShouldUnmount] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);

  // Guarantee at least 5 seconds of loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const shouldHide = isLoaded && minTimePassed;

  // Unmount completely after fade animation finishes
  useEffect(() => {
    if (shouldHide) {
      const timer = setTimeout(() => {
        setShouldUnmount(true);
      }, 700); // 700ms matches the fade-out duration
      return () => clearTimeout(timer);
    }
  }, [shouldHide]);

  if (shouldUnmount) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading cinematic experience"
      className={`fixed inset-0 z-[100] bg-[#E8D9CF] flex flex-col items-center justify-center px-6 transition-opacity duration-700 ease-in-out ${
        shouldHide ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Subtle radial ambient light behind the logo */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_50%)]" />

      {/* Very faint rose petal silhouette corners (static & highly performant) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.15] mix-blend-multiply">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D4AFA0] rounded-[40%_60%_70%_30%] blur-[60px]" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-[#D4AFA0] rounded-[60%_40%_30%_70%] blur-[80px]" />
        <div className="absolute top-1/4 -right-16 w-64 h-64 bg-[#D4AFA0] rounded-[50%_50%_40%_60%] blur-[70px] opacity-60" />
      </div>

      <div 
        className={`relative max-w-md w-full text-center flex flex-col items-center z-10 transition-opacity duration-500 ease-in-out ${
          shouldHide ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Subtle center monogram/motif behind the text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[240px] font-serif text-[#5A4137] opacity-[0.03] select-none pointer-events-none leading-none">
          C
        </div>

        <p className="text-[9px] font-sans tracking-[0.4em] uppercase text-[#5A4137] mb-8 relative">
          Parfum Extraordinaire
        </p>
        
        {/* Small Monogram / Logo */}
        <div className="mb-6 flex justify-center opacity-80 relative">
          <img 
            src="/images/Casorro_Logo_3.webp" 
            alt="Casorro Logo" 
            className="h-8 w-auto object-contain brightness-0" 
          />
        </div>

        {/* CASORRO */}
        <h2 className="font-serif text-lg tracking-[0.3em] uppercase text-[#2C2521] mb-2 relative">
          Casorro
        </h2>

        {/* IVORY ROSE (Main Identity) */}
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2521] mb-8 tracking-widest font-light relative">
          {FRAGRANCE_NAME}
        </h1>
        
        {/* Fragrance Notes */}
        <div className="mb-8 relative">
          <p className="text-[8px] sm:text-[9px] font-sans tracking-[0.3em] uppercase text-[#5A4137]/80 leading-relaxed">
            Sea Water · Liquorice · Rose<br />
            Vanilla · White Musk
          </p>
        </div>

        {/* Minimal luxury loading progress bar */}
        <div className="w-full max-w-[160px] relative">
          <div className="w-full h-[1px] bg-[#5A4137]/15 overflow-hidden relative">
            <div
              className="h-full bg-[#B98F86] transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CinematicPreloader;
