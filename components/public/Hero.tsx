"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Twitter, ExternalLink, Info, Check } from "lucide-react";

export function Hero({ onOpenQuests }: { onOpenQuests: () => void }) {
  const [showOpenSeaToast, setShowOpenSeaToast] = useState(false);

  const handleOpenSeaClick = () => {
    setShowOpenSeaToast(true);
    setTimeout(() => {
      setShowOpenSeaToast(false);
    }, 3500);
  };

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
          className="w-full py-4 px-8 rounded-xl font-display font-extrabold text-base tracking-wider text-obsidian bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-xl shadow-amber-500/30 hover:shadow-amber-400/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
        >
          <span>JOIN THE WHITELIST</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
        </button>
      </motion.div>

      {/* Social Links Row (Replacing Old Cards) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mt-14 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-xs"
      >
        {/* Project Twitter */}
        <a
          href="https://x.com/We_Zards"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-fintech-card/80 border border-fintech-border hover:border-cyan-400/40 text-slate-200 hover:text-cyan-400 transition-all flex items-center gap-2 shadow-md hover:scale-[1.02]"
        >
          <Twitter className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold font-pixel">@We_Zards</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        {/* Artist Twitter */}
        <a
          href="https://x.com/SickickZards"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-fintech-card/80 border border-fintech-border hover:border-amber-400/40 text-slate-200 hover:text-amber-300 transition-all flex items-center gap-2 shadow-md hover:scale-[1.02]"
        >
          <Twitter className="w-4 h-4 text-amber-400" />
          <span className="font-semibold font-pixel">@SickickZards (Artist)</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        {/* OpenSea Link with Coming Soon Toast */}
        <button
          onClick={handleOpenSeaClick}
          className="px-4 py-2.5 rounded-xl bg-fintech-card/80 border border-fintech-border hover:border-blue-400/40 text-slate-200 hover:text-blue-400 transition-all flex items-center gap-2 shadow-md hover:scale-[1.02]"
        >
          <svg className="w-4 h-4 fill-[#2081E2]" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.95 12.82l-3.32 4.41c-.42.56-1.12.89-1.83.89H8.46c-.66 0-1.28-.27-1.74-.75l-2.07-2.17a2.38 2.38 0 0 1-.65-1.63V8.89c0-.66.27-1.29.75-1.75l2.17-2.07c.46-.44 1.09-.67 1.74-.67h4.08c.66 0 1.28.27 1.74.75l2.07 2.17c.44.46.67 1.09.67 1.74v4.68c0 .38-.1.74-.27 1.08z" />
          </svg>
          <span className="font-semibold font-pixel">OpenSea</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-sans">
            SOON
          </span>
        </button>
      </motion.div>

      {/* OpenSea Toast Notification */}
      <AnimatePresence>
        {showOpenSeaToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-obsidian-light border border-blue-400/40 text-blue-300 shadow-2xl flex items-center gap-3 font-pixel text-sm"
          >
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <span>OpenSea Collection Coming Soon!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
