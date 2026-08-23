import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HackathonMode, PlatformType } from "@/types/hackathon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPlatformBadgeStyle(platform: PlatformType): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (platform) {
    case "devfolio":
      return {
        bg: "bg-[#efefef] dark:bg-[#1f1f1f]",
        text: "text-[#000000] dark:text-[#ffffff]",
        border: "border-[#e2e2e2] dark:border-[#333333]",
        label: "Devfolio",
      };
    case "dorahacks":
      return {
        bg: "bg-[#efefef] dark:bg-[#1f1f1f]",
        text: "text-[#000000] dark:text-[#ffffff]",
        border: "border-[#e2e2e2] dark:border-[#333333]",
        label: "DoraHacks",
      };
    case "mlh":
      return {
        bg: "bg-[#efefef] dark:bg-[#1f1f1f]",
        text: "text-[#000000] dark:text-[#ffffff]",
        border: "border-[#e2e2e2] dark:border-[#333333]",
        label: "MLH",
      };
    case "unstop":
      return {
        bg: "bg-[#efefef] dark:bg-[#1f1f1f]",
        text: "text-[#000000] dark:text-[#ffffff]",
        border: "border-[#e2e2e2] dark:border-[#333333]",
        label: "Unstop",
      };
    case "wemakedevs":
      return {
        bg: "bg-[#efefef] dark:bg-[#1f1f1f]",
        text: "text-[#000000] dark:text-[#ffffff]",
        border: "border-[#e2e2e2] dark:border-[#333333]",
        label: "WeMakeDevs",
      };
  }
}

export function getModeBadgeStyle(mode: HackathonMode): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (mode) {
    case "Online":
      return {
        bg: "bg-[#efefef] dark:bg-[#1f1f1f]",
        text: "text-[#000000] dark:text-[#ffffff]",
        border: "border-[#e2e2e2] dark:border-[#333333]",
        dot: "bg-[#000000] dark:bg-[#ffffff]",
      };
    case "In-Person":
      return {
        bg: "bg-[#efefef] dark:bg-[#1f1f1f]",
        text: "text-[#000000] dark:text-[#ffffff]",
        border: "border-[#e2e2e2] dark:border-[#333333]",
        dot: "bg-[#5e5e5e] dark:bg-[#afafaf]",
      };
    case "Hybrid":
      return {
        bg: "bg-[#efefef] dark:bg-[#1f1f1f]",
        text: "text-[#000000] dark:text-[#ffffff]",
        border: "border-[#e2e2e2] dark:border-[#333333]",
        dot: "bg-[#000000] dark:bg-[#ffffff]",
      };
  }
}

export function formatEventDates(startDateStr?: string | null, endDateStr?: string | null): string {
  if (!startDateStr && !endDateStr) return "TBA / Open";
  if (startDateStr && !endDateStr) return startDateStr;
  if (!startDateStr && endDateStr) return `Until ${endDateStr}`;

  if (startDateStr === endDateStr) return startDateStr || "TBA";

  return `${startDateStr} – ${endDateStr}`;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Robust date parser supporting ISO, "Month Day, Year", "Month Day", "Month Year", and single day offsets.
 */
export function parseHackathonDate(
  dateStr?: string | null,
  fallbackMonth?: number,
  fallbackYear?: number
): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // 1. Try standard ISO or new Date parse if it contains standard separators
  const directDate = new Date(trimmed);
  if (!isNaN(directDate.getTime()) && (trimmed.includes("-") || trimmed.includes("/") || trimmed.includes(","))) {
    return directDate;
  }

  const currentYear = fallbackYear || new Date().getFullYear();

  // 2. If just a day number like "30" or "6"
  if (/^\d{1,2}$/.test(trimmed) && fallbackMonth !== undefined) {
    const day = parseInt(trimmed, 10);
    return new Date(currentYear, fallbackMonth, day, 23, 59, 59);
  }

  // 3. If "21, 2025" or "18, 2022"
  const dayYearMatch = trimmed.match(/^(\d{1,2}),?\s*(\d{4})$/);
  if (dayYearMatch && fallbackMonth !== undefined) {
    const day = parseInt(dayYearMatch[1], 10);
    const year = parseInt(dayYearMatch[2], 10);
    return new Date(year, fallbackMonth, day, 23, 59, 59);
  }

  // 4. Month words like "Aug 24", "Sep 1", "February 2026", "Dec 15"
  const monthMatch = trimmed.match(/([a-zA-Z]+)\s*(\d{1,2})?(?:,?\s*(\d{4}))?/);
  if (monthMatch) {
    const monthKey = monthMatch[1].toLowerCase();
    if (MONTH_MAP[monthKey] !== undefined) {
      const month = MONTH_MAP[monthKey];
      const day = monthMatch[2] ? parseInt(monthMatch[2], 10) : 1;
      const year = monthMatch[3] ? parseInt(monthMatch[3], 10) : currentYear;
      return new Date(year, month, day, 0, 0, 0);
    }
  }

  return isNaN(directDate.getTime()) ? null : directDate;
}

export type HackathonStatus = "ongoing" | "upcoming" | "completed";

export interface HackathonStatusResult {
  status: HackathonStatus;
  badgeLabel: "Ongoing" | "Upcoming" | "Completed";
  detailLabel: string;
  isUrgent: boolean;
}

/**
 * Calculates whether a hackathon is Ongoing, Upcoming, or Completed based on start and end dates.
 */
