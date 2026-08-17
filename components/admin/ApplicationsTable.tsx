"use client";

import React, { useState } from "react";
import { Search, CheckCircle2, XCircle, Trash2, Eye, ExternalLink } from "lucide-react";
import { WhitelistEntry } from "@/lib/db/schema";
import { truncateWallet, formatDate } from "@/lib/utils";

interface ApplicationsTableProps {
  applications: WhitelistEntry[];
  onStatusChange: (id: string, status: "pending" | "approved" | "rejected") => void;
  onDelete: (id: string) => void;
}

export function ApplicationsTable({ applications, onStatusChange, onDelete }: ApplicationsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [selectedEntry, setSelectedEntry] = useState<WhitelistEntry | null>(null);

  const filtered = applications.filter((app) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      app.walletAddress.toLowerCase().includes(query) ||
      (app.twitterUsername && app.twitterUsername.toLowerCase().includes(query)) ||
      (app.replyCommentLink && app.replyCommentLink.toLowerCase().includes(query)) ||
      (app.email && app.email.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-obsidian-light rounded-xl border border-fintech-border text-xs font-semibold">
          {(["all", "approved", "pending", "rejected"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? "bg-fintech-green text-obsidian font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search wallet, Twitter, reply link, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-fintech-card border border-fintech-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fintech-green transition-colors font-mono"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-fintech-card border border-fintech-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-obsidian-light/80 border-b border-fintech-border text-fintech-subtext font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Wallet Address</th>
                <th className="py-3.5 px-4">X / Twitter Username</th>
                <th className="py-3.5 px-4">Reply / Comment Link</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fintech-border/50 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No whitelist applications found.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-obsidian-light/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                      <a
                        href={`https://etherscan.io/address/${app.walletAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-fintech-green flex items-center gap-1.5"
                      >
                        <span>{truncateWallet(app.walletAddress)}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400 font-medium">
                      {app.twitterUsername}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 max-w-[180px] truncate">
                      {app.replyCommentLink ? (
                        <a
                          href={app.replyCommentLink}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-amber-400 flex items-center gap-1 text-slate-300"
                        >
                          <span className="truncate max-w-[150px]">{app.replyCommentLink}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{app.email || "-"}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          app.status === "approved"
                            ? "bg-fintech-green/10 text-fintech-green border border-fintech-green/30"
                            : app.status === "rejected"
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedEntry(app)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-light transition-colors"
                          title="View Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {app.status !== "approved" && (
                          <button
                            onClick={() => onStatusChange(app.id, "approved")}
                            className="p-1.5 rounded-lg text-fintech-green hover:bg-fintech-green/10 transition-colors"
                            title="Approve Application"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {app.status !== "rejected" && (
                          <button
                            onClick={() => onStatusChange(app.id, "rejected")}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Reject Application"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(app.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-fintech-card border border-fintech-border rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-white">Whitelist Entry Details</h3>
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 bg-obsidian-light rounded-xl border border-fintech-border">
                <span className="text-fintech-subtext block text-[10px]">WALLET ADDRESS:</span>
                <span className="text-fintech-green font-bold text-sm select-all">{selectedEntry.walletAddress}</span>
              </div>
              <div className="p-3 bg-obsidian-light rounded-xl border border-fintech-border">
                <span className="text-fintech-subtext block text-[10px]">X / TWITTER USERNAME:</span>
                <span className="text-cyan-400 font-bold">{selectedEntry.twitterUsername}</span>
              </div>
              <div className="p-3 bg-obsidian-light rounded-xl border border-fintech-border">
                <span className="text-fintech-subtext block text-[10px]">REPLY OR COMMENT LINK:</span>
                <a
                  href={selectedEntry.replyCommentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1.5 break-all mt-1"
                >
                  <span>{selectedEntry.replyCommentLink}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
              {selectedEntry.email && (
                <div className="p-3 bg-obsidian-light rounded-xl border border-fintech-border">
                  <span className="text-fintech-subtext block text-[10px]">EMAIL:</span>
                  <span>{selectedEntry.email}</span>
                </div>
              )}
              <div className="p-3 bg-obsidian-light rounded-xl border border-fintech-border flex justify-between items-center">
                <span className="text-fintech-subtext text-[10px]">SUBMISSION DATE:</span>
                <span>{formatDate(selectedEntry.createdAt)}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
