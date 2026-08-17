"use client";

import React from "react";
import { CheckCircle2, ExternalLink, Twitter, MessageSquare, Send, Wallet, Sparkles, Circle } from "lucide-react";
import { Task } from "@/lib/db/schema";

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onToggleComplete: (taskId: string) => void;
}

export function TaskItem({ task, isCompleted, onToggleComplete }: TaskItemProps) {
  const getIcon = () => {
    switch (task.type) {
      case "x_follow":
      case "x_like":
      case "x_repost":
        return <Twitter className="w-4 h-4 text-cyan-400" />;
      case "discord_join":
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case "telegram_join":
        return <Send className="w-4 h-4 text-sky-400" />;
      case "submit_wallet":
        return <Wallet className="w-4 h-4 text-fintech-green" />;
      default:
        return <Sparkles className="w-4 h-4 text-arcane-gold" />;
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.url) {
      window.open(task.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      onClick={() => onToggleComplete(task.id)}
      className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isCompleted
          ? "bg-fintech-green/10 border-fintech-green/40 shadow-sm shadow-fintech-green/5"
          : "bg-fintech-card/80 border-fintech-border hover:border-fintech-green/30 hover:bg-fintech-card"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
            isCompleted
              ? "bg-fintech-green text-obsidian border-fintech-green"
              : "bg-obsidian-light text-slate-400 border-fintech-border group-hover:border-fintech-green/30"
          }`}
        >
          {isCompleted ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : getIcon()}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`font-display font-semibold text-sm ${
                isCompleted ? "text-slate-200 line-through opacity-80" : "text-white"
              }`}
            >
              {task.title}
            </h4>

            {task.required ? (
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-500/10 text-fintech-green border border-fintech-green/20">
                REQUIRED
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                OPTIONAL
              </span>
            )}

            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-arcane-purple/10 text-purple-300 border border-purple-500/20">
              +{task.points} PTS
            </span>
          </div>

          <p className="text-xs text-fintech-subtext mt-1 leading-relaxed">{task.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {task.url && (
          <button
            type="button"
            onClick={handleActionClick}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-obsidian-light hover:bg-slate-800 text-slate-300 hover:text-white border border-fintech-border transition-colors flex items-center gap-1"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
            isCompleted
              ? "bg-fintech-green text-obsidian font-bold"
              : "bg-fintech-card text-slate-300 border border-fintech-border hover:border-fintech-green/40 hover:text-white"
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </>
          ) : (
            <>
              <Circle className="w-3.5 h-3.5 text-slate-500" />
              <span>Mark Done</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
