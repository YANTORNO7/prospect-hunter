import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prospects } from "@/lib/db/schema";
import { runInstagramScraper, mapApifyResult } from "@/lib/apify";
import { eq } from "drizzle-orm";
import type { SearchCriteria } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: SearchCriteria = await request.json();

    if (
      !body.hashtags?.length &&
      !body.targetProfiles?.length &&
      !body.bioKeywords?.length
    ) {
      return NextResponse.json(
        { error: "At least one search criterion is required" },
        { status: 400 }
      );
    }

    const results = await runInstagramScraper(body);

    let newCount = 0;
    let duplicateCount = 0;

    for (const result of results) {
      const mapped = mapApifyResult(result);
      if (!mapped.username || mapped.username === "unknown") continue;

      // Check for duplicate
      const existing = await db
        .select()
        .from(prospects)
        .where(eq(prospects.username, mapped.username))
        .limit(1);

      if (existing.length > 0) {
        duplicateCount++;
        continue;
      }

      await db.insert(prospects).values(mapped);
      newCount++;
    }

    return NextResponse.json({
      success: true,
      collected: results.length,
      new: newCount,
      duplicates: duplicateCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during collection";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
