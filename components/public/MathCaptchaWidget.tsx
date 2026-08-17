"use client";

import React, { useState, useEffect } from "react";
import { Calculator, RefreshCw } from "lucide-react";

interface MathCaptchaWidgetProps {
  onChallengeReady: (challengeId: string, answer: string) => void;
  refreshTrigger?: number;
}

const standardFontFamily =
  "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export function MathCaptchaWidget({
  onChallengeReady,
  refreshTrigger,
}: MathCaptchaWidgetProps) {
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
      console.error("Failed to load math captcha challenge:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [refreshTrigger]);

  const handleAnswerChange = (val: string) => {
    setUserAnswer(val);
    onChallengeReady(challengeId, val.trim());
  };

  return (
    <div
      className="p-3 rounded-xl bg-[#282b35]/70 border border-slate-700/70 space-y-2 font-sans shadow-md"
      style={{ fontFamily: standardFontFamily }}
    >
      <div className="flex items-center justify-between">
        <label
          style={{ fontFamily: standardFontFamily }}
          className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
        >
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span>Security Verification (Math CAPTCHA)</span>
        </label>
        <button
          type="button"
          onClick={fetchChallenge}
          disabled={loading}
          style={{ fontFamily: standardFontFamily }}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors flex items-center gap-1 text-[11px] font-semibold"
          title="Get New Question"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Math Question Display - Compact */}
        <div
          style={{ fontFamily: standardFontFamily }}
          className="h-10 px-3 rounded-lg bg-[#181a22] border border-amber-400/40 text-amber-300 font-bold text-base tracking-wider flex items-center justify-center shrink-0 min-w-[90px] select-none"
        >
          {loading ? "..." : question || "7 + 8 = ?"}
        </div>

        {/* Math Answer Input - Compact Grey */}
        <input
          type="number"
          required
          placeholder="Answer"
          value={userAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          style={{ fontFamily: standardFontFamily }}
          className="h-10 flex-1 px-3 bg-[#181a22] text-white placeholder-slate-500 border border-slate-700/80 rounded-lg text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
        />
      </div>
    </div>
  );
}
