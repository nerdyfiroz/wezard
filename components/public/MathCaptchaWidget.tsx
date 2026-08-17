"use client";

import React, { useEffect, useState } from "react";
import { Calculator, RefreshCw } from "lucide-react";

interface MathCaptchaWidgetProps {
  onChallengeReady: (challengeId: string, answer: string) => void;
}

export function MathCaptchaWidget({ onChallengeReady }: MathCaptchaWidgetProps) {
  const [challengeId, setChallengeId] = useState("");
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchQuestion = async () => {
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
      console.error("Failed to load math CAPTCHA:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserAnswer(val);
    onChallengeReady(challengeId, val);
  };

  return (
    <div className="w-full p-4 rounded-xl bg-obsidian-light border border-fintech-border space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Calculator className="w-4 h-4 text-fintech-green" />
          <span>Security Verification (Math CAPTCHA)</span>
        </div>
        <button
          type="button"
          onClick={fetchQuestion}
          disabled={loading}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-fintech-card transition-colors flex items-center gap-1 text-[11px] font-mono"
          title="Get a new math problem"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-fintech-green" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <div className="px-4 py-2 rounded-xl bg-fintech-card border border-fintech-border font-mono font-bold text-sm text-fintech-green tracking-wider shrink-0 select-none shadow-inner">
          {loading ? "..." : question}
        </div>
        <input
          type="number"
          required
          placeholder="Answer"
          value={userAnswer}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-obsidian border border-fintech-border rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-fintech-green transition-colors"
        />
      </div>
    </div>
  );
}
