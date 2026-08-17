"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  completedCount: number;
  totalCount: number;
}

export function ProgressBar({ completedCount, totalCount }: ProgressBarProps) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllDone = totalCount > 0 && completedCount >= totalCount;

  return (
    <div className="w-full bg-fintech-card p-4 rounded-xl border border-fintech-border mb-6">
      <div className="flex items-center justify-between text-xs font-mono mb-2">
        <span className="text-slate-300 font-semibold flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isAllDone ? "bg-fintech-green animate-pulse" : "bg-amber-400"}`} />
          {completedCount} / {totalCount} Required Quests Completed
        </span>
        <span className={isAllDone ? "text-fintech-green font-bold" : "text-slate-400"}>
          {percentage}% Complete
        </span>
      </div>

      <div className="w-full h-2.5 bg-obsidian-light rounded-full overflow-hidden p-0.5 border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full transition-all duration-300 ${
            isAllDone
              ? "bg-gradient-to-r from-fintech-green via-emerald-400 to-arcane-purple shadow-sm shadow-fintech-green"
              : "bg-gradient-to-r from-fintech-green/60 to-emerald-500"
          }`}
        />
      </div>
    </div>
  );
}
