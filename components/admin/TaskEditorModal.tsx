"use client";

import React, { useState, useEffect } from "react";
import { X, CheckSquare, Loader2 } from "lucide-react";
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
  const [points, setPoints] = useState(10);
  const [required, setRequired] = useState(true);
  const [active, setActive] = useState(true);
  const [verificationType, setVerificationType] = useState<Task["verificationType"]>("url");
  const [sortOrder, setSortOrder] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setType(initialTask.type);
      setUrl(initialTask.url || "");
      setPoints(initialTask.points);
      setRequired(initialTask.required);
      setActive(initialTask.active);
      setVerificationType(initialTask.verificationType);
      setSortOrder(initialTask.sortOrder);
    } else {
      setTitle("");
      setDescription("");
      setType("x_follow");
      setUrl("");
      setPoints(10);
      setRequired(true);
      setActive(true);
      setVerificationType("url");
      setSortOrder(1);
    }
  }, [initialTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        title,
        description,
        type,
        url,
        points: Number(points),
        required,
        active,
        verificationType,
        sortOrder: Number(sortOrder),
      });
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-fintech-card border border-fintech-border rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-fintech-border">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-fintech-green" />
            <h3 className="font-display font-bold text-lg text-white">
              {initialTask ? "Edit Quest Task" : "Create New Quest Task"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Follow @WeZardNFT on X"
              className="w-full px-3 py-2 bg-obsidian-light border border-fintech-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-fintech-green"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions for the user..."
              className="w-full px-3 py-2 bg-obsidian-light border border-fintech-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-fintech-green resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Task Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-obsidian-light border border-fintech-border rounded-xl text-white focus:outline-none focus:border-fintech-green font-mono"
              >
                <option value="x_follow">X / Follow</option>
                <option value="x_like">X / Like</option>
                <option value="x_repost">X / Repost</option>
                <option value="discord_join">Discord / Join</option>
                <option value="telegram_join">Telegram / Join</option>
                <option value="submit_wallet">Wallet Submission</option>
                <option value="custom">Custom Task</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Verification Method</label>
              <select
                value={verificationType}
                onChange={(e) => setVerificationType(e.target.value as any)}
                className="w-full px-3 py-2 bg-obsidian-light border border-fintech-border rounded-xl text-white focus:outline-none focus:border-fintech-green font-mono"
              >
                <option value="url">URL Redirect</option>
                <option value="manual">Manual / Checkbox</option>
                <option value="api">API Endpoint</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Destination URL (Optional)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://x.com/WeZardNFT"
              className="w-full px-3 py-2 bg-obsidian-light border border-fintech-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-fintech-green font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Points</label>
              <input
                type="number"
                min={0}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-3 py-2 bg-obsidian-light border border-fintech-border rounded-xl text-white focus:outline-none focus:border-fintech-green font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Display Order</label>
              <input
                type="number"
                min={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-obsidian-light border border-fintech-border rounded-xl text-white focus:outline-none focus:border-fintech-green font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-obsidian text-fintech-green focus:ring-0"
              />
              <span className="text-white font-semibold">Required Task</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-obsidian text-fintech-green focus:ring-0"
              />
              <span className="text-white font-semibold">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-fintech-border">
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
              className="px-4 py-2 rounded-xl text-xs font-bold text-obsidian bg-fintech-green hover:bg-fintech-green-hover transition-colors shadow-md shadow-fintech-green/20 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
