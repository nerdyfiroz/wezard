"use client";

import React, { useState } from "react";
import { WizardBackground } from "@/components/public/WizardBackground";
import { Navbar } from "@/components/public/Navbar";
import { Hero } from "@/components/public/Hero";
import { QuestModal } from "@/components/public/QuestModal";
import { SuccessModal } from "@/components/public/SuccessModal";
import { Footer } from "@/components/public/Footer";

export default function HomePage() {
  const [isQuestOpen, setIsQuestOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [submittedWallet, setSubmittedWallet] = useState("");

  const handleOpenQuests = () => {
    setIsQuestOpen(true);
  };

  const handleQuestSuccess = (wallet: string) => {
    setSubmittedWallet(wallet);
    setIsQuestOpen(false);
    setIsSuccessOpen(true);
  };

  return (
    <main className="min-h-screen bg-obsidian text-slate-100 relative flex flex-col justify-between selection:bg-fintech-green selection:text-obsidian overflow-x-hidden">
      {/* Dynamic Animated Canvas Particle Background */}
      <WizardBackground />

      {/* Main Public App Header */}
      <Navbar onOpenQuests={handleOpenQuests} />

      {/* Hero Section */}
      <Hero onOpenQuests={handleOpenQuests} />

      {/* Footer */}
      <Footer />

      {/* Quests Step Modal */}
      <QuestModal
        isOpen={isQuestOpen}
        onClose={() => setIsQuestOpen(false)}
        onSuccess={handleQuestSuccess}
      />

      {/* Initiation Confirmation Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        walletAddress={submittedWallet}
      />
    </main>
  );
}
