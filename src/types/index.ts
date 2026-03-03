export type ProspectStatus =
  | "new"
  | "contacted"
  | "replied"
  | "qualified"
  | "closed"
  | "lost";

export type MessageStatus = "none" | "pending" | "ready";

export interface Prospect {
  id: number;
  username: string;
  name: string | null;
  bio: string | null;
  followers: number | null;
  email: string | null;
  website: string | null;
  lastPost: string | null;
  source: string | null;
  status: ProspectStatus;
  messageStatus: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  prospectId: number;
  content: string;
  editedContent: string | null;
  generatedAt: string;
}

export interface SearchConfig {
  id: number;
  name: string;
  hashtags: string | null;
  targetProfiles: string | null;
  bioKeywords: string | null;
  location: string | null;
  createdAt: string;
}

export interface SearchCriteria {
  hashtags?: string[];
  targetProfiles?: string[];
  bioKeywords?: string[];
}

export interface CollectResponse {
  success: boolean;
  collected: number;
  new: number;
  duplicates: number;
}
