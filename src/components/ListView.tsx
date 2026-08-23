"use client";

import React from "react";
import {
  Bookmark,
  ExternalLink,
  Calendar,
  MapPin,
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
        <table className="w-full text-left text-sm text-black dark:text-white">
          <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              <th className="py-4 px-6 font-semibold">Hackathon</th>
              <th className="py-4 px-4 font-semibold">Platform</th>
              <th className="py-4 px-4 font-semibold">Status</th>
              <th className="py-4 px-4 font-semibold">Timeline</th>
              <th className="py-4 px-4 font-semibold">Location</th>
              <th className="py-4 px-4 font-semibold">Rewards</th>
              <th className="py-4 px-6 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {hackathons.map((hack) => {
              const isBookmarked = bookmarkedIds.has(hack.id);
              const statusInfo = getHackathonStatus(hack.startDate, hack.endDate);

              return (
                <tr
                  key={hack.id}
                  onClick={() => onSelect(hack)}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors"
                >
                  {/* Hackathon title & chips */}
                  <td className="py-4 px-6 max-w-[280px]">
                    <div className="font-bold text-sm sm:text-base text-black dark:text-white line-clamp-1 hover:underline">
                      {hack.title}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hack.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white uppercase border border-neutral-200 dark:border-neutral-700">
                      {hack.platform}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
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

                  {/* Timeline */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-black dark:text-white font-medium">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{hack.displayDates}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4 max-w-[150px] truncate text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{hack.location || "Global"}</span>
                    </div>
                  </td>

                  {/* Rewards */}
                  <td className="py-4 px-4 whitespace-nowrap text-xs">
                    {hack.prizePool ? (
                      <span className="font-semibold text-black dark:text-white">
                        {hack.prizePool}
                      </span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
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
                        title="Bookmark"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                      </button>

                      <a
                        href={hack.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-semibold text-xs transition-all shadow-sm"
                      >
                        <span>{statusInfo.status === "completed" ? "Archive" : "Apply"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
