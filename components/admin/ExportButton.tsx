"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
  status?: string;
  search?: string;
}

export function ExportButton({ status, search }: ExportButtonProps = {}) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      if (search) params.set("search", search);

      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/admin/export${query}`, {
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);

      const text = await res.text();
      const lines = text.trim().split("\n");

      // lines[0] is the header row — warn if there's no data
      if (lines.length <= 1) {
        alert("No entries found to export. The CSV would be empty.");
        setDownloading(false);
        return;
      }

      const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wezard-whitelist-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to download CSV export. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={downloading}
      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-fintech-card hover:bg-slate-800 border border-fintech-border transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin text-fintech-green" />
      ) : (
        <Download className="w-4 h-4 text-fintech-green" />
      )}
      <span>{downloading ? "Exporting..." : "Export CSV"}</span>
    </button>
  );
}
