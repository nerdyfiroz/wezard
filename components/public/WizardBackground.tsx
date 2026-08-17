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

    // Particles system: combination of glowing wizard dust, stars, and green fintech sparks
    const particleCount = Math.min(Math.floor(width / 15), 90);
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
      alpha: number;
      alphaChange: number;
    }> = [];

    const colors = [
      "rgba(16, 185, 129, ", // Emerald Green
      "rgba(139, 92, 246, ", // Arcane Purple
      "rgba(6, 182, 212, ",  // Celestial Cyan
      "rgba(245, 158, 11, ", // Arcane Gold
    ];

    for (let i = 0; i < particleCount; i++) {
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        color: colorBase,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1, // slowly float upwards
        alpha: Math.random() * 0.7 + 0.2,
        alphaChange: (Math.random() - 0.5) * 0.01,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render radial glow spots in background
      const ambientGlow1 = ctx.createRadialGradient(
        width * 0.2,
        height * 0.3,
        10,
        width * 0.2,
        height * 0.3,
        width * 0.4
      );
      ambientGlow1.addColorStop(0, "rgba(139, 92, 246, 0.07)");
      ambientGlow1.addColorStop(1, "transparent");
      ctx.fillStyle = ambientGlow1;
      ctx.fillRect(0, 0, width, height);

      const ambientGlow2 = ctx.createRadialGradient(
        width * 0.8,
        height * 0.7,
        10,
        width * 0.8,
        height * 0.7,
        width * 0.4
      );
      ambientGlow2.addColorStop(0, "rgba(16, 185, 129, 0.08)");
      ambientGlow2.addColorStop(1, "transparent");
      ctx.fillStyle = ambientGlow2;
      ctx.fillRect(0, 0, width, height);

      // Render particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaChange;

        if (p.alpha <= 0.1 || p.alpha >= 0.8) {
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
        ctx.shadowBlur = 8;
        ctx.shadowColor = `${p.color}0.8)`;
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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-obsidian">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      {/* Subtle Arcane Circle Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-arcane-purple/10 pointer-events-none animate-spin-slow opacity-40 blur-[1px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-dashed border-fintech-green/10 pointer-events-none animate-spin-slow [animation-direction:reverse] opacity-30" />
    </div>
  );
}
