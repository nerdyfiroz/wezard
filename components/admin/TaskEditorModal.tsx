"use client";

import React, { useState, useEffect } from "react";
import { X, CheckSquare, Loader2, AlertCircle, Link2, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { Task } from "@/lib/db/schema";

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  initialTask?: Task | null;
}

export function TaskEditorModal({ isOpen, onClose, onSave, initialTask }: TaskEditorModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Task["type"]>("x_follow");
  const [url, setUrl] = useState("");
  const [required, setRequired] = useState(true);
  const [active, setActive] = useState(true);
  const [verificationType, setVerificationType] = useState<Task["verificationType"]>("url");
  const [sortOrder, setSortOrder] = useState(1);
  const [proofLabel, setProofLabel] = useState("");
  const [proofRequired, setProofRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setType(initialTask.type);
      setUrl(initialTask.url || "");
      setRequired(initialTask.required);
      setActive(initialTask.active);
      setVerificationType(initialTask.verificationType);
      setSortOrder(initialTask.sortOrder);
      setProofLabel(initialTask.proofLabel || "");
      setProofRequired(initialTask.proofRequired ?? false);
    } else {
      setTitle("");
      setDescription("");
      setType("x_follow");
      setUrl("");
      setRequired(true);
      setActive(true);
      setVerificationType("url");
      setSortOrder(1);
      setProofLabel("");
      setProofRequired(false);
    }
  }, [initialTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSave({
        title,
        description,
        type,
        url,
        required,
        active,
        verificationType,
        sortOrder: Number(sortOrder),
        proofLabel: proofLabel.trim() || undefined,
        proofRequired,
      });
      setLoading(false);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Failed to save task. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-fintech-card border border-fintech-border rounded-2xl shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-fintech-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-fintech-green/10 border border-fintech-green/30 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-fintech-green" />
            </div>
            <h3 className="font-display font-bold text-base text-white">
              {initialTask ? "Edit Quest Task" : "Create New Quest Task"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-obsidian-light rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans max-h-[80vh] overflow-y-auto">
          {/* Task Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Task Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Follow @WeZardsNFT on X"
              className="w-full px-3 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Description <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for the user (optional)..."
              className="w-full px-3 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all resize-none"
            />
          </div>

          {/* Type + Verification */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Task Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="x_follow">X / Follow</option>
                <option value="x_like">X / Like</option>
                <option value="x_repost">X / Repost</option>
                <option value="visit_url">Visit Website URL</option>
                <option value="submit_wallet">Wallet Submission</option>
                <option value="custom">Custom Task</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Verification</label>
              <select
                value={verificationType}
                onChange={(e) => setVerificationType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="url">URL Redirect</option>
                <option value="manual">Manual / Checkbox</option>
                <option value="api">API Endpoint</option>
              </select>
            </div>
          </div>

          {/* URL + Sort Order */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-300 font-semibold mb-1.5">Destination URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://x.com/WeZardsNFT"
                className="w-full px-3 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Display Order</label>
              <input
                type="number"
                min={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* ── Proof Box Section ─────────────────────────────────── */}
          <div className="p-4 bg-obsidian-light/60 border border-fintech-border/60 rounded-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300 font-bold text-[11px] uppercase tracking-wider">Proof Submission Box</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              If set, a proof input box will appear under this task on the website. Leave blank to hide the proof box.
            </p>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">Proof Box Label</label>
              <input
                type="text"
                value={proofLabel}
                onChange={(e) => setProofLabel(e.target.value)}
                placeholder='e.g. "Paste your reply tweet link here"'
                className="w-full px-3 py-2.5 bg-obsidian border border-fintech-border/80 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 transition-all"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={proofRequired}
                onChange={(e) => setProofRequired(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-obsidian accent-cyan-400"
              />
              <span className="text-white font-semibold">Proof is required to mark task complete</span>
            </label>
          </div>

          {/* ── Task Controls ─────────────────────────────────────── */}
          <div className="p-4 bg-obsidian-light/60 border border-fintech-border/60 rounded-xl">
            <span className="text-slate-300 font-bold text-[11px] uppercase tracking-wider block mb-3">Task Controls</span>
            <div className="flex items-center gap-6">
              {/* Required / Optional Toggle */}
              <button
                type="button"
                onClick={() => setRequired(!required)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  required
                    ? "bg-amber-400/10 border-amber-400/40 text-amber-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                {required ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                {required ? "REQUIRED" : "OPTIONAL"}
              </button>

              {/* Active / Inactive Toggle */}
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  active
                    ? "bg-fintech-green/10 border-fintech-green/40 text-fintech-green"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                {active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {active ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-fintech-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-obsidian bg-gradient-to-r from-amber-300 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-colors shadow-md shadow-amber-500/20 flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? "Saving..." : "Save Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
