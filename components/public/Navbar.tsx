"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock } from "lucide-react";

export function Navbar({ onOpenQuests }: { onOpenQuests: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-obsidian/80 border-b border-fintech-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
            <div className="w-full h-full bg-obsidian rounded-[10px] flex items-center justify-center p-1 overflow-hidden">
              <Image
                src="/Wizeffgmbers.png"
                alt="WeZards Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold tracking-widest text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-sm">
              WEZARDS
            </span>
            <span className="text-[10px] tracking-widest text-amber-300/80 font-mono uppercase -mt-1 font-semibold">
              CIRCLE QUEST
            </span>
          </div>
        </Link>

        {/* Live Status & Navigation */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden xs:flex items-center gap-2 px-3 py-1 rounded-full bg-fintech-card/80 border border-amber-500/30 text-xs text-amber-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span className="font-mono text-[11px] tracking-wide">CIRCLE OPEN</span>
          </div>

          <button
            onClick={onOpenQuests}
            className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wider text-obsidian bg-gradient-to-r from-fintech-green to-emerald-400 hover:from-emerald-400 hover:to-fintech-green transition-all duration-200 shadow-md shadow-fintech-green/25 hover:shadow-fintech-green/40 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>JOIN WHITELIST</span>
          </button>

          <Link
            href="/admin/login"
            className="p-2 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-fintech-card transition-colors"
            title="Admin Portal"
          >
            <Lock className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
