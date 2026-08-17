"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export function Hero({ onOpenQuests }: { onOpenQuests: () => void }) {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
      {/* Top Ethereal Golden Badge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs font-mono mb-8 shadow-lg shadow-amber-400/10"
      >
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
        <span className="tracking-widest uppercase text-[11px] font-bold text-amber-200">WEZARDS INITIATION PHASE I</span>
      </motion.div>

      {/* Main Headline with Light Golden Mixed Letters */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]"
      >
        Enter the{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.35)]">
          WeZards Circle
        </span>
      </motion.h1>

      {/* Supporting Text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 text-base sm:text-xl text-fintech-subtext max-w-2xl font-sans font-normal leading-relaxed"
      >
        Complete the quests. Prove your allegiance. Earn your place.
      </motion.p>

      {/* Primary CTA - Golden Gradient */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 flex flex-col items-center gap-4 w-full max-w-xs"
      >
        <button
          onClick={onOpenQuests}
          className="w-full py-4 px-8 rounded-xl font-display font-extrabold text-base tracking-wider text-obsidian bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-xl shadow-amber-500/30 hover:shadow-amber-400/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group font-pixel"
        >
          <span>JOIN THE WHITELIST</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
        </button>
      </motion.div>
    </section>
  );
}
