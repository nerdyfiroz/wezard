"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, MessageSquare, Twitter, Mail, Tag, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { TaskItem } from "./TaskItem";
import { CaptchaWidget } from "./CaptchaWidget";
import { Task } from "@/lib/db/schema";
import { evmAddressRegex } from "@/lib/validation/schemas";

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (wallet: string) => void;
}

export function QuestModal({ isOpen, onClose, onSuccess }: QuestModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

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
      return;
    }

    if (!discordUsername.trim()) {
      setErrorMsg("Discord username is required.");
      return;
    }

    if (!twitterUsername.trim()) {
      setErrorMsg("X/Twitter handle is required.");
      return;
    }

    if (!isAllRequiredCompleted) {
      setErrorMsg("You must complete 100% of the required quests before submitting.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/whitelist/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          discordUsername,
          twitterUsername,
          email,
          referralCode,
          completedTaskIds,
          captchaToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Submission failed. Please check your inputs.");
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(walletAddress);
    } catch (err) {
      setLoading(false);
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-obsidian/90 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-fintech-card border border-fintech-border rounded-2xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-fintech-border flex items-center justify-between bg-obsidian-light/60">
            <div>
              <h3 className="font-display font-bold text-xl text-white">WeZard Whitelist Quests</h3>
              <p className="text-xs text-fintech-subtext mt-0.5">
                Complete all required quests to reserve your circle placement.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-fintech-card transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Account Credentials Input Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                1. Account & Wallet Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* EVM Wallet */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-300 font-medium mb-1.5">
                    EVM Wallet Address <span className="text-fintech-green">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="0x1234567890abcdef1234567890abcdef12345678"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fintech-green transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Discord Username */}
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1.5">
                    Discord Username <span className="text-fintech-green">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="username#0000"
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fintech-green transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Twitter Handle */}
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1.5">
                    X / Twitter Handle <span className="text-fintech-green">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Twitter className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="@handle"
                      value={twitterUsername}
                      onChange={(e) => setTwitterUsername(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fintech-green transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1.5">
                    Email Address <span className="text-slate-500 text-[10px]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="wizard@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fintech-green transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Referral Code (Optional) */}
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1.5">
                    Referral Code <span className="text-slate-500 text-[10px]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="CIRCLE-2026"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fintech-green transition-colors font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quests Task List & Progress Bar */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                2. Whitelist Quests
              </h4>

              <ProgressBar completedCount={completedRequiredCount} totalCount={requiredTasks.length} />

              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isCompleted={completedTaskIds.includes(task.id)}
                    onToggleComplete={toggleTaskCompletion}
                  />
                ))}
              </div>
            </div>

            {/* CAPTCHA Widget */}
            <CaptchaWidget onVerify={(token) => setCaptchaToken(token)} />

            {/* Submit Button (Disabled unless 100% required tasks completed) */}
            <button
              type="submit"
              disabled={!isAllRequiredCompleted || loading}
              className={`w-full py-4 rounded-xl font-display font-bold text-sm tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
                isAllRequiredCompleted && !loading
                  ? "bg-fintech-green text-obsidian hover:bg-fintech-green-hover shadow-fintech-green/25 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>VERIFYING QUESTS...</span>
                </>
              ) : isAllRequiredCompleted ? (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>SUBMIT WHITELIST APPLICATION</span>
                </>
              ) : (
                <span>COMPLETE ALL REQUIRED QUESTS TO SUBMIT ({completedRequiredCount}/{requiredTasks.length})</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
