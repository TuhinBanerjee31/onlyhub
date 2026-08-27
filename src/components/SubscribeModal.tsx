"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  X,
  Mail,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Zap,
} from "lucide-react";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setIsSuccess(false);
    setSuccessMsg("");
    setErrorMessage(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b", "#ffffff", "#000000"],
      });
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setSuccessMsg(
          data.message || "Subscribed! Ongoing hackathons sent to your email."
        );
        triggerConfetti();
      } else {
        setErrorMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Network error. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-black dark:text-white my-auto"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="px-6 sm:px-8 pt-7 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                <Bell className="w-3.5 h-3.5" />
                <span>Radar Alerts</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight text-black dark:text-white">
                Never Miss a Hackathon
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                Subscribe to get the **full list of ongoing hackathons** emailed instantly, plus **24-hour advance alerts** before upcoming competitions start.
              </p>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-5"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      You're On The Radar! 🚀
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-sm mx-auto leading-relaxed">
                      {successMsg} We'll also alert you 24 hours before new hackathons kick off.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
                    >
                      Got It, Thanks!
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  {/* Highlights Pill */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-3.5 space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-2 font-medium">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>Instant Digest:</strong> Live ongoing competitions right now</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Bell className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span><strong>24h Countdown:</strong> Reminder before upcoming start dates</span>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Your Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 text-black dark:text-white placeholder:text-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-md cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Subscribing & Sending Digest...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Subscribe for Alerts</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  <p className="text-[11px] text-center text-neutral-400 dark:text-neutral-500 pt-1">
                    No spam ever. Unsubscribe with 1-click anytime.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
