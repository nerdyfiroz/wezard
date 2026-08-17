"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function Navbar({ onOpenQuests }: { onOpenQuests: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-obsidian/80 border-b border-fintech-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - Image completely filled in the container */}
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

        {/* Live Status & Navigation (Lock icon removed) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden xs:flex items-center gap-2 px-3.5 py-1 rounded-full bg-fintech-card/80 border border-amber-400/30 text-xs text-amber-200 shadow-sm shadow-amber-400/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span className="font-mono text-[11px] tracking-wide font-semibold text-amber-300">CIRCLE OPEN</span>
          </div>

          {/* Join Whitelist CTA - Golden Gradient */}
          <button
            onClick={onOpenQuests}
            className="px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider text-obsidian bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-md shadow-amber-500/25 hover:shadow-amber-400/40 hover:scale-[1.02] flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>JOIN WHITELIST</span>
          </button>
        </div>
      </div>
    </header>
  );
}
