"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Do not render sidebar on login page
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-obsidian text-slate-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-obsidian text-slate-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-7xl overflow-y-auto">{children}</main>
    </div>
  );
}
