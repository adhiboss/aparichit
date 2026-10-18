"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface GsapHeroTextProps {
  headline: string;
  subheadline: string;
}

export const GsapHeroText: React.FC<GsapHeroTextProps> = ({
  headline,
  subheadline,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Headline words reveal with silky stagger
      const words = containerRef.current?.querySelectorAll(".gsap-headline-word");
      if (words && words.length > 0) {
        gsap.fromTo(
          words,
          {
            opacity: 0,
            y: 22,
            filter: "blur(4px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.07,
            ease: "power3.out",
          }
        );
      }

      // 2. Subtitle smooth fade & slide
      const sub = containerRef.current?.querySelector(".gsap-subheadline");
      if (sub) {
        gsap.fromTo(
          sub,
          {
            opacity: 0,
            y: 16,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.45,
            ease: "power2.out",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [headline, subheadline]);

  const words = headline.split(" ");

  return (
    <div ref={containerRef} className="flex flex-col items-center text-center">
      <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#E7E1D5] tracking-tight leading-[1.15] max-w-2xl font-normal drop-shadow-md flex flex-wrap justify-center gap-x-2.5 sm:gap-x-3.5">
        {words.map((word, index) => (
          <span
            key={index}
            className="gsap-headline-word inline-block will-change-transform"
          >
            {word}
          </span>
        ))}
      </h1>

      <p className="gsap-subheadline mt-4 sm:mt-5 text-base sm:text-lg text-[#E7E1D5]/90 max-w-xl font-light leading-relaxed drop-shadow will-change-transform">
        {subheadline}
      </p>
    </div>
  );
};
