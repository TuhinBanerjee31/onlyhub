"use client";

import React from "react";
import {
  MapPin,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { NormalizedHackathon } from "@/types/hackathon";

interface TimelineViewProps {
  hackathons: NormalizedHackathon[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onSelect: (h: NormalizedHackathon) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  hackathons,
  bookmarkedIds,
  onToggleBookmark,
  onSelect,
}) => {
  const groups: Record<string, NormalizedHackathon[]> = {};

  hackathons.forEach((hack) => {
    let groupKey = "Upcoming Schedule";

    if (hack.startDate) {
      try {
        const d = new Date(hack.startDate);
        if (!isNaN(d.getTime())) {
          groupKey = d.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        } else {
          const monthMatch = hack.startDate.match(
            /(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|January|February|March|April|May|June|July|August|September|October|November|December)/i
          );
          if (monthMatch) {
            groupKey = `${monthMatch[1].toUpperCase()} 2026`;
          }
        }
      } catch {
        groupKey = "Upcoming Schedule";
      }
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(hack);
  });

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {Object.entries(groups).map(([month, items]) => (
        <div key={month} className="space-y-4">
          {/* Month Header Pill */}
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider">
              {month}
            </span>
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {items.length} Hackathons
            </span>
            <div className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Timeline Stacked Cards */}
          <div className="pl-4 sm:pl-6 border-l-2 border-black dark:border-white space-y-4 ml-3">
            {items.map((hack) => {
              const isBookmarked = bookmarkedIds.has(hack.id);

              return (
                <div
                  key={hack.id}
                  onClick={() => onSelect(hack)}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-500 rounded-2xl p-5 cursor-pointer relative group space-y-3 shadow-sm transition-all"
                >
                  {/* Timeline node */}
                  <div className="absolute -left-[23px] sm:-left-[31px] top-6 w-3 h-3 rounded-full bg-black dark:bg-white" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white uppercase border border-neutral-200 dark:border-neutral-700">
                        {hack.platform}
                      </span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        {hack.mode}
                      </span>
                    </div>

                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {hack.displayDates}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-black dark:text-white group-hover:underline">
                    {hack.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                    {hack.shortDescription}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{hack.location || "Global"}</span>
                      </span>
                      {hack.prizePool && (
                        <span className="font-semibold text-black dark:text-white">
                          {hack.prizePool}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(hack.id);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isBookmarked
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                      </button>

                      <a
                        href={hack.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-semibold text-xs transition-all shadow-sm"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
