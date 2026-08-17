"use client";

import React, { useEffect, useState } from "react";
import { Users, CheckCircle2, Clock, XCircle, Wallet, Calendar, CheckSquare, Sparkles } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { ExportButton } from "@/components/admin/ExportButton";

interface StatsData {
  totalApplications: number;
  verified: number;
  pending: number;
  rejected: number;
  uniqueWallets: number;
  todaysApplications: number;
  taskBreakdown: Array<{
    taskId: string;
    title: string;
    completions: number;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-fintech-green font-mono text-sm">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Loading Sanctum Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fintech-border/60 pb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">WeZards Sanctum Dashboard</h1>
          <p className="text-xs text-fintech-subtext mt-1">Real-time whitelist metrics and quest completion analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton />
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Applications"
          value={stats?.totalApplications ?? 0}
          subText="All-time whitelist entries"
          icon={Users}
          color="green"
        />
        <StatCard
          title="Verified (Approved)"
          value={stats?.verified ?? 0}
          subText="Confirmed circle members"
          icon={CheckCircle2}
          color="cyan"
        />
        <StatCard
          title="Pending Applications"
          value={stats?.pending ?? 0}
          subText="Awaiting review"
          icon={Clock}
          color="gold"
        />
        <StatCard
          title="Rejected"
          value={stats?.rejected ?? 0}
          subText="Flagged or failed review"
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Unique Wallets"
          value={stats?.uniqueWallets ?? 0}
          subText="Unique EVM addresses"
          icon={Wallet}
          color="purple"
        />
        <StatCard
          title="Today's Applications"
          value={stats?.todaysApplications ?? 0}
          subText="Submitted last 24h"
          icon={Calendar}
          color="slate"
        />
      </div>

      {/* Task Completion Analytics Table */}
      <div className="bg-fintech-card border border-fintech-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-fintech-green" />
            <h2 className="font-display font-bold text-lg text-white">Quest Task Completion Metrics</h2>
          </div>
          <span className="text-xs font-mono text-fintech-subtext">Live Data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-obsidian-light border-b border-fintech-border text-fintech-subtext font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Quest Task</th>
                <th className="py-3 px-4 text-right">Completions</th>
                <th className="py-3 px-4 text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fintech-border/50">
              {stats?.taskBreakdown.map((item) => {
                const total = stats.totalApplications || 1;
                const percentage = Math.min(100, Math.round((item.completions / total) * 100));

                return (
                  <tr key={item.taskId} className="hover:bg-obsidian-light/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{item.title}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-fintech-green">
                      {item.completions.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-28 h-2 bg-obsidian-light rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-fintech-green to-emerald-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-10 text-right">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
