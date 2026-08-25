"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { WhitelistEntry } from "@/lib/db/schema";
import { truncateWallet, formatDate } from "@/lib/utils";
import { ExportButton } from "./ExportButton";

interface ApplicationsTableProps {
  applications: WhitelistEntry[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  loading: boolean;
  statusFilter: "all" | "approved" | "pending" | "rejected";
  search: string;
  onPageChange: (newPage: number) => void;
  onStatusFilterChange: (newStatus: "all" | "approved" | "pending" | "rejected") => void;
  onSearchChange: (newSearch: string) => void;
  onStatusChange: (id: string, status: "pending" | "approved" | "rejected") => void;
  onDelete: (id: string) => void;
}

export function ApplicationsTable({
  applications,
  total,
  page,
  totalPages,
  limit,
  loading,
  statusFilter,
  search,
  onPageChange,
  onStatusFilterChange,
  onSearchChange,
  onStatusChange,
  onDelete,
}: ApplicationsTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<WhitelistEntry | null>(null);

  const startEntry = total === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-obsidian-light rounded-xl border border-fintech-border text-xs font-semibold">
          {(["all", "approved", "pending", "rejected"] as const).map((st) => (
            <button
              key={st}
              onClick={() => onStatusFilterChange(st)}
              className={`px-3.5 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? "bg-amber-400 text-obsidian font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input & Export Button */}
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search wallet, Twitter, reply link, or email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-fintech-card border border-fintech-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
            />
          </div>
          <ExportButton status={statusFilter} search={search} />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-fintech-card border border-fintech-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-fintech-green font-mono text-xs bg-obsidian-light px-4 py-2 rounded-xl border border-fintech-border shadow-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading entries...</span>
              </div>
            </div>
          )}

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
              {applications.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No whitelist applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-obsidian-light/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                      <a
                        href={`https://etherscan.io/address/${app.walletAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-amber-400 flex items-center gap-1.5"
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

        {/* Pagination Bar */}
        <div className="p-4 border-t border-fintech-border/60 bg-obsidian-light/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 font-mono text-[11px]">
            Showing <span className="text-white font-bold">{startEntry.toLocaleString()}</span> to{" "}
            <span className="text-white font-bold">{endEntry.toLocaleString()}</span> of{" "}
            <span className="text-amber-400 font-bold">{total.toLocaleString()}</span> entries
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(1)}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg bg-fintech-card border border-fintech-border text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg bg-fintech-card border border-fintech-border text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {getPageNumbers().map((p, idx) =>
                  typeof p === "number" ? (
                    <button
                      key={idx}
                      onClick={() => onPageChange(p)}
                      disabled={loading}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-mono font-bold transition-colors ${
                        page === p
                          ? "bg-amber-400 text-obsidian shadow-sm"
                          : "bg-fintech-card border border-fintech-border text-slate-300 hover:text-white hover:border-slate-500"
                      }`}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={idx} className="px-1 text-slate-500 font-mono">
                      {p}
                    </span>
                  )
                )}
              </div>

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-lg bg-fintech-card border border-fintech-border text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-lg bg-fintech-card border border-fintech-border text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
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
                <span className="text-amber-400 font-bold text-sm select-all">{selectedEntry.walletAddress}</span>
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
              {(selectedEntry as any).ipAddress && (
                <div className="p-3 bg-obsidian-light rounded-xl border border-emerald-500/30">
                  <span className="text-emerald-400 block text-[10px] font-bold mb-0.5">CLIENT IP ADDRESS:</span>
                  <span className="text-emerald-300 font-bold select-all">{(selectedEntry as any).ipAddress}</span>
                </div>
              )}
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

