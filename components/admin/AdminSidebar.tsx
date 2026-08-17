"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CheckSquare, Users, Settings, LogOut } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/tasks", label: "Quest Tasks", icon: CheckSquare },
    { href: "/admin/applications", label: "Whitelist Entries", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-obsidian-light border-r border-fintech-border min-h-screen flex flex-col justify-between p-4 shrink-0">
      <div>
        {/* Admin Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-fintech-border/50">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 p-[2px] shadow-md shadow-amber-500/20 overflow-hidden">
            <Image
              src="/Wizeffgmbers.png"
              alt="WeZards Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-400">
              WEZARDS
            </h2>
            <p className="text-[10px] text-amber-200/90 font-mono font-bold">ADMIN SANCTUM</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-fintech-card"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="pt-4 border-t border-fintech-border/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Sanctum</span>
        </button>
      </div>
    </aside>
  );
}
