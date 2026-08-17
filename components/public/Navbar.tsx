"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Lock } from "lucide-react";

export function Navbar({ onOpenQuests }: { onOpenQuests: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-obsidian/80 border-b border-fintech-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-fintech-green via-emerald-600 to-arcane-purple p-0.5 shadow-lg shadow-fintech-green/20 group-hover:shadow-fintech-green/40 transition-all duration-300">
            <div className="w-full h-full bg-obsidian rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-fintech-green group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold tracking-widest text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-emerald-400">
              WEZARDS
            </span>
            <span className="text-[10px] tracking-widest text-fintech-subtext font-mono uppercase -mt-1">
              CIRCLE QUEST
            </span>
          </div>
        </Link>

        {/* Live Status & Navigation */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden xs:flex items-center gap-2 px-3 py-1 rounded-full bg-fintech-card/80 border border-fintech-border text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fintech-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-fintech-green"></span>
            </span>
            <span className="font-mono text-[11px] tracking-wide">CIRCLE OPEN</span>
          </div>

          <button
            onClick={onOpenQuests}
            className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wider text-obsidian bg-fintech-green hover:bg-fintech-green-hover transition-all duration-200 shadow-md shadow-fintech-green/25 hover:shadow-fintech-green/40 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>JOIN WHITELIST</span>
          </button>

          <Link
            href="/admin/login"
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-fintech-card transition-colors"
            title="Admin Portal"
          >
            <Lock className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
