import React from "react";
import { Sparkles, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-fintech-border bg-obsidian-light/40 py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-fintech-green" />
          <span className="font-display font-bold text-sm tracking-wider text-white">WEZARDS</span>
          <span className="text-xs text-fintech-subtext font-mono">© 2026 WeZards Sanctum. All rights reserved.</span>
        </div>


      </div>
    </footer>
  );
}
