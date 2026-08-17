"use client";

import React from "react";
import { Check, ExternalLink, Twitter, Sparkles, Globe, Wallet } from "lucide-react";
import { Task } from "@/lib/db/schema";

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onVisitTask: (taskId: string, url?: string | null) => void;
}

export function TaskItem({ task, isCompleted, onVisitTask }: TaskItemProps) {
  const getIcon = () => {
    switch (task.type) {
      case "x_follow":
      case "x_like":
      case "x_repost":
        return <Twitter className="w-5 h-5 text-cyan-400" />;
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
    onVisitTask(task.id, task.url);
  };

  const buttonLabel = task.url && task.url.trim().length > 0 ? "Open Link" : "Fill Details";

  return (
    <div
      onClick={handleAction}
      className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-pixel ${
        isCompleted
          ? "bg-amber-500/10 border-amber-400/40 shadow-sm shadow-amber-500/10"
          : "bg-fintech-card/80 border-fintech-border hover:border-amber-400/40 hover:bg-fintech-card"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-pixel ${
            isCompleted
              ? "bg-gradient-to-r from-amber-300 to-amber-500 text-obsidian border-amber-400 font-bold shadow-md shadow-amber-400/20"
              : "bg-obsidian-light text-slate-400 border-fintech-border group-hover:border-amber-400/30"
          }`}
        >
          {isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : getIcon()}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4
              className={`font-display font-bold text-base sm:text-lg ${
                isCompleted ? "text-amber-200" : "text-white"
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

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {isCompleted ? (
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
            {task.url && task.url.trim().length > 0 && <ExternalLink className="w-4 h-4 stroke-[2.5]" />}
          </button>
        )}
      </div>
    </div>
  );
}
