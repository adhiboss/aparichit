"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import gsap from "gsap";

interface AmbientAudioProps {
  compact?: boolean;
}

export const AmbientAudio: React.FC<AmbientAudioProps> = ({ compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveBarsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio("/sounds/sanctuary_owl.mp3");
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  // Animate waveform bars with GSAP when playing
  useEffect(() => {
    if (!waveBarsRef.current) return;
    const bars = waveBarsRef.current.querySelectorAll(".sound-bar");

    if (isPlaying) {
      gsap.to(bars, {
        scaleY: "random(0.3, 1.4)",
        duration: 0.45,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.12,
      });
    } else {
      gsap.killTweensOf(bars);
      gsap.to(bars, {
        scaleY: 0.35,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isPlaying]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        // Fade out with GSAP before pause
        gsap.to(audioRef.current, {
          volume: 0,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            audioRef.current?.pause();
            setIsPlaying(false);
          },
        });
      } else {
        audioRef.current.volume = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        // Fade in with GSAP
        gsap.to(audioRef.current, {
          volume: volume,
          duration: 1.0,
          ease: "power2.in",
        });
      }
    } catch (err) {
      console.warn("Audio playback prevented or unsupported:", err);
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={togglePlay}
        title={isPlaying ? "Mute sanctuary atmosphere" : "Listen to sanctuary atmosphere (Tawny Owl • Molkom Sweden)"}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
          isPlaying
            ? "bg-[#B69A61]/20 border border-[#B69A61] text-[#E7E1D5]"
            : "bg-[#1E222A]/80 hover:bg-[#282D37] border border-[#2E333D] text-[#9EA3AF] hover:text-[#E7E1D5]"
        }`}
      >
        {isPlaying ? (
          <Volume2 className="w-3.5 h-3.5 text-[#B69A61] animate-pulse" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-[#9EA3AF] group-hover:text-[#E7E1D5]" />
        )}

        {/* Animated equalizer waves */}
        <div ref={waveBarsRef} className="flex items-center gap-0.5 h-3 px-0.5">
          <span className="sound-bar w-0.5 h-full bg-[#B69A61] rounded-full origin-bottom" style={{ transform: "scaleY(0.35)" }} />
          <span className="sound-bar w-0.5 h-full bg-[#B69A61] rounded-full origin-bottom" style={{ transform: "scaleY(0.6)" }} />
          <span className="sound-bar w-0.5 h-full bg-[#B69A61] rounded-full origin-bottom" style={{ transform: "scaleY(0.4)" }} />
        </div>

        {!compact && (
          <span className="text-[11px] font-medium tracking-wide">
            {isPlaying ? "Atmosphere Playing" : "Sanctuary Ambience"}
          </span>
        )}
      </button>
    </div>
  );
};
