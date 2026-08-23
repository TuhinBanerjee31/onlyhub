"use client";

import React, { useState } from "react";
import {
  X,
  Bookmark,
  Trash2,
  Download,
  Calendar,
  FileText,
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

  if (!isOpen) return null;

  const hackathonMap = new Map(allHackathons.map((h) => [h.id, h]));

  const handleExportCSV = () => {
    const rows = [
      ["Title", "Platform", "Mode", "Dates", "Location", "Stage", "Notes", "URL"],
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col">
          
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

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
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
                  <div
                    key={b.hackathonId}
                    className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 space-y-3"
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

                      <button
                        type="button"
                        onClick={() => onRemoveBookmark(b.hackathonId)}
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stage Selector */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                        Application Status
                      </label>
                      <select
                        value={b.stage}
                        onChange={(e) =>
                          onUpdateStage(b.hackathonId, e.target.value as ApplicationStage)
                        }
                        className="w-full text-xs font-medium p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s} className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                            {s}
                          </option>
                        ))}
                      </select>
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
                          className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingNotesId(b.hackathonId)}
                          className="text-xs text-neutral-600 dark:text-neutral-300 p-2.5 rounded-lg bg-white/70 dark:bg-neutral-900/70 border border-dashed border-neutral-300 dark:border-neutral-700 cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                        >
                          {b.notes ? (
                            <span>{b.notes}</span>
                          ) : (
                            <span className="italic text-neutral-400 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Add notes...
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {bookmarks.length > 0 && (
            <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
