"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Sparkles, ExternalLink } from "lucide-react";
import { Task } from "@/lib/db/schema";
import { TaskEditorModal } from "@/components/admin/TaskEditorModal";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/admin/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTask(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        const res = await fetch(`/api/admin/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        if (res.ok) fetchTasks();
      } else {
        const res = await fetch("/api/admin/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        if (res.ok) fetchTasks();
      }
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleToggleActive = async (task: Task) => {
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !task.active }),
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error("Error toggling active state:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fintech-border/60 pb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Quest Task Management</h1>
          <p className="text-xs text-fintech-subtext mt-1">Configure, reorder, and activate whitelist quest requirements.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-obsidian bg-fintech-green hover:bg-fintech-green-hover transition-colors shadow-lg shadow-fintech-green/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>

      <div className="bg-fintech-card border border-fintech-border rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center font-mono text-xs text-fintech-green flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Loading tasks catalog...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-obsidian-light/80 border-b border-fintech-border text-fintech-subtext font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Task Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Requirement</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fintech-border/50 text-slate-200">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-obsidian-light/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-fintech-green">{t.sortOrder}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex flex-col">
                        <span>{t.title}</span>
                        {t.url && (
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-slate-400 font-mono flex items-center gap-1 hover:text-cyan-400"
                          >
                            <span>{t.url}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400">{t.type}</td>
                    <td className="py-3.5 px-4">
                      {t.required ? (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-500/10 text-fintech-green border border-fintech-green/20">
                          REQUIRED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                          OPTIONAL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(t)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition-colors flex items-center gap-1 ${
                          t.active
                            ? "bg-fintech-green/10 text-fintech-green border border-fintech-green/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {t.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{t.active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-obsidian-light transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaskEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  );
}
