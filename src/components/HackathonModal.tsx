"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  MapPin,
  Trophy,
  ExternalLink,
  Bookmark,
  Share2,
  CalendarPlus,
} from "lucide-react";
import { NormalizedHackathon } from "@/types/hackathon";
import { getHackathonStatus } from "@/lib/utils";

interface HackathonModalProps {
  hackathon: NormalizedHackathon | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export const HackathonModal: React.FC<HackathonModalProps> = ({
  hackathon,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState(hackathon?.imageUrl || "");

  const statusInfo = hackathon
    ? getHackathonStatus(hackathon.startDate, hackathon.endDate)
    : null;

  const generateGoogleCalendarUrl = () => {
    if (!hackathon) return "";
    const title = encodeURIComponent(hackathon.title);
    const details = encodeURIComponent(
      `${hackathon.shortDescription}\n\nOfficial Link: ${hackathon.url}`
    );
    const location = encodeURIComponent(hackathon.location || hackathon.mode);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const downloadIcsFile = () => {
    if (!hackathon) return;
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//onlyhub//Hackathon Event//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${hackathon.title}`,
      `DESCRIPTION:${hackathon.shortDescription} - ${hackathon.url}`,
      `LOCATION:${hackathon.location || hackathon.mode}`,
      `URL:${hackathon.url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${hackathon.title.replace(/[^a-z0-9]/gi, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (!hackathon) return;
    navigator.clipboard.writeText(window.location.origin + "?hackathon=" + hackathon.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && hackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Surface */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 350, damping: 30 },
            }}
            exit={{ scale: 0.94, opacity: 0, y: 20, transition: { duration: 0.15 } }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col z-10 my-auto"
          >
            {/* Banner Frame */}
            <div className="relative w-full h-52 sm:h-60 bg-neutral-100 dark:bg-neutral-800 shrink-0 overflow-hidden">
              <Image
                src={imgSrc || hackathon.imageUrl}
                alt={hackathon.title}
                fill
                unoptimized
                onError={() =>
                  setImgSrc(
                    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60"
                  )
                }
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors z-20 shadow-md"
              >
                <X className="w-4 h-4" />
              </motion.button>

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black uppercase shadow-sm">
                  {hackathon.platform}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-black shadow-sm">
                  {hackathon.mode}
                </span>
                {statusInfo && statusInfo.status === "ongoing" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>Ongoing</span>
                  </span>
                ) : statusInfo && statusInfo.status === "completed" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 shadow-sm">
                    Completed
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-black shadow-sm">
                    Upcoming
                  </span>
                )}
              </div>

              {/* Title & Dates Over Bottom */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {hackathon.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-white/90">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {hackathon.displayDates}
                  </span>
                  {hackathon.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {hackathon.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-black dark:text-white">
              {/* Prize pool banner */}
              {hackathon.prizePool && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-black dark:text-white" />
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Prize Pool & Bounties
                      </div>
                      <div className="text-base font-extrabold">{hackathon.prizePool}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Facts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase block">
                    Platform
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white capitalize">
                    {hackathon.platform}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase block">
                    Organizer
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white truncate block">
                    {hackathon.organizer || "Community Organizer"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase block">
                    Format
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white">
                    {hackathon.mode} ({hackathon.location || "Global"})
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Focus Tracks & Themes
                </div>
                <div className="flex flex-wrap gap-2">
                  {hackathon.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  About This Event
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-line text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl">
                  {hackathon.description}
                </div>
              </div>

              {/* Calendar export links */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Add to calendar:
                </span>
                <a
                  href={generateGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Google Calendar</span>
                </a>
                <button
                  type="button"
                  onClick={downloadIcsFile}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>iCal / Apple (.ics)</span>
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => onToggleBookmark(hackathon.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold transition-colors ${
                    isBookmarked
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                      : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                  <span>{isBookmarked ? "Saved" : "Save"}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white text-xs font-semibold transition-colors"
                  title="Copy share link"
                >
                  {copied ? (
                    <span className="font-semibold text-emerald-500">Copied!</span>
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </motion.button>
              </div>

              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href={hackathon.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-bold text-xs shadow-md transition-opacity"
              >
                <span>{statusInfo?.status === "completed" ? "View Archive" : "Register on official portal"}</span>
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
