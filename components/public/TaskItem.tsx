"use client";

import React from "react";
import { Check, Sparkles, Globe, Wallet, AlertCircle } from "lucide-react";
import { Task } from "@/lib/db/schema";
import { XLogo } from "./Navbar";

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  proofValue: string;
  onVisitTask: (taskId: string, url?: string | null) => void;
  onProofChange: (taskId: string, value: string) => void;
}

export function TaskItem({
  task,
  isCompleted,
  proofValue,
  onVisitTask,
  onProofChange,
}: TaskItemProps) {
  const isCombinedFollow =
    task.title.toLowerCase().includes("@we_zards") ||
    task.title.toLowerCase().includes("follow");
  const isLikeRepost =
    task.type === "x_repost" ||
    task.type === "x_like" ||
    task.title.toLowerCase().includes("like") ||
    task.title.toLowerCase().includes("repost") ||
    task.title.toLowerCase().includes("retweet");
  const isComment =
    task.title.toLowerCase().includes("comment") ||
    task.description.toLowerCase().includes("comment");

  // Determine placeholder based on task type
  let defaultPlaceholder = "https://x.com/... (paste link or proof)";

  if (isCombinedFollow || task.type === "x_follow") {
    defaultPlaceholder = "@yourusername (or profile link)";
  } else if (isComment) {
    defaultPlaceholder = "https://x.com/.../status/... (comment link)";
  } else if (isLikeRepost) {
    defaultPlaceholder = "https://x.com/.../status/... (retweet/quote link)";
  } else if (task.type === "submit_wallet") {
    defaultPlaceholder = "0x1234567890abcdef1234567890abcdef12345678";
  }

  const hasProofBox = task.proofLabel !== "__disabled__";
  const isProofFilled =
    !hasProofBox || !task.proofRequired || proofValue.trim().length > 1;

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

  // Render Title with embedded links (No ExternalLink icons)
  const renderInteractiveTitle = () => {
    if (
      task.title.includes("@We_Zards") &&
      task.title.includes("@SickickZards")
    ) {
      return (
        <span className="font-display font-bold text-base sm:text-lg text-white">
          Follow{" "}
          <a
            href="https://x.com/We_Zards"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onVisitTask(task.id, "https://x.com/We_Zards");
            }}
            className="text-amber-300 hover:text-amber-200 underline decoration-amber-400/50 hover:decoration-amber-300 transition-colors"
          >
            @We_Zards
          </a>{" "}
          and{" "}
          <a
            href="https://x.com/SickickZards"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onVisitTask(task.id, "https://x.com/SickickZards");
            }}
            className="text-amber-300 hover:text-amber-200 underline decoration-amber-400/50 hover:decoration-amber-300 transition-colors"
          >
            @SickickZards
          </a>
        </span>
      );
    }

    if (
      task.title.toLowerCase().includes("like") &&
      (task.title.toLowerCase().includes("repost") ||
        task.title.toLowerCase().includes("retweet"))
    ) {
      const targetUrl = task.url && task.url.length > 0 ? task.url : "https://x.com/We_Zards";
      return (
        <span className="font-display font-bold text-base sm:text-lg text-white">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onVisitTask(task.id, targetUrl);
            }}
            className="text-amber-300 hover:text-amber-200 underline decoration-amber-400/50 hover:decoration-amber-300 transition-colors"
          >
            {task.title}
          </a>
        </span>
      );
    }

    if (isComment) {
      const targetUrl = task.url && task.url.length > 0 ? task.url : "https://x.com/We_Zards";
      return (
        <span className="font-display font-bold text-base sm:text-lg text-white">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onVisitTask(task.id, targetUrl);
            }}
            className="text-amber-300 hover:text-amber-200 underline decoration-amber-400/50 hover:decoration-amber-300 transition-colors"
          >
            {task.title}
          </a>
        </span>
      );
    }

    // Default clickable link if URL exists
    if (task.url && task.url.trim().length > 0) {
      return (
        <a
          href={task.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onVisitTask(task.id, task.url);
          }}
          className="font-display font-bold text-base sm:text-lg text-amber-300 hover:text-amber-200 underline decoration-amber-400/50 hover:decoration-amber-300 transition-colors"
        >
          {task.title}
        </a>
      );
    }

    return (
      <span className="font-display font-bold text-base sm:text-lg text-white">
        {task.title}
      </span>
    );
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        isCompleted && isProofFilled
          ? "bg-amber-500/10 border-amber-400/40 shadow-sm shadow-amber-500/10"
          : "bg-fintech-card/80 border-fintech-border"
      }`}
    >
      {/* Main Task Row */}
      <div className="p-4 sm:p-5 flex items-start gap-4 font-pixel">
        {/* Icon / Checkmark */}
        <div
          className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-pixel ${
            isCompleted && isProofFilled
              ? "bg-gradient-to-r from-amber-300 to-amber-500 text-obsidian border-amber-400 font-bold shadow-md shadow-amber-400/20"
              : "bg-obsidian-light text-slate-400 border-fintech-border group-hover:border-amber-400/30"
          }`}
        >
          {isCompleted && isProofFilled ? (
            <Check className="w-6 h-6 stroke-[3]" />
          ) : (
            getIcon()
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2.5 flex-wrap">
            {renderInteractiveTitle()}

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

          {task.description && task.description.trim().length > 0 && (
            <p className="text-xs sm:text-sm text-fintech-subtext mt-1.5 leading-relaxed font-pixel">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Proof Box (underneath each task) with Off-White background & Glow ── */}
      {hasProofBox && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="relative">
            <input
              type="text"
              value={proofValue}
              onChange={(e) => onProofChange(task.id, e.target.value)}
              placeholder={defaultPlaceholder}
              className="w-full px-3.5 py-2.5 bg-[#f4f4f6] text-[#111827] placeholder-slate-500 rounded-lg text-xs font-mono font-semibold border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.18)] focus:outline-none focus:border-amber-400 focus:shadow-[0_0_18px_rgba(245,158,11,0.38)] focus:ring-1 focus:ring-amber-400 transition-all"
            />
            {task.proofRequired && isCompleted && proofValue.trim().length === 0 && (
              <p className="mt-1.5 text-[10px] text-amber-400/90 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Proof required to complete this task
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
