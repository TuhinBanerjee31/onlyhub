"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Sun, Moon, Sparkles, Activity, Compass, Plus, Bell } from "lucide-react";

interface NavbarProps {
  bookmarkCount: number;
  totalHackathons: number;
  onOpenBookmarks: () => void;
  onOpenAnalytics: () => void;
  onOpenFinder: () => void;
  onOpenRequestPlatform?: () => void;
  onOpenSubscribe?: () => void;
  activeTab: "explore" | "analytics";
  setActiveTab: (tab: "explore" | "analytics") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarkCount,
  totalHackathons,
  onOpenBookmarks,
  onOpenAnalytics,
  onOpenFinder,
  onOpenRequestPlatform,
  onOpenSubscribe,
  activeTab,
  setActiveTab,
}) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("onlyhub_theme");
      if (savedTheme) {
        const isDarkPref = savedTheme === "dark";
        setIsDark(isDarkPref);
        if (isDarkPref) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        const isDarkMode = document.documentElement.classList.contains("dark");
        setIsDark(isDarkMode);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = (e?: React.MouseEvent) => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    const updateDOM = () => {
      if (newIsDark) {
        document.documentElement.classList.add("dark");
        try {
          localStorage.setItem("onlyhub_theme", "dark");
        } catch {
          // ignore
        }
      } else {
        document.documentElement.classList.remove("dark");
        try {
          localStorage.setItem("onlyhub_theme", "light");
        } catch {
          // ignore
        }
      }
    };

    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as any).startViewTransition === "function"
    ) {
      const transition = (document as any).startViewTransition(updateDOM);

      const x = e?.clientX ?? (typeof window !== "undefined" ? window.innerWidth - 40 : 0);
      const y = e?.clientY ?? 40;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 420,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {});
    } else {
      updateDOM();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full pt-3 sm:pt-4 px-3 sm:px-6 transition-colors duration-300 pointer-events-none">
      <div className="max-w-[1240px] mx-auto bg-white/85 dark:bg-black/85 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl sm:rounded-full px-4 sm:px-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-between transition-colors duration-300 pointer-events-auto">
        
        {/* Brand Logo & Live Radar Pill */}
        <div className="flex items-center gap-5 sm:gap-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("explore")}
            className="flex items-center cursor-pointer select-none group"
          >
            {/* High-res Mascot Logo with Ambient Halo */}
            <div className="relative w-10 h-10 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center rounded-xl ">
              <Image
                src="/onlyhub_logo.png"
                alt="onlyhub logo"
                width={56}
                height={56}
                className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-baseline font-brand select-none -ml-3">
                <span className="text-xl sm:text-2xl font-black tracking-[-0.04em] text-black dark:text-white">
                  only
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-[-0.04em] bg-gradient-to-r from-neutral-800 via-neutral-900 to-black dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
                  hub
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 mb-1 inline-block animate-pulse" />
              </div>

              {/* Glowing Live Radar Indicator */}
              {/* <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold tracking-wider uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Live Feed</span>
              </div> */}
            </div>
          </motion.div>

          {/* Smooth Sliding Segmented Control */}
          <nav className="hidden md:flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 relative">
            {/* Explore Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("explore")}
              className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 flex items-center gap-1.5 ${
                activeTab === "explore"
                  ? "text-white dark:text-black"
                  : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {activeTab === "explore" && (
                <motion.div
                  layoutId="navActivePill"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-black dark:bg-white rounded-full shadow-md -z-10"
                />
              )}
              <Compass className="w-3.5 h-3.5" />
              <span>Explore ({totalHackathons})</span>
            </button>

            {/* Radar Insights Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 flex items-center gap-1.5 ${
                activeTab === "analytics"
                  ? "text-white dark:text-black"
                  : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {activeTab === "analytics" && (
                <motion.div
                  layoutId="navActivePill"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-black dark:bg-white rounded-full shadow-md -z-10"
                />
              )}
              <Activity className="w-3.5 h-3.5" />
              <span>Radar Insights</span>
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Request Platform Button */}
          {onOpenRequestPlatform && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenRequestPlatform}
              className="hidden md:flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white text-xs font-bold transition-all shadow-sm group"
              title="Request a new platform"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500 group-hover:rotate-90 transition-transform duration-300" />
              <span>Request Platform</span>
            </motion.button>
          )}

          {/* Radar Alerts Subscribe Button */}
          {onOpenSubscribe && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenSubscribe}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white text-xs font-bold transition-all shadow-sm group"
              title="Subscribe for 24h Hackathon Alerts"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
              <span>Alerts</span>
            </motion.button>
          )}

          {/* Matchmaker AI Button with Subtle Aura */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenFinder}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white text-xs font-bold transition-all shadow-sm group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden xs:inline">Matchmaker</span>
          </motion.button>

          {/* Shortlist Drawer Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenBookmarks}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white text-xs font-bold transition-all shadow-sm"
            title="View Shortlist"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarkCount > 0 ? "fill-current text-black dark:text-white" : ""}`} />
            <span className="hidden sm:inline">Shortlist</span>
            {bookmarkCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                {bookmarkCount}
              </span>
            )}
          </motion.button>

          {/* Dark / Light Mode Switcher */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-black dark:text-white transition-colors duration-200 shadow-sm overflow-hidden"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? "dark" : "light"}
                initial={{ y: -16, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 16, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-center"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-neutral-700" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
