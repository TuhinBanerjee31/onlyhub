"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bookmark,
  Trash2,
  Download,
  Calendar,
  FileText,
  ChevronDown,
} from "lucide-react";
import {
  ApplicationStage,
  NormalizedHackathon,
  UserBookmark,
} from "@/types/hackathon";

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: UserBookmark[];
  allHackathons: NormalizedHackathon[];
  onRemoveBookmark: (id: string) => void;
  onUpdateStage: (id: string, stage: ApplicationStage) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onSelectHackathon: (h: NormalizedHackathon) => void;
}

const STAGES: ApplicationStage[] = [
  "Bookmarked",
  "Applying",
  "Applied",
  "Shortlisted",
  "Attending",
  "Completed",
];

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  allHackathons,
  onRemoveBookmark,
  onUpdateStage,
  onUpdateNotes,
  onSelectHackathon,
}) => {
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);

  const hackathonMap = new Map(allHackathons.map((h) => [h.id, h]));

  const handleExportCSV = () => {
    if (bookmarks.length === 0) return;

    const headers = [
      "Hackathon Title",
      "Platform",
      "Mode",
      "Dates",
      "Location",
      "Application Stage",
      "Notes",
      "URL",
    ];

    const rows = [
      headers,
      ...bookmarks.map((b) => {
        const h = hackathonMap.get(b.hackathonId);
        return [
          `"${h?.title || ""}"`,
          `"${h?.platform || ""}"`,
          `"${h?.mode || ""}"`,
          `"${h?.displayDates || ""}"`,
          `"${h?.location || ""}"`,
          `"${b.stage}"`,
          `"${(b.notes || "").replace(/"/g, '""')}"`,
          `"${h?.url || ""}"`,
        ];
      }),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `onlyhub_shortlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{
              x: 0,
              transition: { type: "spring", stiffness: 350, damping: 32 },
            }}
            exit={{ x: "100%", transition: { duration: 0.2 } }}
            className="relative w-screen max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col z-10 h-full"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  My Shortlist
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {bookmarks.length} Saved Event{bookmarks.length !== 1 ? "s" : ""}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* List Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {bookmarks.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-black dark:text-white">
                    No hackathons bookmarked yet
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Click the bookmark icon on any hackathon card to save and track it here.
                  </p>
                </div>
              ) : (
                bookmarks.map((b) => {
                  const h = hackathonMap.get(b.hackathonId);
                  if (!h) return null;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={b.hackathonId}
                      className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 space-y-3 border border-neutral-200 dark:border-neutral-700/50 shadow-sm"
                    >
                      {/* Top Row: Title & Remove */}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          onClick={() => {
                            onSelectHackathon(h);
                            onClose();
                          }}
                          className="cursor-pointer flex-1"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-0.5">
                            {h.platform}
                          </span>
                          <h4 className="font-bold text-sm text-black dark:text-white hover:underline line-clamp-1">
                            {h.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{h.displayDates}</span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          type="button"
                          onClick={() => onRemoveBookmark(b.hackathonId)}
                          className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Stage Selector */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1.5">
                          Application Status
                        </label>
                        <div className="relative">
                          <select
                            value={b.stage}
                            onChange={(e) =>
                              onUpdateStage(b.hackathonId, e.target.value as ApplicationStage)
                            }
                            className="w-full text-xs font-semibold py-2.5 pl-3.5 pr-9 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none appearance-none cursor-pointer shadow-sm"
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s} className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Notes Field */}
                      <div>
                        {editingNotesId === b.hackathonId ? (
                          <textarea
                            defaultValue={b.notes || ""}
                            onBlur={(e) => {
                              onUpdateNotes(b.hackathonId, e.target.value);
                              setEditingNotesId(null);
                            }}
                            placeholder="Add notes: teammates, pitch ideas, deadlines..."
                            rows={2}
                            autoFocus
                            className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(b.hackathonId)}
                            className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-between"
                          >
                            <span className="truncate">
                              {b.notes || "+ Add application notes"}
                            </span>
                            <FileText className="w-3 h-3 shrink-0 ml-1 opacity-60" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer: Export CSV */}
            {bookmarks.length > 0 && (
              <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full py-3 px-4 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Shortlist to CSV</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
