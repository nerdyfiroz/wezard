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

// Flat white OpenSea logo (matches X icon style — no circle background)
export function OpenSeaLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 90" fill="currentColor">
      <path d="M45 0C20.151 0 0 20.151 0 45C0 69.849 20.151 90 45 90C69.849 90 90 69.849 90 45C90 20.151 69.858 0 45 0ZM22.203 46.512L22.392 46.206L34.101 27.891C34.272 27.63 34.677 27.657 34.803 27.945C36.756 32.328 38.448 37.782 37.656 41.175C37.323 42.57 36.396 44.46 35.352 46.206C35.217 46.458 35.072 46.71 34.911 46.953C34.839 47.061 34.713 47.124 34.578 47.124H22.545C22.221 47.124 22.032 46.773 22.203 46.512ZM74.376 52.812C74.376 52.983 74.277 53.127 74.133 53.19C73.224 53.577 70.119 55.008 68.832 56.799C65.538 61.38 63.027 67.932 57.402 67.932H33.948C25.632 67.932 18.9 61.173 18.9 52.83V52.56C18.9 52.344 19.08 52.164 19.305 52.164H32.373C32.634 52.164 32.823 52.398 32.805 52.659C32.706 53.514 32.868 54.396 33.273 55.17C34.047 56.745 35.649 57.726 37.368 57.726H43.956V52.677H37.443C37.11 52.677 36.921 52.29 37.11 52.029C37.182 51.921 37.263 51.813 37.35 51.687C37.971 50.823 38.88 49.482 39.78 47.94C40.404 46.866 41.01 45.72 41.49 44.565C41.58 44.376 41.652 44.178 41.724 43.98C41.85 43.62 41.985 43.278 42.084 42.936C42.192 42.642 42.273 42.33 42.354 42.036C42.6 41.01 42.705 39.921 42.705 38.79C42.705 38.349 42.687 37.89 42.651 37.449C42.633 36.972 42.573 36.495 42.513 36.018C42.471 35.604 42.399 35.19 42.318 34.776C42.219 34.227 42.084 33.687 41.94 33.138L41.895 32.964C41.787 32.571 41.688 32.187 41.562 31.803C41.175 30.51 40.716 29.253 40.221 28.068C40.041 27.612 39.84 27.172 39.63 26.731C39.333 26.1 39.027 25.524 38.729 24.984C38.585 24.723 38.45 24.489 38.315 24.246C38.163 23.985 38.001 23.727 37.854 23.481C37.755 23.319 37.629 23.169 37.557 23.007L35.721 19.71C35.55 19.404 35.856 19.035 36.18 19.152L47.115 23.013H47.142C47.16 23.013 47.169 23.022 47.178 23.022L48.609 23.508L50.184 24.039L50.76 24.237V17.784C50.76 16.560 51.759 15.57 52.992 15.57C53.604 15.570 54.153 15.822 54.549 16.227C54.945 16.623 55.197 17.172 55.197 17.784V25.605L56.331 25.965C56.421 26.001 56.511 26.046 56.583 26.109C56.826 26.298 57.186 26.577 57.636 26.91C57.996 27.189 58.374 27.522 58.833 27.864C59.742 28.557 60.822 29.466 61.992 30.51C62.307 30.789 62.604 31.077 62.874 31.365C64.341 32.706 65.988 34.308 67.554 36.081C67.986 36.567 68.409 37.080 68.832 37.611C69.255 38.151 69.705 38.682 70.092 39.213C70.605 39.888 71.091 40.590 71.541 41.319C71.748 41.661 71.982 42.012 72.171 42.354C72.729 43.368 73.224 44.412 73.530 45.456C73.629 45.753 73.710 46.068 73.755 46.362V46.425C73.890 46.935 73.944 47.472 73.944 48.018C73.944 49.653 73.602 51.255 74.376 52.812Z" />
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

          {/* OpenSea - styled identically to Official X button */}
          <button
            onClick={handleOpenSeaClick}
            className="px-3 py-2 rounded-xl bg-fintech-card border border-fintech-border text-slate-200 hover:text-amber-300 hover:border-amber-400/40 transition-all flex items-center gap-2 shadow-sm font-pixel"
            title="OpenSea Collection (Coming Soon)"
          >
            <OpenSeaLogo className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">OpenSea</span>
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