export function getHackathonStatus(
  startDateStr?: string | null,
  endDateStr?: string | null
): HackathonStatusResult {
  const now = new Date();
  const startDate = parseHackathonDate(startDateStr);
  const startMonth = startDate ? startDate.getMonth() : undefined;
  const startYear = startDate ? startDate.getFullYear() : undefined;
  const endDate = parseHackathonDate(endDateStr, startMonth, startYear);

  if (endDate) {
    endDate.setHours(23, 59, 59, 999);
  }

  // 1. Both start and end dates available
  if (startDate && endDate) {
    if (now > endDate) {
      return {
        status: "completed",
        badgeLabel: "Completed",
        detailLabel: "Completed",
        isUrgent: false,
      };
    }
    if (now >= startDate && now <= endDate) {
      const diffMs = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        status: "ongoing",
        badgeLabel: "Ongoing",
        detailLabel: diffDays <= 1 ? "Ends Today" : `Ends in ${diffDays}d`,
        isUrgent: true,
      };
    }
    if (now < startDate) {
      const diffMs = startDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      let detailLabel = `In ${diffDays}d`;
      if (diffDays === 1) detailLabel = "Starts Tomorrow";
      else if (diffDays === 0) detailLabel = "Starts Today";
      else if (diffDays > 30) detailLabel = `In ~${Math.round(diffDays / 30)}mo`;

      return {
        status: "upcoming",
        badgeLabel: "Upcoming",
        detailLabel,
        isUrgent: diffDays <= 3,
      };
    }
  }

  // 2. Only start date available
  if (startDate && !endDate) {
    const diffMs = startDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // If start date was more than 2 days ago, consider completed
    if (diffDays < -2) {
      return {
        status: "completed",
        badgeLabel: "Completed",
        detailLabel: "Completed",
        isUrgent: false,
      };
    }
    // If started today or yesterday, consider ongoing
    if (diffDays >= -2 && diffDays <= 0) {
      return {
        status: "ongoing",
        badgeLabel: "Ongoing",
        detailLabel: "Ongoing",
        isUrgent: true,
      };
    }
    // Future
    let detailLabel = `In ${diffDays}d`;
    if (diffDays === 1) detailLabel = "Starts Tomorrow";
    else if (diffDays > 30) detailLabel = `In ~${Math.round(diffDays / 30)}mo`;

    return {
      status: "upcoming",
      badgeLabel: "Upcoming",
      detailLabel,
      isUrgent: diffDays <= 3,
    };
  }

  // 3. Only end date available
  if (!startDate && endDate) {
    if (now > endDate) {
      return {
        status: "completed",
        badgeLabel: "Completed",
        detailLabel: "Completed",
        isUrgent: false,
      };
    }
    return {
      status: "ongoing",
      badgeLabel: "Ongoing",
      detailLabel: "Ends Soon",
      isUrgent: true,
    };
  }

  // 4. No dates
  return {
    status: "upcoming",
    badgeLabel: "Upcoming",
    detailLabel: "TBA",
    isUrgent: false,
  };
}

export function extractTagsFromText(text: string, title: string): string[] {
  const combined = `${title} ${text}`.toLowerCase();
  const foundTags = new Set<string>();

  const tagPatterns: Record<string, RegExp> = {
    "AI & ML": /\b(ai|artificial intelligence|machine learning|genai|llm|deep learning|agentic|agents|chatgpt|claude|gemini)\b/i,
    "Web3 & Crypto": /\b(web3|crypto|ethereum|eth|blockchain|defi|solana|smart contract|nft|token|rwa|decentralized)\b/i,
    "Full Stack & Web": /\b(full stack|frontend|backend|react|nextjs|python|javascript|typescript|web app|django|api)\b/i,
    "Open Source": /\b(open source|opensource|github|git|community)\b/i,
    "Fintech": /\b(finance|fintech|trading|market|prediction|payments|defi|quant)\b/i,
    "IoT & Hardware": /\b(hardware|iot|robotics|embedded|sensors|automation|smart city)\b/i,
    "Cybersecurity": /\b(cybersecurity|security|infosec|privacy|compliance|risk)\b/i,
    "Student & Beginner": /\b(student|acm|university|college|beginner|ieee|vit|iit|fiem|uem)\b/i,
    "Healthcare & Bio": /\b(health|biotech|biology|medical|bioinformatics)\b/i,
    "Gaming & Metaverse": /\b(gaming|metaverse|game dev|virtual world|ar\/vr)\b/i,
  };

  for (const [tag, regex] of Object.entries(tagPatterns)) {
    if (regex.test(combined)) {
      foundTags.add(tag);
    }
  }

  if (foundTags.size === 0) {
    foundTags.add("General");
    foundTags.add("Hackathon");
  }

  return Array.from(foundTags).slice(0, 5);
}

export function extractPrizePool(text?: string): string | undefined {
  if (!text) return undefined;

  const prizePatterns = [
    /(\$\s*[\d,]+(?:\.\d+)?(?:\s*(?:USD|k|K|M|in prizes|total prizes|prize pool))?)/i,
    /(₹\s*[\d,]+(?:\s*(?:Lakh|Crore|INR|in prizes|total prizes|prize pool))?)/i,
    /((?:USD|INR)\s*[\d,]+)/i,
    /([\d,]+\s*(?:USDT|USDC|ETH|SOL|Bounties))/i,
    /(MacBook\s*Pro|NVIDIA\s*DGX|MacBook\s*Air|iPad\s*Air|iPhone\s*16)/i,
  ];

  for (const pattern of prizePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

export function cleanDescription(rawDesc?: string): { short: string; full: string } {
  if (!rawDesc) {
    return {
      short: "Join fellow builders, submit your project, and compete for category bounties and prizes.",
      full: "Join fellow builders, submit your project, and compete for category bounties and prizes.",
    };
  }

  let cleaned = rawDesc
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  let short = cleaned;
  if (short.length > 140) {
    short = short.slice(0, 137) + "...";
  }

  return {
    short,
    full: cleaned,
  };
}
