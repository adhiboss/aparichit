"use client";

import React, { useEffect, useRef, useState } from "react";

interface VantaBirdsProps {
  className?: string;
  backgroundAlpha?: number;
  backgroundColor?: number;
  color1?: number;
  color2?: number;
  quantity?: number;
  birdSize?: number;
  wingSpan?: number;
  speedLimit?: number;
  separation?: number;
  alignment?: number;
  cohesion?: number;
}

declare global {
  interface Window {
    THREE?: any;
    VANTA?: {
      BIRDS?: (options: any) => {
        destroy: () => void;
        resize: () => void;
      };
    };
  }
}

export const VantaBirds: React.FC<VantaBirdsProps> = ({
  className = "absolute inset-0 pointer-events-none overflow-hidden",
  backgroundAlpha = 0.0, // 0.0 allows sunset landscape or dark bg to show with golden birds
  backgroundColor = 0x171a1f,
  color1 = 0xb69a61,
  color2 = 0xd4af37,
  quantity = 3.0,
  birdSize = 1.2,
  wingSpan = 20.0,
  speedLimit = 3.0,
  separation = 50.0,
  alignment = 50.0,
  cohesion = 50.0,
}) => {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const vantaEffectRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    // Helper to dynamically load script if not already present in DOM
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    const initVanta = async () => {
      try {
        // 1. Ensure Three.js r134 is loaded
        if (!window.THREE) {
          await loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
          );
        }

        // 2. Ensure Vanta Birds is loaded
        if (!window.VANTA?.BIRDS) {
          await loadScript(
            "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
          );
        }

        if (isCancelled || !vantaRef.current) return;

        // Destroy previous effect instance if exists
        if (vantaEffectRef.current && typeof vantaEffectRef.current.destroy === "function") {
          vantaEffectRef.current.destroy();
          vantaEffectRef.current = null;
        }

        if (window.VANTA?.BIRDS) {
          // Initialize Vanta Birds with APARICHIT charcoal & gold palette
          vantaEffectRef.current = window.VANTA.BIRDS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,

            // APARICHIT charcoal & gold palette
            backgroundColor,
            backgroundAlpha,
            color1,
            color2,
            colorMode: "lerpGradient",

            // Calm, elegant movement
            quantity,
            birdSize,
            wingSpan,
            speedLimit,

            // Bird flock behaviour
            separation,
            alignment,
            cohesion,
          });

          setIsLoaded(true);
        }
      } catch (err) {
        console.warn("Vanta Birds initialization warning:", err);
      }
    };

    initVanta();

    return () => {
      isCancelled = true;
      if (vantaEffectRef.current && typeof vantaEffectRef.current.destroy === "function") {
        try {
          vantaEffectRef.current.destroy();
        } catch {}
        vantaEffectRef.current = null;
      }
    };
  }, [
    backgroundAlpha,
    backgroundColor,
    color1,
    color2,
    quantity,
    birdSize,
    wingSpan,
    speedLimit,
    separation,
    alignment,
    cohesion,
  ]);

  return (
    <div
      ref={vantaRef}
      className={`vanta-birds-canvas ${className} transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    />
  );
};
