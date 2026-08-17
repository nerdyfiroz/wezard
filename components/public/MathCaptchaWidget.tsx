"use client";

import React, { useState, useEffect } from "react";
import { Calculator, RefreshCw } from "lucide-react";

interface MathCaptchaWidgetProps {
  onChallengeReady: (challengeId: string, answer: string) => void;
  refreshTrigger?: number;
}

const standardFontFamily = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export function MathCaptchaWidget({ onChallengeReady, refreshTrigger }: MathCaptchaWidgetProps) {
  const [challengeId, setChallengeId] = useState("");
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchChallenge = async () => {
    setLoading(true);
    setUserAnswer("");
    try {
      const res = await fetch("/api/captcha/math");
      const data = await res.json();
      if (data.challengeId && data.question) {
        setChallengeId(data.challengeId);
        setQuestion(data.question);
        onChallengeReady(data.challengeId, "");
      }
    } catch (err) {
      console.error("Failed to load Math CAPTCHA:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [refreshTrigger]);

  const handleAnswerChange = (val: string) => {
    setUserAnswer(val);
    onChallengeReady(challengeId, val);
  };

  return (
    <div
      style={{ fontFamily: standardFontFamily }}
      className="p-4 sm:p-5 rounded-2xl bg-obsidian-light/90 border border-fintech-border space-y-3 font-standard"
    >
      <div className="flex items-center justify-between">
        <label
          style={{ fontFamily: standardFontFamily }}
          className="text-sm font-bold text-slate-200 flex items-center gap-2 tracking-wide"
        >
          <Calculator className="w-5 h-5 text-amber-400" />
          <span>Security Verification (Math CAPTCHA)</span>
        </label>
        <button
          type="button"
          onClick={fetchChallenge}
          disabled={loading}
          style={{ fontFamily: standardFontFamily }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-fintech-card transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Get New Question"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Math Question Display - GUARANTEED STANDARD NORMAL FONT */}
        <div
          style={{ fontFamily: standardFontFamily }}
          className="px-5 py-3 rounded-xl bg-obsidian border border-amber-400/40 text-amber-300 font-extrabold text-2xl tracking-wider flex items-center justify-center shrink-0 min-w-[150px] shadow-inner select-none"
        >
          {loading ? "..." : question || "7 + 8 = ?"}
        </div>

        {/* Math Answer Input - GUARANTEED STANDARD NORMAL FONT */}
        <input
          type="number"
          required
          placeholder="Enter answer number"
          value={userAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          style={{ fontFamily: standardFontFamily }}
          className="flex-1 px-4 py-3 bg-fintech-card border border-fintech-border rounded-xl text-base font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors tracking-wide"
        />
      </div>
    </div>
  );
}
