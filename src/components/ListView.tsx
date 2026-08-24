"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  ExternalLink,
  Calendar,
  MapPin,
  Trophy,
} from "lucide-react";
import { NormalizedHackathon } from "@/types/hackathon";
import { getHackathonStatus } from "@/lib/utils";

interface ListViewProps {
  hackathons: NormalizedHackathon[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onSelect: (h: NormalizedHackathon) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  hackathons,
  bookmarkedIds,
  onToggleBookmark,
  onSelect,
}) => {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-black dark:text-white border-collapse">
          <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px] font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              <th className="py-4 px-6 font-bold w-[34%]">Hackathon</th>
              <th className="py-4 px-4 font-bold w-[12%]">Platform</th>
              <th className="py-4 px-4 font-bold w-[12%]">Status</th>
              <th className="py-4 px-4 font-bold w-[16%]">Timeline</th>
              <th className="py-4 px-4 font-bold w-[12%]">Location</th>
              <th className="py-4 px-4 font-bold w-[10%]">Rewards</th>
              <th className="py-4 px-6 text-right font-bold w-[8%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {hackathons.map((hack, index) => {
              const isBookmarked = bookmarkedIds.has(hack.id);
              const statusInfo = getHackathonStatus(hack.startDate, hack.endDate);

              return (
                <motion.tr
                  key={hack.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                  onClick={() => onSelect(hack)}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors group"
                >
                  {/* Hackathon title & chips */}
                  <td className="py-4 px-6 align-middle">
                    <div className="font-bold text-sm sm:text-base text-black dark:text-white line-clamp-2 group-hover:underline leading-snug">
                      {hack.title}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {hack.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-4 px-4 whitespace-nowrap align-middle">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white uppercase border border-neutral-200 dark:border-neutral-700">
                      {hack.platform}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 whitespace-nowrap align-middle">
                    {statusInfo.status === "ongoing" ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1.5 w-fit shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Ongoing</span>
                      </span>
                    ) : statusInfo.status === "upcoming" ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 w-fit">
                        Upcoming
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 w-fit">
                        Completed
                      </span>
                    )}
                  </td>

                  {/* Dates */}
                  <td className="py-4 px-4 whitespace-nowrap align-middle text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{hack.displayDates}</span>
                    </div>
                  </td>

                  {/* Location & Format */}
                  <td className="py-4 px-4 whitespace-nowrap align-middle text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="truncate max-w-[120px]">{hack.location || "Global"}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{hack.mode}</div>
                  </td>

                  {/* Rewards */}
                  <td className="py-4 px-4 whitespace-nowrap align-middle text-xs font-semibold text-black dark:text-white">
                    {hack.prizePool ? (
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>{hack.prizePool}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 font-normal">Perks & Swag</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right whitespace-nowrap align-middle">
                    <div className="flex items-center justify-end gap-2">
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
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
