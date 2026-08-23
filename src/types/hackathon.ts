export type PlatformType = "devfolio" | "dorahacks" | "mlh" | "unstop" | "wemakedevs";

export type HackathonMode = "Online" | "In-Person" | "Hybrid";

export type ApplicationStage =
  | "Bookmarked"
  | "Applying"
  | "Applied"
  | "Shortlisted"
  | "Attending"
  | "Completed";

export type HackathonStatus = "ongoing" | "upcoming" | "completed";

export interface NormalizedHackathon {
  id: string;
  title: string;
  platform: PlatformType;
  mode: HackathonMode;
  startDate: string | null;
  endDate: string | null;
  displayDates: string;
  imageUrl: string;
  url: string;
  description: string;
  shortDescription: string;
  tags: string[];
  prizePool?: string;
  location?: string;
  organizer?: string;
  status: HackathonStatus;
  featured?: boolean;
}

export interface UserBookmark {
  hackathonId: string;
  savedAt: string;
  stage: ApplicationStage;
  notes?: string;
}

export interface FilterOptions {
  search: string;
  platform: PlatformType | "all";
  mode: HackathonMode | "all";
  status: HackathonStatus | "all";
  tag: string | "all";
  sortBy: "date-asc" | "date-desc" | "title-asc" | "relevance";
}

export interface HubStats {
  total: number;
  onlineCount: number;
  inPersonCount: number;
  upcomingCount: number;
  ongoingCount: number;
  completedCount: number;
  platformCounts: Record<PlatformType, number>;
  popularTags: { tag: string; count: number }[];
}

// Raw Data Types
export interface RawDevfolioHackathon {
  title?: string;
  image_url?: string;
  hackathon_url?: string;
  product_page_url?: string;
  description?: string;
  mode?: string;
  start_date?: string;
  end_date?: string;
}

export interface RawDoraHacksHackathon {
  title?: string;
  image_url?: string;
  hackathon_url?: string;
  product_page_url?: string;
  description?: string;
  mode?: string;
  start_date?: string;
  end_date?: string;
}

export interface RawMLHHackathon {
  title?: string;
  image_url?: string;
  hackathon_url?: string;
  mode?: string;
  start_date?: string;
  end_date?: string;
}

export interface RawMLHWrapper {
  hackathons?: RawMLHHackathon[];
  input?: { url?: string };
}

export interface RawUnstopHackathon {
  title?: string;
  image_url?: string;
  hackathon_url?: string;
  product_page_url?: string;
  description?: string;
  mode?: string;
  start_date?: string;
  end_date?: string;
}

export interface RawWeMakeDevsHackathon {
  title?: string;
  image_url?: string;
  hackathon_url?: string;
  description?: string;
  mode?: string;
  start_date?: string;
  end_date?: string;
}

export interface RawWeMakeDevsWrapper {
  hackathons?: RawWeMakeDevsHackathon[];
  input?: { url?: string };
}
