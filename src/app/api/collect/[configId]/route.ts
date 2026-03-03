export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { searchConfigs, prospects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { runInstagramScraper, mapApifyResult } from "@/lib/apify";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ configId: string }> }
) {
  try {
    const { configId } = await params;
    const config = await db
      .select()
      .from(searchConfigs)
      .where(eq(searchConfigs.id, parseInt(configId)))
      .limit(1);

    if (!config.length) {
      return NextResponse.json(
        { error: "Search config not found" },
        { status: 404 }
      );
    }

    const cfg = config[0];
    const criteria = {
      hashtags: cfg.hashtags ? JSON.parse(cfg.hashtags) : undefined,
      targetProfiles: cfg.targetProfiles
        ? JSON.parse(cfg.targetProfiles)
        : undefined,
      bioKeywords: cfg.bioKeywords ? JSON.parse(cfg.bioKeywords) : undefined,
    };

    const results = await runInstagramScraper(criteria);

    let newCount = 0;
    let duplicateCount = 0;

    for (const result of results) {
      const mapped = mapApifyResult(result);
      if (!mapped.username || mapped.username === "unknown") continue;

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
      error instanceof Error ? error.message : "Collection failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
