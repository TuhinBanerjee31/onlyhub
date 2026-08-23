"use client";

import React, { useRef, useEffect } from "react";
import {
  Search,
  X,
  LayoutGrid,
  List as ListIcon,
  Calendar,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { FilterOptions, HackathonMode, HackathonStatus } from "@/types/hackathon";

interface FilterBarProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableTags: { tag: string; count: number }[];
  viewMode: "grid" | "list" | "timeline";
  setViewMode: (mode: "grid" | "list" | "timeline") => void;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  availableTags,
  viewMode,
  setViewMode,
  totalFiltered,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.platform !== "all" ||
    filters.mode !== "all" ||
    filters.tag !== "all" ||
    filters.status !== "all";

  const handleResetFilters = () => {
    setFilters({
      search: "",
      platform: "all",
      mode: "all",
      status: "ongoing",
      tag: "all",
      sortBy: "date-asc",
    });
  };

  return (
    <div id="hackathon-results-grid" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-6 space-y-4">
      {/* Top Controls Bar: Search, Status, Mode & View Mode */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search hackathons, technologies, host universities... (⌘K)"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-full pl-11 pr-10 py-3 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-500 hover:text-black dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: Status filter + Mode filter + View switcher */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end">
          {/* Status selector (Ongoing / Upcoming / Completed) */}
          <div className="relative inline-flex items-center">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as HackathonStatus | "all",
                }))
              }
              className="appearance-none pl-4 pr-9 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer shadow-sm"
            >
              <option value="all" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                All Statuses
              </option>
              <option value="ongoing" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                🟢 Ongoing
              </option>
              <option value="upcoming" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                🗓️ Upcoming
              </option>
              <option value="completed" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                🏁 Completed
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 pointer-events-none" />
          </div>

          {/* Format selector */}
          <div className="relative inline-flex items-center">
            <select
              value={filters.mode}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  mode: e.target.value as HackathonMode | "all",
                }))
              }
              className="appearance-none pl-4 pr-9 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer shadow-sm"
            >
              <option value="all" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                All Formats
              </option>
              <option value="Online" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                Virtual / Remote
              </option>
              <option value="In-Person" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                In-Person
              </option>
              <option value="Hybrid" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                Hybrid
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 pointer-events-none" />
          </div>

          {/* View switcher pill */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-black text-black dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-black text-black dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`p-2 rounded-full transition-all ${
                viewMode === "timeline"
                  ? "bg-white dark:bg-black text-black dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
              title="Timeline View"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setFilters((prev) => ({ ...prev, tag: "all" }))}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
            filters.tag === "all"
              ? "bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm"
              : "bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
          }`}
        >
          All Categories
        </button>

        {availableTags.map(({ tag, count }) => {
          const isSelected = filters.tag === tag;
          return (
            <button
              key={tag}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  tag: isSelected ? "all" : tag,
                }))
              }
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              {tag} <span className="opacity-60 ml-0.5">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Counter & Reset Feedback */}
      <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 pt-1">
        <div>
          Showing <strong className="text-black dark:text-white font-bold">{totalFiltered}</strong> hackathons
          {filters.platform !== "all" && ` on ${filters.platform}`}
          {filters.status !== "all" && ` (${filters.status})`}
          {filters.mode !== "all" && ` (${filters.mode})`}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-black dark:text-white font-medium hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset filters
          </button>
        )}
      </div>
    </div>
  );
};
