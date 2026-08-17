"use client";

import React, { useState } from "react";
import { Check, ExternalLink, Sparkles, Globe, Wallet, Link2, AlertCircle } from "lucide-react";
import { Task } from "@/lib/db/schema";
import { XLogo } from "./Navbar";

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  proofValue: string;
  onVisitTask: (taskId: string, url?: string | null) => void;
  onProofChange: (taskId: string, value: string) => void;
}

export function TaskItem({ task, isCompleted, proofValue, onVisitTask, onProofChange }: TaskItemProps) {
  const isCombinedFollow = task.title.includes("@We_Zards") && task.title.includes("@SickickZards");

  // Always show proof box for each task unless explicitly set to "__disabled__"
  const hasProofBox = task.proofLabel !== "__disabled__";
  const proofLabelText = task.proofLabel && task.proofLabel.trim().length > 0
    ? task.proofLabel
    : "Submit Task Proof Link / Verification URL";
  const isProofFilled = !hasProofBox || !task.proofRequired || proofValue.trim().length > 3;

  // Task is "visited" when they clicked the link OR filled proof
  const isVisited = isCompleted;

  const getIcon = () => {
    switch (task.type) {
      case "x_follow":
      case "x_like":
      case "x_repost":
        return <XLogo className="w-5 h-5 text-white" />;
      case "visit_url":
        return <Globe className="w-5 h-5 text-purple-400" />;
      case "submit_wallet":
        return <Wallet className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCombinedFollow) {
      window.open("https://x.com/We_Zards", "_blank", "noopener,noreferrer");
      window.open("https://x.com/SickickZards", "_blank", "noopener,noreferrer");
      onVisitTask(task.id, "https://x.com/We_Zards");
    } else {
      onVisitTask(task.id, task.url);
    }
  };

  const buttonLabel = task.url && task.url.trim().length > 0 ? "Open Link" : "Fill Details";

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        isCompleted && isProofFilled
          ? "bg-amber-500/10 border-amber-400/40 shadow-sm shadow-amber-500/10"
          : "bg-fintech-card/80 border-fintech-border"
      }`}
    >
      {/* Main Task Row */}
      <div
        onClick={handleAction}
        className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-pixel hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-start gap-4">
          {/* Icon / Checkmark */}
          <div
            className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-pixel ${
              isCompleted && isProofFilled
                ? "bg-gradient-to-r from-amber-300 to-amber-500 text-obsidian border-amber-400 font-bold shadow-md shadow-amber-400/20"
                : "bg-obsidian-light text-slate-400 border-fintech-border group-hover:border-amber-400/30"
            }`}
          >
            {isCompleted && isProofFilled ? <Check className="w-6 h-6 stroke-[3]" /> : getIcon()}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4
                className={`font-display font-bold text-base sm:text-lg ${
                  isCompleted && isProofFilled ? "text-amber-200" : "text-white"
                }`}
              >
                {task.title}
              </h4>

              {task.required ? (
                <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  REQUIRED
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                  OPTIONAL
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-fintech-subtext mt-1 leading-relaxed font-pixel">{task.description}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {isCompleted && isProofFilled ? (
            <div className="px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-sm shadow-amber-400/10">
              <span className="font-pixel text-base">✓</span>
              <span>Completed</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAction}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-obsidian border border-amber-400/40 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-[1.02]"
            >
              <span>{buttonLabel}</span>
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* ── Proof Box (underneath each task) ── */}
      {hasProofBox && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <div className={`rounded-xl border p-3 transition-all ${
            proofValue.trim().length > 3
              ? "border-cyan-400/40 bg-cyan-500/5"
              : "border-fintech-border/60 bg-obsidian-light/40"
          }`}>
            <label className="flex items-center gap-1.5 text-[11px] font-mono font-semibold mb-2 text-slate-300">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{proofLabelText}</span>
              {task.proofRequired && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 font-bold">
                  REQUIRED
                </span>
              )}
            </label>
            <input
              type="url"
              value={proofValue}
              onChange={(e) => onProofChange(task.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="https://x.com/... (paste link or proof)"
              className="w-full px-3 py-2.5 bg-obsidian border border-fintech-border/60 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all font-mono"
            />
            {task.proofRequired && isCompleted && proofValue.trim().length <= 3 && (
              <p className="mt-1.5 text-[10px] text-amber-400/80 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Proof link required to complete this task
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
