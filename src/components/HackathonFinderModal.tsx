"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { NormalizedHackathon } from "@/types/hackathon";
import { HackathonCard } from "./HackathonCard";

interface HackathonFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  allHackathons: NormalizedHackathon[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onSelectHackathon: (h: NormalizedHackathon) => void;
}

export const HackathonFinderModal: React.FC<HackathonFinderModalProps> = ({
  isOpen,
  onClose,
  allHackathons,
  bookmarkedIds,
  onToggleBookmark,
  onSelectHackathon,
}) => {
  const [step, setStep] = useState<number>(1);
  const [experience, setExperience] = useState<string>("any");
  const [format, setFormat] = useState<string>("any");
  const [domain, setDomain] = useState<string>("ai");
  const [matchedResults, setMatchedResults] = useState<NormalizedHackathon[]>([]);

  if (!isOpen) return null;

  const handleCalculateMatches = () => {
    let candidates = allHackathons.map((h) => {
      let score = 0;

      // Mode matching
      if (format === "online" && h.mode === "Online") score += 30;
      else if (format === "in-person" && h.mode === "In-Person") score += 30;
      else if (format === "any") score += 20;

      // Domain matching
      const combined = `${h.title} ${h.description} ${h.tags.join(" ")}`.toLowerCase();
      if (domain === "ai" && (combined.includes("ai") || combined.includes("machine learning") || combined.includes("agent"))) {
        score += 40;
      } else if (domain === "web3" && (combined.includes("web3") || combined.includes("crypto") || combined.includes("blockchain") || combined.includes("ethereum"))) {
        score += 40;
      } else if (domain === "web" && (combined.includes("frontend") || combined.includes("full stack") || combined.includes("web") || combined.includes("python"))) {
        score += 40;
      } else if (domain === "hardware" && (combined.includes("hardware") || combined.includes("iot") || combined.includes("robotics"))) {
        score += 40;
      } else if (domain === "fintech" && (combined.includes("fintech") || combined.includes("finance") || combined.includes("trading"))) {
        score += 40;
      }

      // Experience matching
      if (experience === "student" && (combined.includes("student") || combined.includes("beginner") || h.platform === "mlh")) {
        score += 20;
      } else if (experience === "pro" && (h.prizePool || h.platform === "devfolio" || h.platform === "dorahacks")) {
        score += 20;
      } else {
        score += 15;
      }

      return { hackathon: h, score };
    });

    candidates.sort((a, b) => b.score - a.score);
    const topMatches = candidates.slice(0, 4).map((c) => c.hackathon);
    setMatchedResults(topMatches);
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setExperience("any");
    setFormat("any");
    setDomain("ai");
    setMatchedResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              MATCHMAKER WIZARD
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white">
              Find your ideal hackathon
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Step 1: Experience */}
          {step === 1 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Question 1 of 3
              </span>
              <h4 className="text-xl font-bold text-black dark:text-white">
                What is your experience level?
              </h4>

              <div className="grid grid-cols-1 gap-3 pt-1">
                {[
                  {
                    id: "student",
                    title: "Student / Beginner",
                    desc: "Looking for workshops, mentor guidance, and beginner-friendly tracks.",
                  },
                  {
                    id: "builder",
                    title: "Experienced Builder",
                    desc: "Comfortable shipping complete MVPs, web apps, and exploring modern tech.",
                  },
                  {
                    id: "pro",
                    title: "Senior Hacker / Specialist",
                    desc: "Chasing high-stakes prize pools, DeFi grants, bounties, and awards.",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExperience(item.id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      experience === item.id
                        ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 ring-2 ring-black/10 dark:ring-white/10"
                        : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                    }`}
                  >
                    <div className="font-bold text-sm text-black dark:text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Format */}
          {step === 2 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Question 2 of 3
              </span>
              <h4 className="text-xl font-bold text-black dark:text-white">
                How do you want to participate?
              </h4>

              <div className="grid grid-cols-1 gap-3 pt-1">
                {[
                  {
                    id: "online",
                    title: "100% Virtual / Remote",
                    desc: "Hack from anywhere in the world at your own pace.",
                  },
                  {
                    id: "in-person",
                    title: "In-Person / On Campus",
                    desc: "Live campus energy, team building, networking, and physical swags.",
                  },
                  {
                    id: "any",
                    title: "Open to Any Format",
                    desc: "Show me the best hackathons regardless of location.",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      format === item.id
                        ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 ring-2 ring-black/10 dark:ring-white/10"
                        : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                    }`}
                  >
                    <div className="font-bold text-sm text-black dark:text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Domain */}
          {step === 3 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Question 3 of 3
              </span>
              <h4 className="text-xl font-bold text-black dark:text-white">
                Which technology domain are you building for?
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { id: "ai", title: "AI & Machine Learning", desc: "LLMs, Agents, RAG" },
                  { id: "web3", title: "Web3 & Blockchain", desc: "Ethereum, DeFi, Smart Contracts" },
                  { id: "web", title: "Full Stack & Web", desc: "React, APIs, Cloud" },
                  { id: "fintech", title: "Fintech & Markets", desc: "Quant, Trading, Finance" },
                  { id: "hardware", title: "IoT & Robotics", desc: "Hardware, Automation" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDomain(item.id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      domain === item.id
                        ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 ring-2 ring-black/10 dark:ring-white/10"
                        : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                    }`}
                  >
                    <div className="font-bold text-sm text-black dark:text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Matched Results */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Recommendations
                </span>
                <h4 className="text-xl font-bold text-black dark:text-white">
                  Top matched events for you
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchedResults.map((hack) => (
                  <HackathonCard
                    key={hack.id}
                    hackathon={hack}
                    isBookmarked={bookmarkedIds.has(hack.id)}
                    onToggleBookmark={onToggleBookmark}
                    onSelect={(h) => {
                      onSelectHackathon(h);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          {step > 1 && step < 4 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white text-xs font-semibold transition-colors"
            >
              Back
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          )}

          <div className="ml-auto">
            {step < 3 && (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-semibold text-xs transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleCalculateMatches}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-semibold text-xs transition-all"
              >
                <span>Find Matches</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-semibold text-xs transition-all"
              >
                Explore all hackathons
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
