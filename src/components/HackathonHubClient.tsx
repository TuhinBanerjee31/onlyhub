"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
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
import {
  ApplicationStage,
  FilterOptions,
  HubStats,
  NormalizedHackathon,
  UserBookmark,
} from "@/types/hackathon";
import {
  ArrowUp,
  Sparkles,
} from "lucide-react";

interface HackathonHubClientProps {
  initialHackathons: NormalizedHackathon[];
  initialStats: HubStats;
}

const STORAGE_KEY = "onlyhub_bookmarks_v1";

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
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    platform: "all",
    mode: "all",
    status: "all",
    tag: "all",
    sortBy: "date-asc",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load bookmarks", e);
    }
    setIsLoaded(true);

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (e) {
        console.error("Failed to save bookmarks", e);
      }
    }
  }, [bookmarks, isLoaded]);

  const bookmarkedIds = useMemo(
    () => new Set(bookmarks.map((b) => b.hackathonId)),
    [bookmarks]
  );

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
    return initialHackathons
      .filter((h) => {
        if (filters.platform !== "all" && h.platform !== filters.platform) {
          return false;
        }

        if (filters.mode !== "all" && h.mode !== filters.mode) {
          return false;
        }

        if (filters.status !== "all" && h.status !== filters.status) {
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
          const matchesOrganizer = (h.organizer || "").toLowerCase().includes(query);
          const matchesTags = h.tags.some((t) => t.toLowerCase().includes(query));
          const matchesPlatform = h.platform.toLowerCase().includes(query);

          if (
            !matchesTitle &&
            !matchesDesc &&
            !matchesLocation &&
            !matchesOrganizer &&
            !matchesTags &&
            !matchesPlatform
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "title-asc") {
          return a.title.localeCompare(b.title);
        } else if (filters.sortBy === "relevance") {
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        } else if (filters.sortBy === "date-desc") {
          return (b.startDate || "").localeCompare(a.startDate || "");
        } else {
          if (!a.startDate) return 1;
          if (!b.startDate) return -1;
          return a.startDate.localeCompare(b.startDate);
        }
      });
  }, [initialHackathons, filters]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors">
      {/* Top Navbar */}
      <Navbar
        bookmarkCount={bookmarks.length}
        totalHackathons={initialStats.total}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenAnalytics={() => setActiveTab("analytics")}
        onOpenFinder={() => setIsFinderOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Tab View */}
      {activeTab === "analytics" ? (
        <AnalyticsView
          stats={initialStats}
          allHackathons={initialHackathons}
          onFilterByPlatform={(p) => {
            setFilters((prev) => ({ ...prev, platform: p }));
            setActiveTab("explore");
          }}
          onFilterByTag={(tag) => {
            setFilters((prev) => ({ ...prev, tag }));
            setActiveTab("explore");
          }}
        />
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <HeroSection
            stats={initialStats}
            filters={filters}
            setFilters={setFilters}
            onOpenFinder={() => setIsFinderOpen(true)}
          />

          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            availableTags={initialStats.popularTags}
            viewMode={viewMode}
            setViewMode={setViewMode}
            totalFiltered={filteredHackathons.length}
          />

          {/* Results Grid / List / Timeline */}
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pb-16">
            {filteredHackathons.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 my-8 shadow-sm">
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
                      status: "all",
                      tag: "all",
                      sortBy: "date-asc",
                    })
                  }
                  className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
                >
                  Reset all filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHackathons.map((hack) => (
                  <HackathonCard
                    key={hack.id}
                    hackathon={hack}
                    isBookmarked={bookmarkedIds.has(hack.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onSelect={(h) => setSelectedHackathon(h)}
                  />
                ))}
              </div>
            ) : viewMode === "list" ? (
              <ListView
                hackathons={filteredHackathons}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                onSelect={(h) => setSelectedHackathon(h)}
              />
            ) : (
              <TimelineView
                hackathons={filteredHackathons}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                onSelect={(h) => setSelectedHackathon(h)}
              />
            )}
          </div>

          {/* Polarity-Flipped Black Promo Band */}
          <section className="bg-black text-white py-16 px-4 sm:px-8 my-8 border-y border-neutral-800">
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
                <button
                  type="button"
                  onClick={() => setIsFinderOpen(true)}
                  className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-white text-black hover:bg-neutral-100 font-semibold text-sm transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Matchmaker</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, platform: "all", search: "" }));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="py-3.5 px-6 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 font-semibold text-sm text-center border border-neutral-700 transition-all"
                >
                  Browse all {initialStats.total} events
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

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
        allHackathons={initialHackathons}
        onRemoveBookmark={handleToggleBookmark}
        onUpdateStage={handleUpdateStage}
        onUpdateNotes={handleUpdateNotes}
        onSelectHackathon={(h) => setSelectedHackathon(h)}
      />

      <HackathonFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        allHackathons={initialHackathons}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={handleToggleBookmark}
        onSelectHackathon={(h) => setSelectedHackathon(h)}
      />

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black shadow-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Deep Black Footer */}
      <footer className="bg-black text-white pt-14 pb-10 border-t border-neutral-800">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 space-y-12">
          {/* Top Row: Brand & Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-neutral-800 pb-8">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
                <Image
                  src="/onlyhub_logo.png"
                  alt="onlyhub logo"
                  width={80}
                  height={80}
                  className="object-contain w-full h-full drop-shadow-md"
                />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white block">
                  onlyhub
                </span>
                <p className="text-xs text-neutral-400 mt-1">
                  The global terminal for builders, engineers, and creators.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFinderOpen(true)}
                className="px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-100 text-xs font-semibold transition-colors"
              >
                Matchmaker
              </button>
              <button
                type="button"
                onClick={() => setIsBookmarksOpen(true)}
                className="px-4 py-2 rounded-full bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 text-xs font-semibold transition-colors"
              >
                Shortlist ({bookmarks.length})
              </button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-neutral-400">
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Ecosystems
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, platform: "devfolio" }));
                      setActiveTab("explore");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Devfolio Hackathons ({initialStats.platformCounts.devfolio || 29})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, platform: "wemakedevs" }));
                      setActiveTab("explore");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    WeMakeDevs ({initialStats.platformCounts.wemakedevs || 23})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, platform: "dorahacks" }));
                      setActiveTab("explore");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    DoraHacks Bounties ({initialStats.platformCounts.dorahacks || 17})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, platform: "mlh" }));
                      setActiveTab("explore");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    MLH Season ({initialStats.platformCounts.mlh || 73})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, platform: "unstop" }));
                      setActiveTab("explore");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Unstop Challenges ({initialStats.platformCounts.unstop || 18})
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Technology Focus
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, tag: "AI & ML" }));
                      setActiveTab("explore");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    AI & Machine Learning
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, tag: "Web3 & Crypto" }));
                      setActiveTab("explore");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Web3 & Blockchain
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, tag: "Open Source" }));
                      setActiveTab("explore");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Open Source
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, tag: "Fintech" }));
                      setActiveTab("explore");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Fintech & Quantitative
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Platform Features
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setIsFinderOpen(true)}
                    className="hover:text-white transition-colors"
                  >
                    Hackathon Matchmaker
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsBookmarksOpen(true)}
                    className="hover:text-white transition-colors"
                  >
                    Application Tracker & CSV
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab("analytics")}
                    className="hover:text-white transition-colors"
                  >
                    Landscape Analytics
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                onlyhub
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Aggregating 160+ hackathons across 5 major ecosystems in a minimal, high-speed, black-and-white interface.
              </p>
            </div>
          </div>

          {/* Fine Print */}
          <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
            <div>
              © 2026 onlyhub. All rights reserved. Data sourced from public hackathon feeds.
            </div>

            <div className="flex items-center gap-6">
              <span>Privacy</span>
              <span>Terms</span>
              <span>API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
