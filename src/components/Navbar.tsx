"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Bookmark, Sun, Moon, Sparkles } from "lucide-react";

interface NavbarProps {
  bookmarkCount: number;
  totalHackathons: number;
  onOpenBookmarks: () => void;
  onOpenAnalytics: () => void;
  onOpenFinder: () => void;
  activeTab: "explore" | "analytics";
  setActiveTab: (tab: "explore" | "analytics") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarkCount,
  totalHackathons,
  onOpenBookmarks,
  onOpenAnalytics,
  onOpenFinder,
  activeTab,
  setActiveTab,
}) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 py-2.5 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex items-center justify-between">
        
        {/* Brand & Nav */}
        <div className="flex items-center gap-6 sm:gap-8">
          <div
            onClick={() => setActiveTab("explore")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {/* Prominent Large Logo Emblem */}
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center">
              <Image
                src="/onlyhub_logo.png"
                alt="onlyhub logo"
                width={64}
                height={64}
                className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
            <span className="text-2xl sm:text-3xl tracking-widest text-black dark:text-white group-hover:opacity-90 transition-opacity">
              onlyhub
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab("explore")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "explore"
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              Explore ({totalHackathons})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "analytics"
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              Radar Insights
            </button>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Matchmaker AI */}
          <button
            onClick={onOpenFinder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Matchmaker</span>
          </button>

          {/* Shortlist */}
          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white text-xs sm:text-sm font-medium transition-colors"
            title="View Shortlist"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shortlist</span>
            {bookmarkCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-center text-black dark:text-white transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
