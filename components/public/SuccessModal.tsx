"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function SuccessModal({ isOpen, onClose, walletAddress }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-fintech-card border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/20 overflow-hidden"
        >
          {/* Ethereal Glow Background */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-fintech-green/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-light transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Header */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 mb-6 flex items-center justify-center">
            <div className="w-full h-full bg-obsidian rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
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
            WELCOME TO THE CIRCLE
          </h2>

          <div className="my-6 space-y-3 font-sans text-sm sm:text-base text-slate-300 leading-relaxed">
            <p className="font-medium text-amber-300">
              Your WeZards whitelist entry has been recorded.
            </p>
            <p className="text-slate-300">
              Your place has been reserved in the sanctum.
            </p>
            <p className="text-fintech-subtext text-xs font-mono">
              Keep your wallet safe.
            </p>
          </div>

          {/* Wallet summary card */}
          <div className="p-3.5 rounded-xl bg-obsidian-light/80 border border-fintech-border text-xs font-mono text-slate-300 flex items-center justify-between my-6">
            <span className="text-fintech-subtext">Registered Wallet:</span>
            <span className="text-amber-400 font-bold truncate max-w-[180px]">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>

          {/* Confirmation Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm text-obsidian bg-gradient-to-r from-fintech-green to-emerald-400 hover:from-emerald-400 hover:to-fintech-green transition-all duration-200 shadow-lg shadow-fintech-green/25"
          >
            RETURN TO SANCTUM
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
