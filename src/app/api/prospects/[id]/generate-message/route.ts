export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prospects, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateMessage } from "@/lib/gemini";
import type { Prospect } from "@/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prospect = await db
      .select()
      .from(prospects)
      .where(eq(prospects.id, parseInt(id)))
      .limit(1);

    if (!prospect.length) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    const p = prospect[0] as Prospect;
    const content = await generateMessage(p);

    const msg = await db
      .insert(messages)
      .values({
        prospectId: parseInt(id),
        content,
        generatedAt: new Date().toISOString(),
      })
      .returning();

    await db
      .update(prospects)
      .set({
        messageStatus: "ready",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(prospects.id, parseInt(id)));

    return NextResponse.json(msg[0], { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
