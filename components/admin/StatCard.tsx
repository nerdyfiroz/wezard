import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subText?: string;
  icon: LucideIcon;
  color?: "green" | "purple" | "cyan" | "gold" | "red" | "slate";
}

export function StatCard({ title, value, subText, icon: Icon, color = "green" }: StatCardProps) {
  const colorMap = {
    green: "bg-fintech-green/10 text-fintech-green border-fintech-green/20",
    purple: "bg-arcane-purple/10 text-purple-400 border-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    gold: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    slate: "bg-slate-800 text-slate-300 border-slate-700",
  };

  return (
    <div className="p-5 rounded-2xl bg-fintech-card border border-fintech-border flex items-start justify-between">
      <div>
        <span className="text-xs font-mono font-medium text-fintech-subtext uppercase tracking-wider">{title}</span>
        <div className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">{value}</div>
        {subText && <p className="text-[11px] text-slate-400 mt-1 font-mono">{subText}</p>}
      </div>
      <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
