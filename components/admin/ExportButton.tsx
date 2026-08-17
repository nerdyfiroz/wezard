"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export function ExportButton() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Failed to export");

      const blob = await res.blob();
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
      alert("Failed to download CSV export.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={downloading}
      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-fintech-card hover:bg-slate-800 border border-fintech-border transition-all shadow-sm flex items-center gap-2"
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin text-fintech-green" />
      ) : (
        <Download className="w-4 h-4 text-fintech-green" />
      )}
      <span>Export CSV</span>
    </button>
  );
}
