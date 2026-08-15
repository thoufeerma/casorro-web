import React from "react";

const INGREDIENTS = [
  { name: "SEA WATER", start: 13, end: 48 },
  { name: "LIQUORICE", start: 65, end: 90 },
  { name: "ROSE TURKISH LOKUM", start: 113, end: 144 },
  { name: "DRIED ROSE PETALS", start: 156, end: 177 },
  { name: "VANILLA CREAM", start: 190, end: 207 },
  { name: "WHITE MUSK", start: 247, end: 283 },
];

interface IngredientOverlayProps {
  currentFrame: number;
}

export const IngredientOverlay: React.FC<IngredientOverlayProps> = ({ currentFrame }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">
      {INGREDIENTS.map((ingredient) => {
        let opacity = 0;
        
        if (currentFrame >= ingredient.start && currentFrame <= ingredient.end) {
          const rangeLength = ingredient.end - ingredient.start;
          // Target ~10 frames for fade, but cap at 1/3 of the total range for shorter ingredients
          const fadeFrames = Math.max(2, Math.min(10, Math.floor(rangeLength / 3)));
          
          if (currentFrame < ingredient.start + fadeFrames) {
            opacity = (currentFrame - ingredient.start) / fadeFrames;
          } else if (currentFrame > ingredient.end - fadeFrames) {
            opacity = (ingredient.end - currentFrame) / fadeFrames;
          } else {
            opacity = 1;
          }
        }

        // Do not render if completely invisible to save DOM nodes
        if (opacity <= 0) return null;

        return (
          <div
            key={ingredient.name}
            className="absolute left-6 md:left-16 lg:left-24 bottom-[15%] md:bottom-[20%] max-w-[80vw] md:max-w-[50vw]"
            style={{ opacity }}
          >
            <h2 className="text-brand-ivory font-serif tracking-cinematic uppercase font-semibold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
              {ingredient.name}
            </h2>
          </div>
        );
      })}
    </div>
  );
};

export default IngredientOverlay;
