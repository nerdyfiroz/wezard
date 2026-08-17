"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface CinematicLoaderProps {
  onComplete?: () => void;
}

export function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("AWAKENING ARCANUM...");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFinished(true);
            if (onComplete) onComplete();
          }, 350);
          return 100;
        }

        const next = prev + Math.floor(Math.random() * 8) + 4;
        const bounded = Math.min(next, 100);

        if (bounded < 35) {
          setStatusText("AWAKENING ARCANUM...");
        } else if (bounded < 70) {
          setStatusText("ALIGNING SANCTUM RUNES...");
        } else if (bounded < 95) {
          setStatusText("SUMMONING WEZARDS CIRCLE...");
        } else {
          setStatusText("ENTER THE CIRCLE");
        }

        return bounded;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#181b24] overflow-hidden select-none font-pixel"
        >
          {/* ── Mystical Grey Ambient Aura (from Wizeffgmbers / Wand) ── */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#252833] via-[#1d2028] to-[#15171f]" />

          {/* ── Ruby Wand Crystal Glow Pulsing Behind Staff ──────────── */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.7, 0.35],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-10 w-64 h-64 rounded-full bg-red-600/25 blur-3xl pointer-events-none"
          />

          {/* ── Golden & Cyan Subtle Celestial Halos ─────────────────── */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amber-400/[0.04] blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#00f0ff]/[0.03] blur-[100px] pointer-events-none" />

          {/* ── Pixel Feather Watermark in Background ────────────────── */}
          <div className="absolute top-12 right-12 md:right-28 w-48 h-48 opacity-[0.05] pointer-events-none rotate-[25deg]">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-slate-100">
              <rect x="68" y="10" width="12" height="12" />
              <rect x="58" y="18" width="14" height="12" />
              <rect x="74" y="24" width="14" height="10" />
              <rect x="50" y="28" width="16" height="12" />
              <rect x="68" y="34" width="16" height="10" />
              <rect x="42" y="38" width="18" height="12" />
              <rect x="62" y="44" width="16" height="10" />
              <rect x="34" y="48" width="18" height="12" />
              <rect x="54" y="54" width="16" height="10" />
              <rect x="26" y="58" width="18" height="12" />
              <rect x="20" y="68" width="16" height="10" />
              <rect x="10" y="86" width="10" height="6" />
            </svg>
          </div>

          {/* ── Central Cinematic Staff Frame ────────────────────────── */}
          <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
            {/* Wand Artwork Container (Transparent, Floating Arcane Levitation) */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 15 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: [0, -8, 0],
              }}
              transition={{
                y: {
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                scale: { duration: 0.7, ease: "easeOut" },
                opacity: { duration: 0.7, ease: "easeOut" },
              }}
              className="relative w-44 h-44 sm:w-52 sm:h-52 mb-4 flex items-center justify-center pointer-events-none"
            >
              {/* Pulsing Ruby Energy Glow behind transparent staff */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-red-500/35 blur-2xl pointer-events-none animate-pulse" />

              <Image
                src="/loading-wand.png"
                alt="WeZards Arcane Staff"
                width={200}
                height={200}
                priority
                className="w-full h-full object-contain filter drop-shadow-[0_0_18px_rgba(239,68,68,0.5)] drop-shadow-[0_0_35px_rgba(245,158,11,0.25)]"
              />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-6"
            >
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-widest text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-400 drop-shadow-[0_0_18px_rgba(250,204,21,0.3)]">
                WEZARDS
              </h1>
              <span className="text-[10px] tracking-widest text-amber-200/80 font-mono uppercase font-bold mt-1 block">
                CIRCLE SANCTUM
              </span>
            </motion.div>

            {/* Progress Bar Container */}
            <div className="w-full space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300/90 font-bold flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                  {statusText}
                </span>
                <span className="text-slate-400 font-bold text-[11px]">
                  {progress}%
                </span>
              </div>

              {/* Bar */}
              <div className="w-full h-2 rounded-full bg-[#13151c] border border-slate-700/80 overflow-hidden p-[1px] shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Quick Skip button once almost ready */}
            {progress >= 80 && (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  setIsFinished(true);
                  if (onComplete) onComplete();
                }}
                className="mt-6 px-5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/60 text-slate-300 hover:text-amber-300 text-xs font-mono font-bold transition-all hover:scale-105"
              >
                ENTER NOW &rarr;
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
