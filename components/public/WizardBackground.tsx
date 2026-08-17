"use client";

import React from "react";

export function WizardBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#1f2229]">
      {/* ── 1. Base Slate-Grey Palette (from Wizeffgmbers.png) ─────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#282b35] via-[#21242d] to-[#1a1c24]" />

      {/* ── 2. Cyan Wizard Eye Glow Aura (Cyan #00f0ff accent) ─────────── */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-[#00f0ff]/[0.035] blur-[140px] pointer-events-none" />
      
      {/* ── 3. Wizard Hat Earth & Plum Glow Accents ──────────────────── */}
      <div className="absolute top-[8%] -right-16 w-[450px] h-[450px] rounded-full bg-[#6e443b]/[0.06] blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[15%] -left-16 w-[500px] h-[500px] rounded-full bg-[#415949]/[0.05] blur-[140px] pointer-events-none" />

      {/* ── 4. Iconic Pixel-Art Feather Watermarks (from Wizeffgmbers.png) */}
      {/* Top-Right Big Feather Silhouette */}
      <div className="absolute -top-10 right-4 sm:right-16 md:right-32 w-72 sm:w-96 h-72 sm:h-96 opacity-[0.06] select-none pointer-events-none rotate-[25deg]">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-slate-100">
          {/* Pixelated Quill Feather steps */}
          <rect x="68" y="10" width="12" height="12" />
          <rect x="58" y="18" width="14" height="12" />
          <rect x="74" y="24" width="14" height="10" />
          <rect x="50" y="28" width="16" height="12" />
          <rect x="68" y="34" width="16" height="10" />
          <rect x="42" y="38" width="18" height="12" />
          <rect x="62" y="44" width="16" height="10" />
          <rect x="34" y="48" width="18" height="12" />
          <rect x="54" y="54" width="16" height="10" />
          <rect x="26" y="58" width="18" height="12" />
          <rect x="46" y="64" width="14" height="10" />
          <rect x="20" y="68" width="16" height="10" />
          <rect x="36" y="74" width="14" height="10" />
          <rect x="14" y="78" width="14" height="8" />
          <rect x="26" y="82" width="12" height="8" />
          <rect x="10" y="86" width="10" height="6" />
        </svg>
      </div>

      {/* Bottom-Left Secondary Feather Silhouette */}
      <div className="absolute -bottom-16 -left-10 w-64 h-64 opacity-[0.035] select-none pointer-events-none -rotate-[45deg]">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-slate-100">
          <rect x="68" y="10" width="12" height="12" />
          <rect x="58" y="18" width="14" height="12" />
          <rect x="74" y="24" width="14" height="10" />
          <rect x="50" y="28" width="16" height="12" />
          <rect x="68" y="34" width="16" height="10" />
          <rect x="42" y="38" width="18" height="12" />
          <rect x="62" y="44" width="16" height="10" />
          <rect x="34" y="48" width="18" height="12" />
          <rect x="54" y="54" width="16" height="10" />
          <rect x="26" y="58" width="18" height="12" />
          <rect x="20" y="68" width="16" height="10" />
          <rect x="10" y="86" width="10" height="6" />
        </svg>
      </div>

      {/* ── 5. Static Arcane Rings (Grey/Amber/Cyan) ────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] rounded-full border border-slate-400/[0.06] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-dashed border-[#00f0ff]/[0.07] pointer-events-none" />

      {/* ── 6. Pixel Matrix Canvas Texture (40x40 pixel art feel) ───── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
