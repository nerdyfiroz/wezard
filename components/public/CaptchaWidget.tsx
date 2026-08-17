"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface CaptchaWidgetProps {
  onVerify: (token: string) => void;
}

export function CaptchaWidget({ onVerify }: CaptchaWidgetProps) {
  const [verified, setVerified] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY;

  const handleManualVerify = () => {
    setVerified(true);
    onVerify("demo-turnstile-token-" + Date.now());
  };

  useEffect(() => {
    // If turnstile script is available in window
    if (typeof window !== "undefined" && siteKey && !siteKey.includes("XXXX")) {
      const scriptId = "turnstile-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [siteKey]);

  return (
    <div className="w-full p-3.5 rounded-xl bg-obsidian-light border border-fintech-border flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-fintech-green/10 flex items-center justify-center text-fintech-green">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white">Bot Protection</span>
          <span className="text-[11px] text-fintech-subtext">Cloudflare Turnstile Verification</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleManualVerify}
        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
          verified
            ? "bg-fintech-green/20 text-fintech-green border border-fintech-green/40"
            : "bg-fintech-card hover:bg-slate-800 text-slate-300 border border-fintech-border hover:border-fintech-green/30"
        }`}
      >
        {verified ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-fintech-green" />
            <span>Verified Human</span>
          </>
        ) : (
          <span>Verify CAPTCHA</span>
        )}
      </button>
    </div>
  );
}
