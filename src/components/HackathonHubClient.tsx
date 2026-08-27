"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { FilterBar } from "./FilterBar";
import { HackathonCard } from "./HackathonCard";
import { ListView } from "./ListView";
import { TimelineView } from "./TimelineView";
import { AnalyticsView } from "./AnalyticsView";
import { HackathonModal } from "./HackathonModal";
import { BookmarksDrawer } from "./BookmarksDrawer";
import { HackathonFinderModal } from "./HackathonFinderModal";
import { RequestPlatformModal } from "./RequestPlatformModal";
import { SubscribeModal } from "./SubscribeModal";
import { NewsletterBanner } from "./NewsletterBanner";
import {
  ApplicationStage,
  FilterOptions,
  HubStats,
  NormalizedHackathon,
  UserBookmark,
  HackathonStatus,
} from "@/types/hackathon";
import { getHackathonStatus, calculateHubStats, parseHackathonDate } from "@/lib/utils";
import {
  ArrowUp,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface HackathonHubClientProps {
  initialHackathons: NormalizedHackathon[];
  initialStats: HubStats;
}

const STORAGE_KEY = "onlyhub_bookmarks_v1";
const PAGE_SIZE = 24;

export const HackathonHubClient: React.FC<HackathonHubClientProps> = ({
  initialHackathons,
  initialStats,
}) => {
  const [activeTab, setActiveTab] = useState<"explore" | "analytics">("explore");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("grid");
  const [selectedHackathon, setSelectedHackathon] =
    useState<NormalizedHackathon | null>(null);

  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isRequestPlatformOpen, setIsRequestPlatformOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Normalize statuses dynamically based on the user's live client clock
  const hackathons = useMemo(() => {
    return initialHackathons.map((h) => {
      const liveStatus = getHackathonStatus(h.startDate, h.endDate).status;
      return {
        ...h,
        status: liveStatus,
      };
    });
  }, [initialHackathons]);

  const stats = useMemo(() => {
    return calculateHubStats(hackathons);
  }, [hackathons]);

  const defaultStatus: HackathonStatus = useMemo(() => {
    const hasOngoing = hackathons.some((h) => h.status === "ongoing");
    return hasOngoing ? "ongoing" : "upcoming";
  }, [hackathons]);

  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    platform: "all",
    mode: "all",
    status: initialHackathons.some(
      (h) => getHackathonStatus(h.startDate, h.endDate).status === "ongoing"
    )
      ? "ongoing"
      : "upcoming",
    tag: "all",
    sortBy: "date-asc",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load bookmarks:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (e) {
        console.error("Failed to save bookmarks:", e);
      }
    }
  }, [bookmarks, isLoaded]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const bookmarkedIds = useMemo(() => {
    return new Set(bookmarks.map((b) => b.hackathonId));
  }, [bookmarks]);

  const handleToggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.hackathonId === id);
      if (exists) {
        return prev.filter((b) => b.hackathonId !== id);
      } else {
        return [
          ...prev,
          {
            hackathonId: id,
            savedAt: new Date().toISOString(),
            stage: "Bookmarked",
          },
        ];
      }
    });
  };

  const handleUpdateStage = (id: string, stage: ApplicationStage) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.hackathonId === id ? { ...b, stage } : b))
    );
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.hackathonId === id ? { ...b, notes } : b))
    );
  };

  const filteredHackathons = useMemo(() => {
    const matchesFilters = (h: NormalizedHackathon, statusToCheck: string) => {
      if (filters.platform !== "all" && h.platform !== filters.platform) {
        return false;
      }

      if (filters.mode !== "all" && h.mode !== filters.mode) {
        return false;
      }

      if (statusToCheck !== "all" && h.status !== statusToCheck) {
        return false;
      }

      if (filters.tag !== "all" && !h.tags.includes(filters.tag)) {
        return false;
      }

      if (filters.search.trim() !== "") {
        const query = filters.search.toLowerCase();
        const matchesTitle = h.title.toLowerCase().includes(query);
        const matchesDesc = h.description.toLowerCase().includes(query);
        const matchesLocation = (h.location || "").toLowerCase().includes(query);
        const matchesTags = h.tags.some((t) => t.toLowerCase().includes(query));
        const matchesOrg = (h.organizer || "").toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesLocation && !matchesTags && !matchesOrg) {
          return false;
        }
      }

      return true;
    };

    let result = hackathons.filter((h) => matchesFilters(h, filters.status));

    // If filtering by "ongoing" yielded 0 results, fall back to "upcoming"
    if (filters.status === "ongoing" && result.length === 0) {
      result = hackathons.filter((h) => matchesFilters(h, "upcoming"));
    }

    return result.sort((a, b) => {
      if (filters.sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }

      if (filters.sortBy === "date-asc") {
        const timeA = parseHackathonDate(a.startDate)?.getTime() || Number.MAX_SAFE_INTEGER;
        const timeB = parseHackathonDate(b.startDate)?.getTime() || Number.MAX_SAFE_INTEGER;
        return timeA - timeB;
      }

      if (filters.sortBy === "date-desc") {
        const timeA = parseHackathonDate(a.startDate)?.getTime() || 0;
        const timeB = parseHackathonDate(b.startDate)?.getTime() || 0;
        return timeB - timeA;
      }

      return 0;
    });
  }, [hackathons, filters]);

  const visibleHackathons = useMemo(() => {
    return filteredHackathons.slice(0, visibleCount);
  }, [filteredHackathons, visibleCount]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      {/* Top Navigation */}
      <Navbar
        bookmarkCount={bookmarks.length}
        totalHackathons={stats.total}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenAnalytics={() => {
          setActiveTab("analytics");
          scrollToTop();
        }}
        onOpenFinder={() => setIsFinderOpen(true)}
        onOpenRequestPlatform={() => setIsRequestPlatformOpen(true)}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Tab View */}
      <AnimatePresence mode="wait">
        {activeTab === "analytics" ? (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <AnalyticsView
              stats={stats}
              allHackathons={hackathons}
              onFilterByPlatform={(p) => {
                setFilters((prev) => ({ ...prev, platform: p }));
                setActiveTab("explore");
              }}
              onFilterByTag={(tag) => {
                setFilters((prev) => ({ ...prev, tag }));
                setActiveTab("explore");
              }}
            />
          </motion.div>
        ) : (
          <motion.main
            key="explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            {/* Hero Section */}
            <HeroSection
              stats={stats}
              filters={filters}
              setFilters={setFilters}
              onOpenFinder={() => setIsFinderOpen(true)}
              onOpenRequestPlatform={() => setIsRequestPlatformOpen(true)}
              onOpenSubscribe={() => setIsSubscribeOpen(true)}
            />

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              availableTags={stats.popularTags}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalFiltered={filteredHackathons.length}
            />

            {/* Results Grid / List / Timeline */}
            <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pb-16">
              <AnimatePresence mode="wait">
                {filteredHackathons.length === 0 ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 my-8 shadow-sm"
                  >
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      No hackathons found
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      No events matched your current search parameters.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setFilters({
                          search: "",
                          platform: "all",
                          mode: "all",
                          status: defaultStatus,
                          tag: "all",
                          sortBy: "date-asc",
                        })
                      }
                      className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
                    >
                      Reset all filters
                    </button>
                  </motion.div>
                ) : viewMode === "grid" ? (
                  <motion.div
                    key="grid-view"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-8"
                  >
                    <motion.div
                      layout
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      <AnimatePresence>
                        {visibleHackathons.map((hack) => (
                          <HackathonCard
                            key={hack.id}
                            hackathon={hack}
                            isBookmarked={bookmarkedIds.has(hack.id)}
                            onToggleBookmark={handleToggleBookmark}
                            onSelect={(h) => setSelectedHackathon(h)}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {/* Load More Button */}
                    {visibleCount < filteredHackathons.length && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={() =>
                            setVisibleCount((prev) =>
                              Math.min(prev + PAGE_SIZE, filteredHackathons.length)
                            )
                          }
                          className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white font-bold text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800 shadow-sm transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                          <span>
                            Load More ({visibleCount} of {filteredHackathons.length} shown)
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={() => setVisibleCount(filteredHackathons.length)}
                          className="px-6 py-3.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 shadow-sm transition-opacity"
                        >
                          Show All {filteredHackathons.length} Events
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ) : viewMode === "list" ? (
                  <motion.div
                    key="list-view"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-8"
                  >
                    <ListView
                      hackathons={visibleHackathons}
                      bookmarkedIds={bookmarkedIds}
                      onToggleBookmark={handleToggleBookmark}
                      onSelect={(h) => setSelectedHackathon(h)}
                    />

                    {visibleCount < filteredHackathons.length && (
                      <div className="flex justify-center pt-4">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={() => setVisibleCount(filteredHackathons.length)}
                          className="px-8 py-3.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 shadow-sm transition-opacity"
                        >
                          Show All {filteredHackathons.length} Rows
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="timeline-view"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <TimelineView
                      hackathons={filteredHackathons}
                      bookmarkedIds={bookmarkedIds}
                      onToggleBookmark={handleToggleBookmark}
                      onSelect={(h) => setSelectedHackathon(h)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Polarity-Flipped Black Promo Band */}
            <section className="bg-black text-white py-16 px-4 sm:px-8 my-8 border-t border-neutral-800">
              <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    WHY BUILD WITH ONLYHUB
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    Build prototypes. Win grants. Get noticed.
                  </h2>
                  <p className="text-base text-neutral-400 max-w-2xl leading-relaxed">
                    Join tens of thousands of developers discovering elite competitions,
                    securing sponsor prize bounties, and turning weekend projects into venture-backed startups.
                  </p>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setIsFinderOpen(true)}
                    className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-white text-black hover:bg-neutral-100 font-semibold text-sm transition-colors shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Matchmaker</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, platform: "all", search: "" }));
                      scrollToTop();
                    }}
                    className="py-3.5 px-6 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 font-semibold text-sm text-center border border-neutral-700 transition-colors"
                  >
                    Browse all {stats.total} events
                  </motion.button>
                </div>
              </div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Modals & Drawers */}
      <HackathonModal
        hackathon={selectedHackathon}
        isOpen={!!selectedHackathon}
        onClose={() => setSelectedHackathon(null)}
        isBookmarked={
          selectedHackathon ? bookmarkedIds.has(selectedHackathon.id) : false
        }
        onToggleBookmark={handleToggleBookmark}
      />

      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        allHackathons={hackathons}
        onRemoveBookmark={handleToggleBookmark}
        onUpdateStage={handleUpdateStage}
        onUpdateNotes={handleUpdateNotes}
        onSelectHackathon={(h) => setSelectedHackathon(h)}
      />

      <HackathonFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        allHackathons={hackathons}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={handleToggleBookmark}
        onSelectHackathon={(h) => setSelectedHackathon(h)}
      />

      <RequestPlatformModal
        isOpen={isRequestPlatformOpen}
        onClose={() => setIsRequestPlatformOpen(false)}
      />

      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black shadow-2xl flex items-center justify-center border border-neutral-200 dark:border-neutral-800"
            title="Back to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Newsletter Alert Subscription Banner */}
      <NewsletterBanner />

      {/* Deep Black Footer */}
      <footer className="bg-black text-white pt-14 pb-10 border-t border-neutral-800">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 space-y-12">
          {/* Top Row: Brand & Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-neutral-800 pb-8">
            <div className="flex items-center">
              <div className="relative w-18 h-18 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
                <Image
                  src="/onlyhub_logo.png"
                  alt="onlyhub logo"
                  width={80}
                  height={80}
                  className="object-contain w-full h-full drop-shadow-md"
                />
              </div>
              <div>
                <div className="flex items-baseline font-brand select-none">
                  <span className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-white">
                    only
                  </span>
                  <span className="text-3xl sm:text-4xl font-black tracking-[-0.04em] bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                    hub
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1 mb-1 inline-block animate-pulse" />
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  The global terminal for builders, engineers, and students.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsSubscribeOpen(true)}
                className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all"
              >
                🔔 24h Alerts
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsRequestPlatformOpen(true)}
                className="px-4 py-2 rounded-full bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 text-xs font-semibold transition-colors"
              >
                + Request Platform
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsFinderOpen(true)}
                className="px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-100 text-xs font-semibold transition-colors"
              >
                Matchmaker
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsBookmarksOpen(true)}
                className="px-4 py-2 rounded-full bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 text-xs font-semibold transition-colors"
              >
                Shortlist ({bookmarks.length})
              </motion.button>
            </div>
          </div>

          {/* Fine Print */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
            <div>
              © 2026 onlyhub. Developed by <a href="https://github.com/TuhinBanerjee31" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Tuhin Banerjee</a> with some brain, Antigravity and <a href="https://brightdata.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Bright Data</a>.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
