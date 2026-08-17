"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { ExportButton } from "@/components/admin/ExportButton";
import { WhitelistEntry } from "@/lib/db/schema";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/admin/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      } else if (res.status === 401) {
        window.location.href = "/admin/login";
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: "pending" | "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchApplications();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this whitelist entry?")) return;
    try {
      const res = await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      if (res.ok) fetchApplications();
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fintech-border/60 pb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Whitelist Entries Management</h1>
          <p className="text-xs text-fintech-subtext mt-1">Review, approve, reject, or export registered circle applicants.</p>
        </div>
        <ExportButton />
      </div>

      {loading ? (
        <div className="p-8 text-center font-mono text-xs text-fintech-green flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Fetching whitelist entries...</span>
        </div>
      ) : (
        <ApplicationsTable
          applications={applications}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
