"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Trophy,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { NormalizedHackathon } from "@/types/hackathon";
import { getHackathonStatus } from "@/lib/utils";

interface HackathonCardProps {
  hackathon: NormalizedHackathon;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelect: (h: NormalizedHackathon) => void;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  isBookmarked,
  onToggleBookmark,
  onSelect,
}) => {
  const [imgSrc, setImgSrc] = useState(hackathon.imageUrl);
  const statusInfo = getHackathonStatus(hackathon.startDate, hackathon.endDate);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(hackathon.id);
  };

  const handleImageError = () => {
    setImgSrc(
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60"
    );
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{
        y: -6,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onSelect(hackathon)}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-400 rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-colors duration-200 will-change-transform"
    >
      <div>
        {/* Image Container with Fallback & Ambient Background */}
        <div className="relative w-full h-48 bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
          <Image
            src={imgSrc}
            alt={hackathon.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
            onError={handleImageError}
            className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />

          {/* Ambient Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black uppercase shadow-sm">
                {hackathon.platform}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-black shadow-sm">
                {hackathon.mode}
              </span>
            </div>

            {/* Bookmark button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              type="button"
              onClick={handleBookmarkClick}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                isBookmarked
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                  : "bg-white/90 text-black hover:bg-white"
              }`}
              title={isBookmarked ? "Remove from Shortlist" : "Save to Shortlist"}
            >
              <Bookmark className={`w-4 h-4 transition-transform duration-200 ${isBookmarked ? "fill-current scale-110" : ""}`} />
            </motion.button>
          </div>

          {/* Bottom Left Status Badge (Ongoing / Upcoming / Completed) */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
            {statusInfo.status === "ongoing" ? (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>Ongoing {statusInfo.detailLabel !== "Ongoing" ? `• ${statusInfo.detailLabel}` : ""}</span>
              </span>
            ) : statusInfo.status === "upcoming" ? (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/85 text-white dark:bg-white dark:text-black shadow-md backdrop-blur-sm">
                Upcoming {statusInfo.detailLabel && statusInfo.detailLabel !== "Upcoming" && statusInfo.detailLabel !== "TBA" ? `• ${statusInfo.detailLabel}` : ""}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-neutral-900/90 text-neutral-300 border border-neutral-700 shadow-md backdrop-blur-sm">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{hackathon.displayDates}</span>
            </span>
            <span className="flex items-center gap-1 truncate max-w-[140px]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{hackathon.location || "Global"}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-black dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 line-clamp-1 leading-snug transition-colors">
            {hackathon.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
            {hackathon.shortDescription}
          </p>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {hackathon.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 mt-2 pt-4">
        {hackathon.prizePool ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
            <Trophy className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="truncate max-w-[130px]">{hackathon.prizePool}</span>
          </div>
        ) : (
          <span className="text-xs text-neutral-400">Free Registration</span>
        )}

        <div className="flex items-center gap-2">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={hackathon.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs transition-colors shadow-sm ${
              statusInfo.status === "completed"
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
            }`}
          >
            <span>{statusInfo.status === "completed" ? "View Archive" : "Register"}</span>
            <ExternalLink className="w-3 h-3" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};
