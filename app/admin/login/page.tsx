"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Key, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Invalid login credentials.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setErrorMsg("Failed to connect to authentication server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-obsidian relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-fintech-card border border-fintech-border rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 mb-4">
            <div className="w-full h-full bg-obsidian rounded-[14px] flex items-center justify-center p-1 overflow-hidden">
              <Image
                src="/Wizeffgmbers.png"
                alt="WeZards Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="font-display font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            WeZards Sanctum
          </h1>
          <p className="text-xs text-amber-300/80 mt-1 font-mono font-medium">Restricted Admin Authentication</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Admin Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Admin Secret Key</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-obsidian-light border border-fintech-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wider text-obsidian bg-gradient-to-r from-fintech-green to-emerald-400 hover:from-emerald-400 hover:to-fintech-green transition-all duration-200 shadow-lg shadow-fintech-green/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>ENTER SANCTUM</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
