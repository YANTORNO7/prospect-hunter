import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { searchConfigs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const configs = await db
      .select()
      .from(searchConfigs)
      .orderBy(desc(searchConfigs.createdAt));

    return NextResponse.json({ data: configs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch configs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Config name is required" },
        { status: 400 }
      );
    }

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

    const result = await db
      .insert(searchConfigs)
      .values({
        name: body.name.trim(),
        hashtags: body.hashtags ? JSON.stringify(body.hashtags) : null,
        targetProfiles: body.targetProfiles
          ? JSON.stringify(body.targetProfiles)
          : null,
        bioKeywords: body.bioKeywords
          ? JSON.stringify(body.bioKeywords)
          : null,
        location: body.location || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
