"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function XLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Navbar({ onOpenQuests }: { onOpenQuests: () => void }) {
  const [showOpenSeaToast, setShowOpenSeaToast] = useState(false);

  const handleOpenSeaClick = () => {
    setShowOpenSeaToast(true);
    setTimeout(() => {
      setShowOpenSeaToast(false);
    }, 3500);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-obsidian/80 border-b border-fintech-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 p-[2px] shadow-lg shadow-amber-500/30 group-hover:shadow-amber-400/50 transition-all duration-300 overflow-hidden">
            <Image
              src="/Wizeffgmbers.png"
              alt="WeZards Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-[10px] group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold tracking-widest text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.25)]">
              WEZARDS
            </span>
            <span className="text-[10px] tracking-widest text-amber-200/90 font-mono uppercase -mt-1 font-bold">
              CIRCLE QUEST
            </span>
          </div>
        </Link>

        {/* Live Status & Social Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Social Links with Real X Icon */}
          <div className="hidden md:flex items-center gap-2">
            {/* Project X */}
            <a
              href="https://x.com/We_Zards"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-fintech-card border border-fintech-border text-slate-200 hover:text-white hover:border-amber-400/40 transition-colors flex items-center gap-1.5"
              title="Project X (@We_Zards)"
            >
              <XLogo className="w-4 h-4 text-white" />
              <span className="text-xs font-pixel">Project</span>
            </a>

            {/* Artist X */}
            <a
              href="https://x.com/SickickZards"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-fintech-card border border-fintech-border text-slate-200 hover:text-amber-300 hover:border-amber-400/40 transition-colors flex items-center gap-1.5"
              title="Artist X (@SickickZards)"
            >
              <XLogo className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-pixel">Artist</span>
            </a>

            {/* OpenSea */}
            <button
              onClick={handleOpenSeaClick}
              className="p-2 rounded-xl bg-fintech-card border border-fintech-border text-slate-200 hover:text-blue-400 hover:border-blue-400/40 transition-colors flex items-center gap-1.5"
              title="OpenSea Collection (Coming Soon)"
            >
              <svg className="w-4 h-4 fill-[#2081E2]" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.95 12.82l-3.32 4.41c-.42.56-1.12.89-1.83.89H8.46c-.66 0-1.28-.27-1.74-.75l-2.07-2.17a2.38 2.38 0 0 1-.65-1.63V8.89c0-.66.27-1.29.75-1.75l2.17-2.07c.46-.44 1.09-.67 1.74-.67h4.08c.66 0 1.28.27 1.74.75l2.07 2.17c.44.46.67 1.09.67 1.74v4.68c0 .38-.1.74-.27 1.08z" />
              </svg>
              <span className="text-xs font-pixel">OpenSea</span>
            </button>
          </div>

          <div className="hidden xs:flex items-center gap-2 px-3 py-1 rounded-full bg-fintech-card/80 border border-amber-400/30 text-xs text-amber-200 shadow-sm shadow-amber-400/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span className="font-mono text-[11px] tracking-wide font-semibold text-amber-300">CIRCLE OPEN</span>
          </div>

          {/* Join Whitelist CTA - Golden Gradient */}
          <button
            onClick={onOpenQuests}
            className="px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider text-obsidian bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-md shadow-amber-500/25 hover:shadow-amber-400/40 hover:scale-[1.02] flex items-center gap-1.5 font-pixel"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>JOIN WHITELIST</span>
          </button>
        </div>
      </div>

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
    </header>
  );
}
