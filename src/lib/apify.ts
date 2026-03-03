import type { SearchCriteria } from "@/types";

const APIFY_BASE_URL = "https://api.apify.com/v2";

interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    defaultDatasetId: string;
  };
}

interface ApifyProfileResult {
  username?: string;
  fullName?: string;
  biography?: string;
  followersCount?: number;
  email?: string;
  externalUrl?: string;
  latestPosts?: Array<{ caption?: string }>;
}

export async function runInstagramScraper(
  criteria: SearchCriteria
): Promise<ApifyProfileResult[]> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey) throw new Error("APIFY_API_KEY not configured");

  // Build actor input based on criteria
  const input: Record<string, unknown> = {
    resultsLimit: 100,
  };

  if (criteria.targetProfiles?.length) {
    input.directUrls = criteria.targetProfiles.map(
      (p) => `https://www.instagram.com/${p.replace("@", "")}`
    );
  }

  if (criteria.hashtags?.length) {
    input.hashtags = criteria.hashtags;
  }

  // Start actor run
  const actorId = "apify~instagram-profile-scraper";
  const runResponse = await fetch(
    `${APIFY_BASE_URL}/acts/${actorId}/runs?token=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!runResponse.ok) {
    const error = await runResponse.text();
    throw new Error(`Apify actor start failed: ${error}`);
  }

  const run: ApifyRunResponse = await runResponse.json();

  // Poll for completion
  const runId = run.data.id;
  let status = run.data.status;
  const maxWaitMs = 5 * 60 * 1000; // 5 minutes
  const startTime = Date.now();

  while (status === "RUNNING" || status === "READY") {
    if (Date.now() - startTime > maxWaitMs) {
      throw new Error("Apify run timed out after 5 minutes");
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const statusResponse = await fetch(
      `${APIFY_BASE_URL}/actor-runs/${runId}?token=${apiKey}`
    );
    const statusData = await statusResponse.json();
    status = statusData.data.status;
  }

  if (status !== "SUCCEEDED") {
    throw new Error(`Apify run failed with status: ${status}`);
  }

  // Fetch results from dataset
  const datasetId = run.data.defaultDatasetId;
  const resultsResponse = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${apiKey}`
  );

  if (!resultsResponse.ok) {
    throw new Error("Failed to fetch Apify dataset results");
  }

  return resultsResponse.json();
}

export function mapApifyResult(result: ApifyProfileResult) {
  const now = new Date().toISOString();
  return {
    username: result.username || "unknown",
    name: result.fullName || null,
    bio: result.biography || null,
    followers: result.followersCount || null,
    email: result.email || null,
    website: result.externalUrl || null,
    lastPost: result.latestPosts?.[0]?.caption || null,
    source: "instagram",
    status: "new" as const,
    messageStatus: "none" as const,
    createdAt: now,
    updatedAt: now,
  };
}
