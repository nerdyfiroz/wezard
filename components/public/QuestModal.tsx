"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Wallet,
  PauseCircle,
} from "lucide-react";
import { Task } from "@/lib/db/schema";
import { TaskItem } from "./TaskItem";
import { MathCaptchaWidget } from "./MathCaptchaWidget";

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (walletAddress: string) => void;
}

export function QuestModal({ isOpen, onClose, onSuccess }: QuestModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [applicationEnabled, setApplicationEnabled] = useState(true);

  // Per-task proof submissions state
  const [taskProofs, setTaskProofs] = useState<Record<string, string>>({});
  const [visitedTasks, setVisitedTasks] = useState<Record<string, boolean>>({});

  // Direct required EVM wallet input
  const [walletAddress, setWalletAddress] = useState("");

  // Math CAPTCHA state
  const [mathChallengeId, setMathChallengeId] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");

  // Submission state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch active tasks from API
  useEffect(() => {
    if (!isOpen) return;
    setLoadingTasks(true);
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) {
          setTasks(data.tasks);
        }
        if (data.applicationEnabled !== undefined) {
          setApplicationEnabled(data.applicationEnabled);
        }
        setLoadingTasks(false);
      })
      .catch((err) => {
        console.error("Failed to load tasks:", err);
        setLoadingTasks(false);
      });
  }, [isOpen]);

  // Handle task proof change
  const handleProofChange = (taskId: string, value: string) => {
    setTaskProofs((prev) => ({ ...prev, [taskId]: value }));
    if (value.trim().length > 0) {
      setVisitedTasks((prev) => ({ ...prev, [taskId]: true }));
    }
  };

  // Handle task link visit
  const handleVisitTask = (taskId: string, url?: string | null) => {
    if (url && url.startsWith("http")) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    setVisitedTasks((prev) => ({ ...prev, [taskId]: true }));
  };

  // Validation
  const requiredTasks = tasks.filter((t) => t.required);
  const isTaskCompleted = (t: Task) => {
    const visited = visitedTasks[t.id] ?? false;
    const proof = taskProofs[t.id]?.trim() ?? "";
    const proofFilled = !t.proofRequired || proof.length > 0;
    return (visited || proof.length > 0) && proofFilled;
  };

  const completedRequiredCount = requiredTasks.filter(isTaskCompleted).length;
  const isAllRequiredCompleted =
    requiredTasks.length === 0 || completedRequiredCount === requiredTasks.length;

  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Whitelist paused check
    if (!applicationEnabled) {
      setErrorMsg("Whitelist applications are currently paused by the administration.");
      return;
    }

    // 2. Resolve wallet address
    let effectiveWallet = walletAddress.trim();
    if (!effectiveWallet) {
      for (const proof of Object.values(taskProofs)) {
        if (evmAddressRegex.test(proof.trim())) {
          effectiveWallet = proof.trim();
          break;
        }
      }
    }

    if (!effectiveWallet || !evmAddressRegex.test(effectiveWallet)) {
      setErrorMsg("Please enter a valid EVM Wallet Address (0x...).");
      return;
    }

    // 3. Verify all required tasks have valid proof
    for (const t of requiredTasks) {
      if (t.proofRequired) {
        const p = taskProofs[t.id]?.trim();
        if (!p || p.length < 1) {
          setErrorMsg(`Please provide the required details for "${t.title}".`);
          return;
        }
      }
    }

    // 4. Verify Math CAPTCHA
    if (!mathAnswer || !mathChallengeId) {
      setErrorMsg("Please solve the Math CAPTCHA challenge before submitting.");
      return;
    }

    // 5. Submit to backend
    setLoading(true);
    try {
      const followTask = tasks.find((t) => t.type === "x_follow");
      const repostTask = tasks.find((t) => t.type === "x_repost");

      const twitterProof = followTask ? taskProofs[followTask.id] || "" : "";
      const replyProof = repostTask ? taskProofs[repostTask.id] || "" : "";

      const completedIds = tasks.filter(isTaskCompleted).map((t) => t.id);

      const res = await fetch("/api/whitelist/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: effectiveWallet,
          twitterUsername: twitterProof || `@${effectiveWallet.slice(2, 8)}`,
          replyCommentLink: replyProof || "Completed via task quest",
          email: "",
          completedTaskIds: completedIds,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#161821]/80 backdrop-blur-xl overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#21242d] border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden my-auto"
        >
          {/* ── Wizard Grey Ambient Lighting & Feather Watermark ─── */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00f0ff]/[0.03] blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#6e443b]/[0.05] blur-[110px] pointer-events-none" />
          <div className="absolute top-2 right-4 w-40 h-40 opacity-[0.04] pointer-events-none rotate-[25deg]">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-slate-100">
              <rect x="68" y="10" width="12" height="12" />
              <rect x="58" y="18" width="14" height="12" />
              <rect x="74" y="24" width="14" height="10" />
              <rect x="50" y="28" width="16" height="12" />
              <rect x="68" y="34" width="16" height="10" />
              <rect x="42" y="38" width="18" height="12" />
              <rect x="62" y="44" width="16" height="10" />
              <rect x="34" y="48" width="18" height="12" />
              <rect x="54" y="54" width="16" height="10" />
              <rect x="26" y="58" width="18" height="12" />
              <rect x="20" y="68" width="16" height="10" />
              <rect x="10" y="86" width="10" height="6" />
            </svg>
          </div>

          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-700/60 flex items-center justify-between bg-gradient-to-r from-[#282b35] via-[#242731] to-[#20222b] relative z-10">
            <div>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-amber-300 tracking-wider">
                WeZards Whitelist Quests
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
                Complete the quests and enter proof details to reserve your placement.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto relative z-10 bg-[#21242d]">
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

              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isCompleted={isTaskCompleted(task)}
                    proofValue={taskProofs[task.id] || ""}
                    onVisitTask={handleVisitTask}
                    onProofChange={handleProofChange}
                  />
                ))}

                {loadingTasks && (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                    <span className="text-xs font-mono">Summoning active quests...</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── EVM Wallet Address Box (Required) ── */}
            <div className="p-4 rounded-xl border border-amber-400/30 bg-[#282b35]/80 space-y-2 font-sans shadow-lg shadow-black/20">
              <label className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1.5 font-display">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  EVM Wallet Address
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono">
                  REQUIRED
                </span>
              </label>

              <input
                type="text"
                required
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value.trim())}
                placeholder="0x1234567890abcdef1234567890abcdef12345678"
                className="w-full px-3.5 py-3 bg-[#181a22] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 font-mono transition-all"
              />

              {walletAddress.length > 0 && !evmAddressRegex.test(walletAddress) && (
                <p className="text-[11px] text-amber-400/90 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Must be a valid 42-character Ethereum / EVM address starting with 0x
                </p>
              )}
            </div>

            {/* ── Math CAPTCHA Security Gate ── */}
            <div className="pt-2">
              <MathCaptchaWidget
                onChallengeReady={(challengeId: string, answer: string) => {
                  setMathChallengeId(challengeId);
                  setMathAnswer(answer);
                }}
              />
            </div>

            {/* ── Submit Button ── */}
            <button
              type="submit"
              disabled={
                !applicationEnabled ||
                !isAllRequiredCompleted ||
                !mathAnswer ||
                (!walletAddress &&
                  !Object.values(taskProofs).some((v) => evmAddressRegex.test(v.trim()))) ||
                loading
              }
              className={`w-full py-4 px-6 rounded-xl font-display font-extrabold text-sm sm:text-base tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
                applicationEnabled &&
                isAllRequiredCompleted &&
                mathAnswer &&
                (walletAddress ||
                  Object.values(taskProofs).some((v) => evmAddressRegex.test(v.trim()))) &&
                !loading
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
              ) : isAllRequiredCompleted &&
                mathAnswer &&
                (walletAddress ||
                  Object.values(taskProofs).some((v) => evmAddressRegex.test(v.trim()))) ? (
                <>
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  <span>SUBMIT WHITELIST APPLICATION</span>
                </>
              ) : (
                <span>COMPLETE QUESTS & ENTER WALLET</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
