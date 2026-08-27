"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Bell, Mail, Loader2, CheckCircle2, Send, Sparkles } from "lucide-react";

export const NewsletterBanner: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.8 },
            colors: ["#10b981", "#3b82f6", "#f59e0b", "#ffffff"],
          });
        } catch {}
      } else {
        setErrorMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-12 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-black text-white p-8 sm:p-12 border border-neutral-800 shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Bell className="w-3.5 h-3.5" />
                <span>Radar Alert Newsletter</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-brand tracking-tight text-white">
                Never Miss a Hackathon Again.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
                Subscribe to get the **live list of ongoing hackathons** sent to your email instantly, plus **24-hour advance alerts** before upcoming competitions start across Devfolio, DoraHacks, MLH, and Unstop.
              </p>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-5">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    You're Subscribed! 🎉
                  </h3>
                  <p className="text-xs text-neutral-300">
                    Check your inbox! We've sent you the live ongoing hackathons list.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-3 rounded-full bg-neutral-900 border border-neutral-700 text-white placeholder:text-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-neutral-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Get Alerts</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-rose-400 pl-2 font-medium">
                      {errorMessage}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-neutral-400 pl-2">
                    <span>✓ Live digest instantly</span>
                    <span>✓ 24h advance reminder</span>
                    <span>✓ Zero spam</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
