"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { TaskItem } from "./TaskItem";
import { MathCaptchaWidget } from "./MathCaptchaWidget";
import { Task } from "@/lib/db/schema";
import { evmAddressRegex } from "@/lib/validation/schemas";
import { XLogo } from "./Navbar";

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (wallet: string) => void;
}

export function QuestModal({ isOpen, onClose, onSuccess }: QuestModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visitedTaskIds, setVisitedTaskIds] = useState<string[]>([]);
  // Per-task proof values: { [taskId]: proofUrl }
  const [taskProofs, setTaskProofs] = useState<Record<string, string>>({});

  const [walletAddress, setWalletAddress] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [replyCommentLink, setReplyCommentLink] = useState("");

  const [mathChallengeId, setMathChallengeId] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const walletInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch active tasks from API
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
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  const handleVisitTask = (taskId: string, url?: string | null) => {
    if (url && url.trim().length > 0) {
      window.open(url, "_blank", "noopener,noreferrer");
      setVisitedTaskIds((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
    } else {
      // No URL: scroll to wallet input
      walletInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      walletInputRef.current?.focus();
    }
  };

  const handleProofChange = (taskId: string, value: string) => {
    setTaskProofs((prev) => ({ ...prev, [taskId]: value }));
    if (errorMsg) setErrorMsg("");
  };

  // Determine if form details are filled
  const isFormFilled = Boolean(
    walletAddress && evmAddressRegex.test(walletAddress) && twitterUsername.trim() && replyCommentLink.trim()
  );

  // A task is considered "complete" when:
  // - It's been visited (link opened) OR type is submit_wallet and form filled
  // - AND if proofRequired, the proofValue is non-empty
  const isTaskComplete = (task: Task): boolean => {
    const hasProofBox = Boolean(task.proofLabel && task.proofLabel.trim().length > 0);
    const proofVal = taskProofs[task.id] || "";
    const proofOk = !hasProofBox || !task.proofRequired || proofVal.trim().length > 3;

    if (task.type === "submit_wallet") {
      return isFormFilled && proofOk;
    }
    return visitedTaskIds.includes(task.id) && proofOk;
  };

  const completedTaskIds = tasks.filter(isTaskComplete).map((t) => t.id);

  // Required Tasks enforcement
  const requiredTasks = tasks.filter((t) => t.required && t.active);
  const completedRequiredCount = requiredTasks.filter((t) => isTaskComplete(t)).length;
  const isAllRequiredCompleted = requiredTasks.length > 0 && completedRequiredCount >= requiredTasks.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Wallet address validation
    if (!walletAddress || !evmAddressRegex.test(walletAddress.trim())) {
      setErrorMsg("Invalid EVM wallet address format. Must start with 0x followed by 40 hex characters (0-9, a-f).");
      walletInputRef.current?.focus();
      return;
    }

    if (!twitterUsername.trim()) {
      setErrorMsg("X / Twitter username is required.");
      return;
    }

    if (!replyCommentLink.trim()) {
      setErrorMsg("Reply or comment link is required.");
      return;
    }

    if (!isAllRequiredCompleted) {
      setErrorMsg("Please complete all required quests (click 'Open Link' and provide proof where required) before submitting.");
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
          walletAddress: walletAddress.trim(),
          twitterUsername: twitterUsername.trim(),
          replyCommentLink: replyCommentLink.trim(),
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
      onSuccess(walletAddress);
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
                Complete all required quests and submit your details to reserve your placement.
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
            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-sans font-medium flex items-center gap-3 shadow-md">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* ── 1. Whitelist Quests (each task has its own proof box) ── */}
            <div className="space-y-3 font-sans">
              <h4 className="text-sm sm:text-base font-display font-extrabold uppercase tracking-wider text-amber-300 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-400">
                1. Whitelist Quests
              </h4>

              <ProgressBar completedCount={completedRequiredCount} totalCount={requiredTasks.length} />

              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isCompleted={visitedTaskIds.includes(task.id) || (task.type === "submit_wallet" && isFormFilled)}
                    proofValue={taskProofs[task.id] || ""}
                    onVisitTask={handleVisitTask}
                    onProofChange={handleProofChange}
                  />
                ))}
              </div>
            </div>

            {/* ── 2. Required Submission Details ── */}
            <div id="submission-details-section" className="space-y-4 font-sans pt-2 border-t border-fintech-border/50">
              <h4 className="text-sm sm:text-base font-display font-extrabold uppercase tracking-wider text-amber-300 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-400">
                2. Required Submission Details
              </h4>

              <div className="space-y-4">
                {/* EVM Wallet */}
                <div>
                  <label className="block text-xs sm:text-sm text-amber-200 font-bold mb-1.5 font-display tracking-wide">
                    EVM Wallet Address <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <input
                      ref={walletInputRef}
                      id="wallet-input"
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
                </div>

                {/* Twitter / X Username */}
                <div>
                  <label className="block text-xs sm:text-sm text-amber-200 font-bold mb-1.5 font-display tracking-wide">
                    X / Twitter Username <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <XLogo className="w-5 h-5 text-white" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="@yourusername"
                      value={twitterUsername}
                      onChange={(e) => {
                        setTwitterUsername(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      className="w-full pl-11 pr-4 py-3 bg-obsidian-light border border-fintech-border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Reply or Comment Link */}
                <div>
                  <label className="block text-xs sm:text-sm text-amber-200 font-bold mb-1.5 font-display tracking-wide">
                    Reply or Comment Link <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      required
                      placeholder="https://x.com/We_Zards/status/..."
                      value={replyCommentLink}
                      onChange={(e) => {
                        setReplyCommentLink(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      className="w-full pl-11 pr-4 py-3 bg-obsidian-light border border-fintech-border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. Math CAPTCHA ── */}
            <MathCaptchaWidget
              onChallengeReady={(challengeId, answer) => {
                setMathChallengeId(challengeId);
                setMathAnswer(answer);
              }}
            />

            {/* ── 4. Submit Button ── */}
            <button
              type="submit"
              disabled={!isAllRequiredCompleted || !walletAddress || !twitterUsername || !replyCommentLink || !mathAnswer || loading}
              className={`w-full py-4 px-6 rounded-xl font-display font-extrabold text-sm sm:text-base tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
                isAllRequiredCompleted && walletAddress && twitterUsername && replyCommentLink && mathAnswer && !loading
                  ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-obsidian hover:from-yellow-300 hover:to-amber-400 shadow-amber-500/30 cursor-pointer hover:scale-[1.01]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>VERIFYING QUESTS...</span>
                </>
              ) : isAllRequiredCompleted && walletAddress && twitterUsername && replyCommentLink && mathAnswer ? (
                <>
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  <span>SUBMIT WHITELIST APPLICATION</span>
                </>
              ) : (
                <span>COMPLETE QUESTS & FILL DETAILS ({completedRequiredCount}/{requiredTasks.length})</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
