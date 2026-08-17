"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [emailRequired, setEmailRequired] = useState(false);
  const [applicationEnabled, setApplicationEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [duplicateWalletPolicy, setDuplicateWalletPolicy] = useState("strict");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        const s = data.settings;
        if (s) {
          setCaptchaEnabled(Boolean(s.captchaEnabled));
          setEmailRequired(Boolean(s.emailRequired));
          setApplicationEnabled(s.applicationEnabled !== false);
          setMaintenanceMode(Boolean(s.maintenanceMode));
          setDuplicateWalletPolicy(s.duplicateWalletPolicy || "strict");
        }
      } else if (res.status === 401) {
        window.location.href = "/admin/login";
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captchaEnabled,
          emailRequired,
          applicationEnabled,
          maintenanceMode,
          duplicateWalletPolicy,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Settings updated successfully.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-fintech-border/60 pb-6">
        <h1 className="font-display font-bold text-2xl text-white">Platform Settings</h1>
        <p className="text-xs text-fintech-subtext mt-1">Configure global application behavior and security features.</p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-fintech-green/10 border border-fintech-green/30 text-fintech-green text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-fintech-card border border-fintech-border rounded-2xl p-6 shadow-xl space-y-6 text-xs">
        {/* Anti-Abuse & CAPTCHA */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-fintech-green" />
            <span>Anti-Abuse & Security Controls</span>
          </h3>

          <div className="p-4 bg-obsidian-light rounded-xl border border-fintech-border space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-slate-200 font-semibold block">Cloudflare Turnstile CAPTCHA</span>
                <span className="text-fintech-subtext text-[11px]">Require CAPTCHA verification before accepting application submissions.</span>
              </div>
              <input
                type="checkbox"
                checked={captchaEnabled}
                onChange={(e) => setCaptchaEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-obsidian text-fintech-green focus:ring-0"
              />
            </label>

            <div className="pt-2 border-t border-fintech-border/50">
              <label className="block text-slate-200 font-semibold mb-1">Duplicate Wallet Policy</label>
              <select
                value={duplicateWalletPolicy}
                onChange={(e) => setDuplicateWalletPolicy(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian border border-fintech-border rounded-xl text-white font-mono"
              >
                <option value="strict">Strict (1 Submission per Wallet & Social Handle)</option>
                <option value="allow_update">Allow Update (Overwrite previous entry)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quest Portal Configuration */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-arcane-purple" />
            <span>Portal Portal & Form Configuration</span>
          </h3>

          <div className="p-4 bg-obsidian-light rounded-xl border border-fintech-border space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-slate-200 font-semibold block">Applications Open</span>
                <span className="text-fintech-subtext text-[11px]">Allow users to submit new whitelist applications.</span>
              </div>
              <input
                type="checkbox"
                checked={applicationEnabled}
                onChange={(e) => setApplicationEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-obsidian text-fintech-green focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-fintech-border/50">
              <div>
                <span className="text-slate-200 font-semibold block">Require Email Address</span>
                <span className="text-fintech-subtext text-[11px]">Make email field mandatory instead of optional.</span>
              </div>
              <input
                type="checkbox"
                checked={emailRequired}
                onChange={(e) => setEmailRequired(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-obsidian text-fintech-green focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-fintech-border/50">
              <div>
                <span className="text-slate-200 font-semibold block">Maintenance Mode</span>
                <span className="text-fintech-subtext text-[11px]">Display maintenance message on public portal.</span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-obsidian text-fintech-green focus:ring-0"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-display font-bold text-xs text-obsidian bg-fintech-green hover:bg-fintech-green-hover transition-colors shadow-lg shadow-fintech-green/20 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
