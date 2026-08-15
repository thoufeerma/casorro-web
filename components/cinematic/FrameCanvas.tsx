"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { FRAME_SEQUENCE, TOTAL_FRAMES, PHASE_RANGES, FramePhaseRange } from "@/lib/framesManifest";

interface FrameCanvasProps {
  currentFrameIndex: number;
  onProgress?: (progress: number) => void;
  onInitialLoadComplete?: () => void;
}

export const FrameCanvas: React.FC<FrameCanvasProps> = ({
  currentFrameIndex,
  onProgress,
  onInitialLoadComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const lastDrawnImageRef = useRef<HTMLImageElement | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const rafIdRef = useRef<number | null>(null);

  // Helper to resolve clip boundary for a given frame index
  const getClipForIndex = useCallback((index: number): FramePhaseRange => {
    return (
      PHASE_RANGES.find((p) => index >= p.startIndex && index <= p.endIndex) ||
      PHASE_RANGES[0]
    );
  }, []);

  // Helper to load a single image index safely
  const loadImage = useCallback((index: number): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (imagesRef.current.has(index)) {
        resolve(imagesRef.current.get(index)!);
        return;
      }

      const img = new Image();
      img.src = FRAME_SEQUENCE[index];
      img.onload = () => {
        imagesRef.current.set(index, img);
        resolve(img);
      };
      img.onerror = (err) => {
        console.warn(`Failed to load frame ${index} (${FRAME_SEQUENCE[index]})`, err);
        reject(err);
      };
    });
  }, []);

  // Preload sequence: Priority batch (Clip 1 - 240 frames), then sequential streaming
  useEffect(() => {
    let isCancelled = false;
    const PRIORITY_BATCH_SIZE = 10; // Preload a small batch first to show the UI quickly

    const startPreloading = async () => {
      let count = 0;

      // 1. Skeleton Load: Load every 10th frame to prevent black screens
      // This gives the user an instant, slightly lower-FPS version of the full video
      const KEYFRAME_INTERVAL = 10;
      const priorityIndices: number[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i += KEYFRAME_INTERVAL) {
        priorityIndices.push(i);
      }
      // Guarantee the final frame is loaded so the cinematic hold works perfectly
      if (!priorityIndices.includes(TOTAL_FRAMES - 1)) {
        priorityIndices.push(TOTAL_FRAMES - 1);
      }

      for (let i = 0; i < priorityIndices.length; i++) {
        if (isCancelled) return;
        try {
          await loadImage(priorityIndices[i]);
          count++;
          setLoadedCount(count);
          // Progress bar tracks total frames loaded
          onProgress?.((count / TOTAL_FRAMES) * 100);
        } catch {
          // continue
        }
      }

      // Signal that skeleton is ready! UI can be shown instantly.
      onInitialLoadComplete?.();

      // 2. Stream remaining frames to fill in the gaps
      const remainingIndices: number[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (!priorityIndices.includes(i)) {
          remainingIndices.push(i);
        }
      }

      const CHUNK_SIZE = 10;
      for (let i = 0; i < remainingIndices.length; i += CHUNK_SIZE) {
        if (isCancelled) return;
        const chunk = remainingIndices.slice(i, i + CHUNK_SIZE);
        await Promise.all(
          chunk.map((idx) =>
            loadImage(idx)
              .then(() => {
                count++;
                setLoadedCount(count);
                onProgress?.((count / TOTAL_FRAMES) * 100);
              })
              .catch(() => { })
          )
        );
      }
    };

    startPreloading();

    return () => {
      isCancelled = true;
    };
  }, [loadImage, onProgress, onInitialLoadComplete]);

  // Strict Clip-Boundary Aware Frame Selection
  const getFrameToDraw = useCallback(
    (targetIndex: number): HTMLImageElement | null => {
      const activeClip = getClipForIndex(targetIndex);

      // 1. Check exact requested index
      if (imagesRef.current.has(targetIndex)) {
        return imagesRef.current.get(targetIndex)!;
      }

      // 2. Search BACKWARD ONLY inside current clip boundary
      for (let i = targetIndex - 1; i >= activeClip.startIndex; i--) {
        if (imagesRef.current.has(i)) {
          return imagesRef.current.get(i)!;
        }
      }

      // 3. Fallback to previous clip's last frame if available
      if (activeClip.startIndex > 0 && imagesRef.current.has(activeClip.startIndex - 1)) {
        return imagesRef.current.get(activeClip.startIndex - 1)!;
      }

      // 4. Return last drawn image if available to prevent canvas clear/flicker
      return lastDrawnImageRef.current;
    },
    [getClipForIndex]
  );

  // Render Frame onto Canvas
  const renderFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imgToDraw = getFrameToDraw(index);
      if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) return;

      lastDrawnImageRef.current = imgToDraw;

      // Canvas dimensions with High-DPI support
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const targetWidth = Math.floor(rect.width * dpr);
      const targetHeight = Math.floor(rect.height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      // Clear with pure black to match image background and hide gaps
      ctx.fillStyle = "#352424ff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate edge-to-edge cover positioning
      const imgWidth = imgToDraw.naturalWidth;
      const imgHeight = imgToDraw.naturalHeight;
      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvas.width / canvas.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let drawX = 0;
      let drawY = 0;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imgToDraw, drawX, drawY, drawWidth, drawHeight);
    },
    [getFrameToDraw]
  );

  // Sync canvas draw with currentFrameIndex via requestAnimationFrame
  useEffect(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      renderFrame(currentFrameIndex);
    });

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [currentFrameIndex, renderFrame, loadedCount]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      renderFrame(currentFrameIndex);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentFrameIndex, renderFrame]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover transition-opacity duration-300"
        aria-label="CASORRO fragrance frame sequence"
      />
      <div
        className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-50"
        aria-hidden="true"
      />
    </div>
  );
};

export default FrameCanvas;
