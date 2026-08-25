"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Sparkles } from "lucide-react";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { ExportButton } from "@/components/admin/ExportButton";
import { WhitelistEntry } from "@/lib/db/schema";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<WhitelistEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [search, setSearch] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchApplications = useCallback(
    async (targetPage = page, targetStatus = statusFilter, targetSearch = search) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(limit),
          status: targetStatus,
        });
        if (targetSearch.trim()) {
          params.set("search", targetSearch.trim());
        }

        const res = await fetch(`/api/admin/applications?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
          setTotal(data.total || 0);
          setPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
        } else if (res.status === 401) {
          window.location.href = "/admin/login";
        }
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, limit, statusFilter, search]
  );

  useEffect(() => {
    fetchApplications(page, statusFilter, search);
  }, [page, statusFilter]);

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchApplications(1, statusFilter, newSearch);
    }, 400);
  };

  const handleStatusFilterChange = (newStatus: "all" | "approved" | "pending" | "rejected") => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusChange = async (id: string, status: "pending" | "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchApplications(page, statusFilter, search);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this whitelist entry?")) return;
    try {
      const res = await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      if (res.ok) fetchApplications(page, statusFilter, search);
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fintech-border/60 pb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Whitelist Entries Management</h1>
          <p className="text-xs text-fintech-subtext mt-1">
            Review, approve, reject, or export registered circle applicants ({total.toLocaleString()} total).
          </p>
        </div>
        <ExportButton status={statusFilter} search={search} />
      </div>

      <ApplicationsTable
        applications={applications}
        total={total}
        page={page}
        totalPages={totalPages}
        limit={limit}
        loading={loading}
        statusFilter={statusFilter}
        search={search}
        onPageChange={handlePageChange}
        onStatusFilterChange={handleStatusFilterChange}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}

