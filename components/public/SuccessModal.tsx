"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Sparkles } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function SuccessModal({ isOpen, onClose, walletAddress }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-[#1f2229] border border-amber-400/40 rounded-2xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/20 overflow-hidden font-sans"
        >
          {/* Ethereal Glow Background matching Wizeffgmbers */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Header */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 mb-6 flex items-center justify-center">
            <div className="w-full h-full bg-[#181a22] rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
              <Image
                src="/Wizeffgmbers.png"
                alt="WeZards Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Main Title */}
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-widest text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-md">
            ENTRY RECORDED
          </h2>

          <div className="my-6 space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            <p className="font-medium text-amber-300">
              Your WeZards whitelist entry has been recorded.
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              The circle is being summoned on{" "}
              <span className="text-white font-semibold">Robinhood Chain</span>. Review of your
              quest proofs is currently in progress.
            </p>
          </div>

          {/* Wallet Display Box */}
          <div className="p-3.5 bg-[#181a22] rounded-xl border border-slate-700 font-mono text-xs text-amber-300 break-all mb-6">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-sans">
              Registered Wallet
            </div>
            {walletAddress}
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono mb-6">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>STATUS: PENDING VERIFICATION</span>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm tracking-wider text-obsidian bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
          >
            <span>RETURN TO SANCTUM</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
