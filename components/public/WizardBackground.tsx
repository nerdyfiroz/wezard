"use client";

import React from "react";

export function WizardBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#161821]">
      {/* ── Mystical Grey Ambient Gradient & Soft Lighting ─────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#181b24] via-[#151720] to-[#12131a]" />

      {/* ── Arcane Golden Sanctum Ambient Halo ─────────────────────── */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-amber-400/[0.04] blur-[140px] pointer-events-none" />
      
      {/* ── Mystical Purple & Celestial Orbs ──────────────────────── */}
      <div className="absolute top-1/3 -left-20 w-[450px] h-[450px] rounded-full bg-purple-600/[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-cyan-600/[0.04] blur-[130px] pointer-events-none" />

      {/* ── Static Wizard Arcane Circle & Runes (No CPU/Canvas loop) ─ */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-amber-400/[0.07] pointer-events-none opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-dashed border-purple-400/[0.08] pointer-events-none opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-cyan-400/[0.06] pointer-events-none opacity-40" />

      {/* ── Subtle Wizard Arcane Runes (Static Placed) ─────────────── */}
      <span className="absolute top-[15%] left-[10%] text-xl text-amber-300/[0.12] select-none font-mono">✦</span>
      <span className="absolute top-[28%] right-[14%] text-lg text-purple-300/[0.12] select-none font-mono">✧</span>
      <span className="absolute top-[52%] left-[6%] text-2xl text-cyan-300/[0.10] select-none font-mono">🔮</span>
      <span className="absolute top-[68%] right-[8%] text-xl text-amber-300/[0.12] select-none font-mono">★</span>
      <span className="absolute bottom-[18%] left-[18%] text-lg text-purple-300/[0.12] select-none font-mono">✦</span>
      <span className="absolute bottom-[10%] right-[22%] text-2xl text-amber-300/[0.10] select-none font-mono">📜</span>

      {/* ── Arcane Grid Matrix Texture ─────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(245, 158, 11, 0.5) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}
