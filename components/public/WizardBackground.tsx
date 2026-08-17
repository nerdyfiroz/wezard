"use client";

import React, { useEffect, useRef } from "react";

export function WizardBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Magical Wizard Particles (Golden Stardust, Arcane Purple Sparkles, Celestial Cyan Dust)
    const particleCount = Math.min(Math.floor(width / 12), 120);
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
      alpha: number;
      alphaChange: number;
      pulseSpeed: number;
    }> = [];

    const colors = [
      "rgba(245, 158, 11, ",  // Arcane Gold
      "rgba(253, 230, 138, ", // Light Golden Stardust
      "rgba(139, 92, 246, ", // Mystical Purple
      "rgba(6, 182, 212, ",  // Celestial Cyan
      "rgba(16, 185, 129, ",  // Emerald Aura
    ];

    for (let i = 0; i < particleCount; i++) {
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 0.5,
        color: colorBase,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.15, // float upwards like wizard magic
        alpha: Math.random() * 0.7 + 0.2,
        alphaChange: (Math.random() - 0.5) * 0.015,
        pulseSpeed: Math.random() * 0.05 + 0.02,
      });
    }

    // Arcane Runes floating in background space
    const runeSymbols = ["✦", "✧", "⚡", "🔮", "🔯", "✵", "✸", "☽", "★", "📜"];
    const runes: Array<{
      x: number;
      y: number;
      symbol: string;
      size: number;
      color: string;
      vy: number;
      alpha: number;
      rotation: number;
      vRot: number;
    }> = [];

    for (let i = 0; i < 18; i++) {
      runes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        symbol: runeSymbols[Math.floor(Math.random() * runeSymbols.length)],
        size: Math.floor(Math.random() * 14) + 12,
        color: Math.random() > 0.4 ? "rgba(245, 158, 11, " : "rgba(139, 92, 246, ",
        vy: -Math.random() * 0.3 - 0.1,
        alpha: Math.random() * 0.3 + 0.1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.01,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // 1. Render Mystical Nebulae & Shifting Auroras
      const aura1X = width * 0.5 + Math.sin(time * 0.5) * 100;
      const aura1Y = height * 0.3 + Math.cos(time * 0.3) * 60;
      const glow1 = ctx.createRadialGradient(aura1X, aura1Y, 20, aura1X, aura1Y, width * 0.45);
      glow1.addColorStop(0, "rgba(245, 158, 11, 0.08)");
      glow1.addColorStop(0.5, "rgba(139, 92, 246, 0.06)");
      glow1.addColorStop(1, "transparent");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const aura2X = width * 0.2 + Math.cos(time * 0.4) * 80;
      const aura2Y = height * 0.7 + Math.sin(time * 0.6) * 80;
      const glow2 = ctx.createRadialGradient(aura2X, aura2Y, 10, aura2X, aura2Y, width * 0.4);
      glow2.addColorStop(0, "rgba(139, 92, 246, 0.09)");
      glow2.addColorStop(1, "transparent");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      const aura3X = width * 0.8 + Math.sin(time * 0.3) * 90;
      const aura3Y = height * 0.5 + Math.cos(time * 0.5) * 70;
      const glow3 = ctx.createRadialGradient(aura3X, aura3Y, 10, aura3X, aura3Y, width * 0.35);
      glow3.addColorStop(0, "rgba(6, 182, 212, 0.07)");
      glow3.addColorStop(1, "transparent");
      ctx.fillStyle = glow3;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Floating Arcane Runes
      runes.forEach((r) => {
        r.y += r.vy;
        r.rotation += r.vRot;

        if (r.y < -30) {
          r.y = height + 30;
          r.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rotation);
        ctx.font = `${r.size}px monospace`;
        ctx.fillStyle = `${r.color}${r.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `${r.color}0.8)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(r.symbol, 0, 0);
        ctx.restore();
      });

      // 3. Render Floating Stardust & Magical Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaChange;

        if (p.alpha <= 0.1 || p.alpha >= 0.85) {
          p.alphaChange = -p.alphaChange;
        }

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.shadowBlur = p.radius * 4;
        ctx.shadowColor = `${p.color}0.9)`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#07090E]">
      {/* Canvas background for particles, nebulae, & runes */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Layer 1: Ethereal Shimmering Arcane Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full border border-amber-500/10 pointer-events-none animate-spin-slow opacity-50 blur-[0.5px]" />
      
      {/* Layer 2: Reverse Inner Rune Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-dashed border-purple-500/15 pointer-events-none animate-spin-slow [animation-direction:reverse] opacity-40" />

      {/* Layer 3: Central Golden Sanctum Core Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-500/5 via-purple-600/5 to-cyan-500/5 blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Subtle Mystical Grid Matrix Effect */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(245, 158, 11, 0.4) 1px, transparent 0)`,
          backgroundSize: "36px 36px",
        }}
      />
    </div>
  );
}
