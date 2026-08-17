"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertCircle, Loader2, Wallet, PauseCircle } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { TaskItem } from "./TaskItem";
import { MathCaptchaWidget } from "./MathCaptchaWidget";
import { Task } from "@/lib/db/schema";
import { evmAddressRegex } from "@/lib/validation/schemas";

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (wallet: string) => void;
}

export function QuestModal({ isOpen, onClose, onSuccess }: QuestModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [applicationEnabled, setApplicationEnabled] = useState(true);
  const [visitedTaskIds, setVisitedTaskIds] = useState<string[]>([]);
  // Per-task proof values: { [taskId]: proofUrl }
  const [taskProofs, setTaskProofs] = useState<Record<string, string>>({});

  const [walletAddress, setWalletAddress] = useState("");
  const [mathChallengeId, setMathChallengeId] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch active tasks & settings from API
  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
      if (data.applicationEnabled !== undefined) {
        setApplicationEnabled(Boolean(data.applicationEnabled));
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  const handleVisitTask = (taskId: string, url?: string | null) => {
    if (url && url.trim().length > 0) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    setVisitedTaskIds((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
  };

  const handleProofChange = (taskId: string, value: string) => {
    setTaskProofs((prev) => ({ ...prev, [taskId]: value }));
    if (errorMsg) setErrorMsg("");
  };

  // A task is considered "complete" when:
  // - It's been visited OR proof is filled
  // - AND if proofRequired, the proofValue is non-empty
  const isTaskComplete = (task: Task): boolean => {
    const proofVal = (taskProofs[task.id] || "").trim();
    const hasProof = proofVal.length > 2;

    if (task.proofRequired) {
      return hasProof;
    }
    return visitedTaskIds.includes(task.id) || hasProof;
  };

  const completedTaskIds = tasks.filter(isTaskComplete).map((t) => t.id);

  // Required Tasks enforcement
  const requiredTasks = tasks.filter((t) => t.required && t.active);
  const completedRequiredCount = requiredTasks.filter((t) => isTaskComplete(t)).length;
  const isAllRequiredCompleted = requiredTasks.length > 0 && completedRequiredCount >= requiredTasks.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!applicationEnabled) {
      setErrorMsg("Whitelist applications are currently paused by the administration.");
      return;
    }

    // 1. Determine EVM wallet address: from input box OR from task proofs
    let effectiveWallet = walletAddress.trim();
    if (!effectiveWallet) {
      const proofWith0x = Object.values(taskProofs).find((val) => evmAddressRegex.test(val.trim()));
      if (proofWith0x) effectiveWallet = proofWith0x.trim();
    }

    if (!effectiveWallet || !evmAddressRegex.test(effectiveWallet)) {
      setErrorMsg("Please enter a valid EVM wallet address (0x followed by 40 hex characters).");
      return;
    }

    // 2. Extract Twitter handle from task proofs if available
    let detectedTwitter = "";
    for (const task of tasks) {
      const val = (taskProofs[task.id] || "").trim();
      if (task.type === "x_follow" || val.startsWith("@") || val.includes("x.com/") || val.includes("twitter.com/")) {
        detectedTwitter = val;
        break;
      }
    }

    // 3. Extract Reply/Tweet link from task proofs
    let detectedReplyLink = "";
    for (const task of tasks) {
      const val = (taskProofs[task.id] || "").trim();
      if (task.type === "x_repost" || val.includes("/status/")) {
        detectedReplyLink = val;
        break;
      }
    }

    if (!isAllRequiredCompleted) {
      setErrorMsg("Please complete all required quests and fill the proof boxes before submitting.");
      return;
    }

    if (!mathAnswer.trim()) {
      setErrorMsg("Please solve the Math CAPTCHA verification problem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/whitelist/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: effectiveWallet,
          twitterUsername: detectedTwitter || `@${effectiveWallet.slice(2, 10)}`,
          replyCommentLink: detectedReplyLink || "Completed via task quest",
          completedTaskIds,
          mathChallengeId,
          mathAnswer,
          taskProofs,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.error || "Submission failed. Please check your details and try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(effectiveWallet);
    } catch (err) {
      setLoading(false);
      setErrorMsg("Submission error. Please check your connection and try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-obsidian/90 backdrop-blur-xl overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-fintech-card border border-fintech-border rounded-2xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-fintech-border flex items-center justify-between bg-obsidian-light/60">
            <div>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-amber-300 tracking-wider">
                WeZards Whitelist Quests
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1 font-sans">
                Complete the quests and enter proof details to reserve your placement.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-fintech-card transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Whitelist Paused Banner */}
            {!applicationEnabled && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-sans flex items-center gap-3 shadow-md">
                <PauseCircle className="w-5 h-5 shrink-0 text-amber-400" />
                <span className="leading-relaxed">
                  Whitelist applications are currently paused by the administration.
                </span>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-sans font-medium flex items-center gap-3 shadow-md">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* ── Whitelist Quests (each task has its own proof box) ── */}
            <div className="space-y-3 font-sans">
              <h4 className="text-sm sm:text-base font-display font-extrabold uppercase tracking-wider text-amber-300 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-400">
                Whitelist Quests
              </h4>

              <ProgressBar completedCount={completedRequiredCount} totalCount={requiredTasks.length} />

              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isCompleted={isTaskComplete(task)}
                    proofValue={taskProofs[task.id] || ""}
                    onVisitTask={handleVisitTask}
                    onProofChange={handleProofChange}
                  />
                ))}
              </div>
            </div>

            {/* ── Required EVM Wallet Address Box ── */}
            <div className="space-y-2 pt-3 border-t border-fintech-border/50">
              <label className="block text-xs sm:text-sm text-amber-200 font-bold font-display tracking-wide">
                EVM Wallet Address <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="0x1234567890abcdef1234567890abcdef12345678"
                  value={walletAddress}
                  onChange={(e) => {
                    setWalletAddress(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-obsidian-light border border-fintech-border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Provide your Ethereum / EVM compatible wallet address (0x...) to receive whitelist allocation.
              </p>
            </div>

            {/* ── Math CAPTCHA ── */}
            <div className="pt-2 border-t border-fintech-border/50">
              <MathCaptchaWidget
                onChallengeReady={(challengeId, answer) => {
                  setMathChallengeId(challengeId);
                  setMathAnswer(answer);
                }}
              />
            </div>

            {/* ── Submit Button ── */}
            <button
              type="submit"
              disabled={!applicationEnabled || !isAllRequiredCompleted || !mathAnswer || (!walletAddress && !Object.values(taskProofs).some(v => evmAddressRegex.test(v.trim()))) || loading}
              className={`w-full py-4 px-6 rounded-xl font-display font-extrabold text-sm sm:text-base tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
                applicationEnabled && isAllRequiredCompleted && mathAnswer && (walletAddress || Object.values(taskProofs).some(v => evmAddressRegex.test(v.trim()))) && !loading
                  ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-obsidian hover:from-yellow-300 hover:to-amber-400 shadow-amber-500/30 cursor-pointer hover:scale-[1.01]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>VERIFYING QUESTS & SAVING TO DATABASE...</span>
                </>
              ) : !applicationEnabled ? (
                <span>WHITELIST SUBMISSIONS PAUSED</span>
              ) : isAllRequiredCompleted && mathAnswer && (walletAddress || Object.values(taskProofs).some(v => evmAddressRegex.test(v.trim()))) ? (
                <>
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  <span>SUBMIT WHITELIST APPLICATION</span>
                </>
              ) : (
                <span>COMPLETE QUESTS & ENTER WALLET ({completedRequiredCount}/{requiredTasks.length})</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
