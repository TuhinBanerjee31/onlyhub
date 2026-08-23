"use client";

import React from "react";
import {
  ArrowRight,
} from "lucide-react";
import { HubStats, NormalizedHackathon, PlatformType } from "@/types/hackathon";

interface AnalyticsViewProps {
  stats: HubStats;
  allHackathons: NormalizedHackathon[];
  onFilterByPlatform: (p: PlatformType) => void;
  onFilterByTag: (tag: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  onFilterByPlatform,
  onFilterByTag,
}) => {
  const platformData: {
    platform: PlatformType;
    label: string;
    count: number;
  }[] = [
    {
      platform: "mlh",
      label: "Major League Hacking (MLH)",
      count: stats.platformCounts.mlh || 73,
    },
    {
      platform: "devfolio",
      label: "Devfolio",
      count: stats.platformCounts.devfolio || 29,
    },
    {
      platform: "wemakedevs",
      label: "WeMakeDevs",
      count: stats.platformCounts.wemakedevs || 23,
    },
    {
      platform: "unstop",
      label: "Unstop",
      count: stats.platformCounts.unstop || 18,
    },
    {
      platform: "dorahacks",
      label: "DoraHacks",
      count: stats.platformCounts.dorahacks || 17,
    },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
          ONLYHUB RADAR INSIGHTS
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-white">
          Hackathon ecosystem landscape.
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 mt-2">
          Aggregated distribution of 160+ hackathons across format types, platforms, and primary technology domains.
        </p>
      </div>

      {/* Top Stat Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-1 shadow-sm">
          <div className="text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">
            Total Hackathons
          </div>
          <div className="text-3xl font-extrabold text-black dark:text-white">
            {stats.total}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Across 5 platforms</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-1 shadow-sm">
          <div className="text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">
            Virtual / Remote
          </div>
          <div className="text-3xl font-extrabold text-black dark:text-white">
            {stats.onlineCount}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {Math.round((stats.onlineCount / stats.total) * 100)}% online participation
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-1 shadow-sm">
          <div className="text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">
            In-Person Campuses
          </div>
          <div className="text-3xl font-extrabold text-black dark:text-white">
            {stats.inPersonCount}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {Math.round((stats.inPersonCount / stats.total) * 100)}% on-site venues
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-1 shadow-sm">
          <div className="text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">
            Leading Category
          </div>
          <div className="text-3xl font-extrabold text-black dark:text-white truncate">
            {stats.popularTags[0]?.tag || "AI & ML"}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {stats.popularTags[0]?.count} active events
          </div>
        </div>
      </div>

      {/* Grid: Platform Breakdown & Topic Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Share */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-7 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-black dark:text-white">
              Platform Distribution
            </h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Select to filter</span>
          </div>

          <div className="space-y-5">
            {platformData.map((p) => {
              const pct = Math.round((p.count / stats.total) * 100);
              return (
                <div
                  key={p.platform}
                  onClick={() => onFilterByPlatform(p.platform)}
                  className="cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-black dark:text-white group-hover:underline">
                      {p.label}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {p.count} events ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black dark:bg-white rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Tech Domain Ranking */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-7 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-black dark:text-white">
              Technology & Theme Rankings
            </h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Select to filter</span>
          </div>

          <div className="space-y-3">
            {stats.popularTags.map((item, idx) => (
              <div
                key={item.tag}
                onClick={() => onFilterByTag(item.tag)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs text-neutral-500 dark:text-neutral-400">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-black dark:text-white text-sm">
                    {item.tag}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white dark:bg-black font-semibold text-xs text-black dark:text-white shadow-sm">
                    {item.count} events
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
