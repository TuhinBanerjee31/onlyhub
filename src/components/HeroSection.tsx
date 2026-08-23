"use client";

import React, { useState } from "react";
import {
  Search,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { FilterOptions, HubStats, PlatformType, HackathonMode } from "@/types/hackathon";

interface HeroSectionProps {
  stats: HubStats;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onOpenFinder: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stats,
  filters,
  setFilters,
  onOpenFinder,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: localSearch }));
    const resultsElem = document.getElementById("hackathon-results-grid");
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const platforms: { id: PlatformType | "all"; label: string; count: number }[] = [
    { id: "all", label: "All Platforms", count: stats.total },
    { id: "devfolio", label: "Devfolio", count: stats.platformCounts.devfolio || 29 },
    { id: "dorahacks", label: "DoraHacks", count: stats.platformCounts.dorahacks || 17 },
    { id: "mlh", label: "MLH", count: stats.platformCounts.mlh || 73 },
    { id: "unstop", label: "Unstop", count: stats.platformCounts.unstop || 18 },
    { id: "wemakedevs", label: "WeMakeDevs", count: stats.platformCounts.wemakedevs || 23 },
  ];

  return (
    <section className="bg-white dark:bg-black py-12 md:py-16 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Intro */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              ONLYHUB HACKATHON RADAR
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white leading-[1.1]">
              Go build with onlyhub.
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
              Explore 160+ engineering competitions, Web3 buildathons,
              and campus hackathons aggregated across Devfolio, DoraHacks, MLH, Unstop, and WeMakeDevs.
            </p>

            {/* Platform Filter Pills */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                Select Platform
              </div>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => {
                  const isSelected = filters.platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, platform: p.id }))
                      }
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                          : "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {p.label} <span className="opacity-60 ml-1">({p.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 max-w-md border-t border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {stats.total}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Active Events
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {stats.onlineCount}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Virtual / Global
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {stats.inPersonCount}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  In-Person Venues
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Search & Request Card */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
              
              {/* Card Header & Format Toggle */}
              <div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                  Find your competition
                </h3>

                {/* Tab Pill Toggle */}
                <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-xs font-semibold">
                  {[
                    { id: "all", label: "All Formats" },
                    { id: "Online", label: "Virtual" },
                    { id: "In-Person", label: "In-Person" },
                  ].map((modeOption) => {
                    const isSelected = filters.mode === modeOption.id;
                    return (
                      <button
                        key={modeOption.id}
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            mode: modeOption.id as HackathonMode | "all",
                          }))
                        }
                        className={`flex-1 py-2 rounded-full transition-all text-center ${
                          isSelected
                            ? "bg-white dark:bg-black text-black dark:text-white shadow-sm"
                            : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {modeOption.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Input Rows */}
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                {/* Search Input Row */}
                <div className="flex items-center gap-3 p-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-transparent focus-within:border-neutral-400 dark:focus-within:border-neutral-600">
                  <Search className="w-4 h-4 text-neutral-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by title, stack, college..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full bg-transparent text-sm text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none"
                  />
                </div>

                {/* Domain Selector */}
                <div className="flex items-center gap-3 p-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                  <Layers className="w-4 h-4 text-neutral-500 shrink-0" />
                  <select
                    value={filters.tag}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, tag: e.target.value }))
                    }
                    className="w-full bg-transparent text-sm text-black dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      All Themes & Domains
                    </option>
                    {stats.popularTags.map((t) => (
                      <option
                        key={t.tag}
                        value={t.tag}
                        className="bg-white dark:bg-neutral-900 text-black dark:text-white"
                      >
                        {t.tag} ({t.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-3 p-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                  <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: e.target.value as FilterOptions["sortBy"],
                      }))
                    }
                    className="w-full bg-transparent text-sm text-black dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="date-asc" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      Sort by Earliest Date
                    </option>
                    <option value="date-desc" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      Sort by Latest Date
                    </option>
                    <option value="title-asc" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      Sort by Title (A-Z)
                    </option>
                    <option value="relevance" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      Sort by Featured
                    </option>
                  </select>
                </div>

                {/* Primary CTA Black Pill */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>Search hackathons</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Matchmaker Link */}
              <div className="text-center pt-1">
                <button
                  onClick={onOpenFinder}
                  className="text-xs text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white underline font-medium"
                >
                  Unsure where to start? Take the 3-step Matchmaker
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
