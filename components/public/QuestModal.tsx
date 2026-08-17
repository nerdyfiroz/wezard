"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Twitter, Link as LinkIcon, Mail, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
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
  const [visitedTaskIds, setVisitedTaskIds] = useState<string[]>([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [replyCommentLink, setReplyCommentLink] = useState("");
  const [email, setEmail] = useState("");

  const [mathChallengeId, setMathChallengeId] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [captchaRefreshTrigger, setCaptchaRefreshTrigger] = useState(0);

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
      // Smoothly scroll to and focus the EVM wallet submission input box!
      walletInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      walletInputRef.current?.focus();
    }
  };

  // Determine completed task IDs:
  const isFormFilled = Boolean(
    walletAddress && evmAddressRegex.test(walletAddress) && twitterUsername.trim() && replyCommentLink.trim()
  );

  const completedTaskIds = tasks
    .filter((t) => {
      if (t.type === "submit_wallet") {
        return isFormFilled;
      }
      return visitedTaskIds.includes(t.id);
    })
    .map((t) => t.id);

  // Required Tasks enforcement
  const requiredTasks = tasks.filter((t) => t.required && t.active);
  const completedRequiredCount = requiredTasks.filter((t) => completedTaskIds.includes(t.id)).length;
  const isAllRequiredCompleted = requiredTasks.length > 0 && completedRequiredCount >= requiredTasks.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Wallet address validation
    if (!walletAddress || !evmAddressRegex.test(walletAddress)) {
      setErrorMsg("Please enter a valid EVM wallet address (0x followed by 40 hexadecimal characters).");
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
      setErrorMsg("Please click 'Open Link' on all required quest links above before submitting.");
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
          walletAddress,
          twitterUsername,
          replyCommentLink,
          email,
          completedTaskIds,
          mathChallengeId,
          mathAnswer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Submission failed. Please check your inputs.");
        setLoading(false);
        setCaptchaRefreshTrigger((prev) => prev + 1);
        return;
      }

      setLoading(false);
      onSuccess(walletAddress);
    } catch (err) {
      setLoading(false);
      setErrorMsg("Something went wrong. Please try again.");
      setCaptchaRefreshTrigger((prev) => prev + 1);
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
                Visit required links and submit your details to reserve your placement.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-fintech-card transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Clean Plain English Error Banner */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-sans font-medium flex items-center gap-3 shadow-md">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* User Input Submission Details */}
            <div id="submission-details-section" className="space-y-4 font-sans">
              <h4 className="text-sm sm:text-base font-display font-extrabold uppercase tracking-wider text-amber-300 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-400">
                1. Required Submission Details
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
                      onChange={(e) => setWalletAddress(e.target.value)}
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
                      <Twitter className="w-5 h-5 text-cyan-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="@yourusername"
                      value={twitterUsername}
                      onChange={(e) => setTwitterUsername(e.target.value)}
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
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="url"
                      required
                      placeholder="https://x.com/We_Zards/status/..."
                      value={replyCommentLink}
                      onChange={(e) => setReplyCommentLink(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-obsidian-light border border-fintech-border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-xs sm:text-sm text-amber-200 font-bold mb-1.5 font-display tracking-wide">
                    Email Address <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="wizard@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-obsidian-light border border-fintech-border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quests Task List & Progress Bar */}
            <div className="space-y-3 pt-2 font-sans">
              <h4 className="text-sm sm:text-base font-display font-extrabold uppercase tracking-wider text-amber-300 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-400">
                2. Whitelist Quests (Click "Open Link" or "Fill Details" to complete)
              </h4>

              <ProgressBar completedCount={completedRequiredCount} totalCount={requiredTasks.length} />

              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isCompleted={completedTaskIds.includes(task.id)}
                    onVisitTask={handleVisitTask}
                  />
                ))}
              </div>
            </div>

            {/* 2-Number Math CAPTCHA Widget */}
            <MathCaptchaWidget
              refreshTrigger={captchaRefreshTrigger}
              onChallengeReady={(challengeId, answer) => {
                setMathChallengeId(challengeId);
                setMathAnswer(answer);
              }}
            />

            {/* Submit Button */}
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
                <span>OPEN ALL LINKS & FILL DETAILS ({completedRequiredCount}/{requiredTasks.length})</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
