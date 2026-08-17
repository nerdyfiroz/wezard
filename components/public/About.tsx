"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, Gem, Wand2 } from "lucide-react";

const STATS = [
  {
    value: "3,333",
    label: "Wezards",
    icon: <Gem className="w-5 h-5" />,
    color: "text-amber-300",
    border: "border-amber-400/20",
    bg: "bg-amber-400/5",
    glow: "shadow-amber-500/10",
  },
  {
    value: "40×40",
    label: "Pixel Art",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-arcane-purple",
    border: "border-purple-500/20",
    bg: "bg-purple-500/5",
    glow: "shadow-purple-500/10",
  },
  {
    value: "200+",
    label: "Traits",
    icon: <Wand2 className="w-5 h-5" />,
    color: "text-arcane-cyan",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
    glow: "shadow-cyan-500/10",
  },
];

const TRAITS = [
  {
    icon: "🧙",
    title: "Wizard World",
    desc: "A pixelated realm of wizards, witches & mystical energy — every corner alive with arcane wonder.",
  },
  {
    icon: "🪶",
    title: "On Robinhood Chain",
    desc: "Exclusively minting on @robinhoodcrypto — bringing magic to one of the world's most trusted platforms.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" },
  }),
};

export function About() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="about"
      className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden"
    >
      {/* ── Ambient Glow ─────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 w-[500px] h-[500px] rounded-full bg-amber-400/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-0 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto">

        {/* ── Section Badge ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-200 text-[11px] font-mono tracking-widest uppercase shadow-lg shadow-amber-400/10">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            The World of WeZards
          </span>
        </motion.div>

        {/* ── Headline ──────────────────────────────────────────────────── */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="text-center font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-white leading-[1.1] tracking-tight mb-6"
        >
          A Fantasy Realm,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
            Pixel by Pixel
          </span>
        </motion.h2>

        {/* ── Lead Text ─────────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="text-center text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-14 font-sans"
        >
          WeZards is a{" "}
          <span className="text-amber-300 font-semibold">fantasy & aesthetic pixelated world</span> of wizards —
          inspired by witches, mystical orbs, and magical energy. Each piece brought to life in{" "}
          <span className="text-white font-semibold">40×40 pixel art</span>.
        </motion.p>

        {/* ── Stats Row (3 Cards) ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-14">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border ${s.border} ${s.bg} shadow-xl ${s.glow} group hover:scale-[1.03] transition-transform duration-300`}
            >
              <div className={`${s.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                {s.icon}
              </div>
              <span className={`font-display font-extrabold text-3xl ${s.color} tracking-wider`}>
                {s.value}
              </span>
              <span className="text-slate-500 text-[11px] font-mono uppercase tracking-widest">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* ── Main Content Block (Wizard World & On Robinhood Crypto) ───── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {TRAITS.map((t, i) => (
            <motion.div
              key={t.title}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              className="group relative p-6 rounded-2xl border border-fintech-border bg-fintech-card/70 hover:border-amber-400/25 hover:bg-fintech-card transition-all duration-300 overflow-hidden"
            >
              {/* Hover glow accent */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-amber-400/[0.04] to-transparent pointer-events-none rounded-2xl" />

              <div className="flex items-start gap-4 relative">
                {/* Pixel Emoji Icon */}
                <div className="w-12 h-12 rounded-xl bg-obsidian-light border border-fintech-border flex items-center justify-center text-2xl shrink-0 group-hover:border-amber-400/30 transition-colors duration-300 shadow-inner">
                  {t.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white mb-1.5 group-hover:text-amber-200 transition-colors duration-200">
                    {t.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-sans">{t.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
