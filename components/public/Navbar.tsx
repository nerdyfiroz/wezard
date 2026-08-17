"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Info, ChevronDown, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function XLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Authentic Official OpenSea Logo (Ship Sailboat)
export function OpenSeaLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#2081E2" />
      <path
        d="M10.2037 20.3546L19.2979 26.4704V13.8828L10.2037 20.3546Z"
        fill="white"
        fillOpacity="0.8"
      />
      <path
        d="M20.7021 7V26.4704L29.7963 20.3546L20.7021 7Z"
        fill="white"
      />
      <path
        d="M19.2979 27.9157L10.2037 22.8286L19.2979 33V27.9157Z"
        fill="white"
        fillOpacity="0.8"
      />
      <path
        d="M20.7021 33V27.9157L29.7963 22.8286L20.7021 33Z"
        fill="white"
      />
    </svg>
  );
}

export function Navbar({ onOpenQuests }: { onOpenQuests: () => void }) {
  const [showOpenSeaToast, setShowOpenSeaToast] = useState(false);
  const [isXDropdownOpen, setIsXDropdownOpen] = useState(false);

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
          {/* X Dropdown Menu Button */}
          <div
            className="relative"
            onMouseEnter={() => setIsXDropdownOpen(true)}
            onMouseLeave={() => setIsXDropdownOpen(false)}
          >
            <button
              onClick={() => setIsXDropdownOpen((prev) => !prev)}
              className="px-3 py-2 rounded-xl bg-fintech-card border border-fintech-border text-slate-200 hover:text-amber-300 hover:border-amber-400/40 transition-all flex items-center gap-2 shadow-sm font-pixel"
              title="Official X / Twitter Links"
            >
              <XLogo className="w-4 h-4 text-white" />
              <span className="text-xs hidden sm:inline">Official X</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isXDropdownOpen ? "rotate-180 text-amber-300" : "text-slate-400"
                }`}
              />
            </button>

            {/* Hover / Tap Dropdown Menu with Project & Artist Avatars */}
            <AnimatePresence>
              {isXDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#21242d] border border-slate-700/80 shadow-2xl p-2 z-50 font-pixel"
                >
                  {/* Project X (@We_Zards) - using Wizemvbvbers.png */}
                  <a
                    href="https://x.com/We_Zards"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-400/10 text-slate-200 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-amber-400/40 shrink-0">
                        <Image
                          src="/Wizemvbvbers.png"
                          alt="WeZards Project"
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          Project X
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          @We_Zards
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300" />
                  </a>

                  <div className="my-1 border-t border-slate-700/50" />

                  {/* Artist X (@SickickZards) - using Wizeffgmbers.png */}
                  <a
                    href="https://x.com/SickickZards"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-400/10 text-slate-200 hover:text-amber-300 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-amber-400/40 shrink-0">
                        <Image
                          src="/Wizeffgmbers.png"
                          alt="Artist SickickZards"
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          Artist X
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          @SickickZards
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300" />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* OpenSea - Official Logo */}
          <button
            onClick={handleOpenSeaClick}
            className="p-2 sm:px-3 rounded-xl bg-fintech-card border border-fintech-border text-slate-200 hover:text-blue-400 hover:border-blue-400/40 transition-colors flex items-center gap-1.5"
            title="OpenSea Collection (Coming Soon)"
          >
            <OpenSeaLogo className="w-4 h-4" />
            <span className="text-xs font-pixel hidden sm:inline">OpenSea</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-fintech-card/80 border border-amber-400/30 text-xs text-amber-200 shadow-sm shadow-amber-400/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span className="font-mono text-[11px] tracking-wide font-semibold text-amber-300">
              CIRCLE OPEN
            </span>
          </div>

          {/* Join Whitelist CTA */}
          <button
            onClick={onOpenQuests}
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold tracking-wider text-obsidian bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-md shadow-amber-500/25 hover:shadow-amber-400/40 hover:scale-[1.02] flex items-center gap-1.5 font-pixel"
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
