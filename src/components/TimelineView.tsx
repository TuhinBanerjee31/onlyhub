"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { NormalizedHackathon } from "@/types/hackathon";
import { parseHackathonDate } from "@/lib/utils";

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
  // Group hackathons accurately by Month & Year using parseHackathonDate
  const sortedGroups = useMemo(() => {
    const groupMap = new Map<
      string,
      { label: string; dateVal: number; items: NormalizedHackathon[] }
    >();

    const currentYear = new Date().getFullYear();

    hackathons.forEach((hack) => {
      let groupKey = "Upcoming Schedule";
      let dateVal = 9999999999999;

      const parsed = parseHackathonDate(hack.startDate);
      if (parsed) {
        // Guard against legacy two-digit date conversions (e.g. year < 2020)
        let yr = parsed.getFullYear();
        if (yr < 2020) {
          yr = currentYear;
          parsed.setFullYear(currentYear);
        }

        groupKey = parsed.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        // Numerical timestamp for chronological month sorting
        dateVal = new Date(yr, parsed.getMonth(), 1).getTime();
      }

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          label: groupKey,
          dateVal,
          items: [],
        });
      }
      groupMap.get(groupKey)!.items.push(hack);
    });

    return Array.from(groupMap.values()).sort((a, b) => a.dateVal - b.dateVal);
  }, [hackathons]);

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {sortedGroups.map(({ label, items }) => (
        <div key={label} className="space-y-4">
          {/* Month Header Pill */}
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider shadow-sm">
              {label}
            </span>
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {items.length} Hackathon{items.length > 1 ? "s" : ""}
            </span>
            <div className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Timeline Stacked Cards */}
          <div className="pl-4 sm:pl-6 border-l-2 border-black dark:border-white space-y-4 ml-3">
            {items.map((hack, index) => {
              const isBookmarked = bookmarkedIds.has(hack.id);

              return (
                <motion.div
                  key={hack.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                  whileHover={{ y: -3, scale: 1.005 }}
                  onClick={() => onSelect(hack)}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-500 rounded-2xl p-5 cursor-pointer relative group space-y-3 shadow-sm transition-colors"
                >
                  {/* Timeline node */}
                  <div className="absolute -left-[23px] sm:-left-[31px] top-6 w-3 h-3 rounded-full bg-black dark:bg-white transition-transform group-hover:scale-125" />

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
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(hack.id);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isBookmarked
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                        title={isBookmarked ? "Remove from Shortlist" : "Save to Shortlist"}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isBookmarked ? "fill-current" : ""
                          }`}
                        />
                      </motion.button>

                      <a
                        href={hack.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
                        title="Open external website"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
