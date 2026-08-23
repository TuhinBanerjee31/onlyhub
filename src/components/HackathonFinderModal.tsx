"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { NormalizedHackathon } from "@/types/hackathon";

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

  const handleMatch = () => {
    let matches = allHackathons.filter((h) => {
      if (format !== "any") {
        if (format === "Online" && h.mode !== "Online") return false;
        if (format === "In-Person" && h.mode !== "In-Person" && h.mode !== "Hybrid")
          return false;
      }
      return true;
    });

    const domainKeywords: Record<string, string[]> = {
      ai: ["AI & ML", "ai", "machine learning", "llm", "agents", "python"],
      web3: ["Web3 & Crypto", "web3", "crypto", "solana", "ethereum", "blockchain"],
      fullstack: ["Full Stack & Web", "react", "nextjs", "javascript", "full stack"],
      student: ["Student & Beginner", "beginner", "student", "mlh", "university"],
      hardware: ["IoT & Hardware", "iot", "robotics", "hardware"],
    };

    const targetWords = domainKeywords[domain] || [];

    const scored = matches.map((h) => {
      let score = 0;
      const combined = `${h.title} ${h.description} ${h.tags.join(" ")}`.toLowerCase();

      targetWords.forEach((word) => {
        if (combined.includes(word.toLowerCase())) {
          score += 3;
        }
      });

      if (experience === "student" && h.platform === "mlh") score += 5;
      if (experience === "hacker" && (h.platform === "dorahacks" || h.prizePool)) score += 5;
      if (experience === "builder" && h.platform === "devfolio") score += 3;
      if (h.status === "ongoing" || h.status === "upcoming") score += 4;

      return { hack: h, score };
    });

    scored.sort((a, b) => b.score - a.score);
    setMatchedResults(scored.slice(0, 4).map((s) => s.hack));
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 350, damping: 30 },
            }}
            exit={{ scale: 0.94, opacity: 0, y: 20, transition: { duration: 0.15 } }}
            className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col z-10 my-auto"
          >
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

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Experience */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
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
                          id: "hacker",
                          title: "Specialist Hacker / Bounty Hunter",
                          desc: "Focused on Web3 protocols, AI benchmarks, and competitive cash prize pools.",
                        },
                        {
                          id: "any",
                          title: "Show Me Everything",
                          desc: "Open to all competition formats and skill tiers.",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setExperience(opt.id)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            experience === opt.id
                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md scale-[1.01]"
                              : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <div className="font-bold text-sm">{opt.title}</div>
                          <div
                            className={`text-xs mt-1 ${
                              experience === opt.id
                                ? "opacity-80"
                                : "text-neutral-500 dark:text-neutral-400"
                            }`}
                          >
                            {opt.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Format */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Question 2 of 3
                    </span>
                    <h4 className="text-xl font-bold text-black dark:text-white">
                      What participation format do you prefer?
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {[
                        { id: "Online", label: "🌐 Virtual / Remote" },
                        { id: "In-Person", label: "📍 In-Person Campus" },
                        { id: "any", label: "⚡ Any Format" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFormat(opt.id)}
                          className={`p-5 rounded-2xl border text-center font-bold text-sm transition-all ${
                            format === opt.id
                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md scale-[1.01]"
                              : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Domain */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Question 3 of 3
                    </span>
                    <h4 className="text-xl font-bold text-black dark:text-white">
                      What technology track excites you most?
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {[
                        { id: "ai", label: "🤖 AI & Large Language Models" },
                        { id: "web3", label: "⛓️ Web3 & Smart Contracts" },
                        { id: "fullstack", label: "💻 Full Stack & Web Apps" },
                        { id: "student", label: "🎓 University MLH Season" },
                        { id: "hardware", label: "🔌 IoT & Hardware" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDomain(opt.id)}
                          className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all ${
                            domain === opt.id
                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md scale-[1.01]"
                              : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Results */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      <CheckCircle className="w-5 h-5" />
                      <h4 className="text-xl font-bold">Top Matched Hackathons</h4>
                    </div>

                    <div className="space-y-3 pt-1">
                      {matchedResults.map((hack) => (
                        <div
                          key={hack.id}
                          className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white">
                                {hack.platform}
                              </span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                {hack.displayDates}
                              </span>
                            </div>
                            <h5 className="font-bold text-base text-black dark:text-white">
                              {hack.title}
                            </h5>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-1">
                              {hack.shortDescription}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => {
                                onSelectHackathon(hack);
                                onClose();
                              }}
                              className="px-4 py-2 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-black dark:text-white font-semibold text-xs transition-colors"
                            >
                              Details
                            </motion.button>
                            <motion.a
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={hack.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center gap-1 hover:opacity-90 shadow-sm"
                            >
                              <span>Apply</span>
                              <ExternalLink className="w-3 h-3" />
                            </motion.a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50">
              {step > 1 && step < 4 ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setStep((prev) => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </motion.button>
              ) : step === 4 ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Over</span>
                </motion.button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setStep((prev) => prev + 1)}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              ) : step === 3 ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleMatch}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Find My Hackathons</span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
                >
                  Close & Explore
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
