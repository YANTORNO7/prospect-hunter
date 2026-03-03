export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.editedContent?.trim()) {
      return NextResponse.json(
        { error: "editedContent is required" },
        { status: 400 }
      );
    }

    const result = await db
      .update(messages)
      .set({ editedContent: body.editedContent.trim() })
      .where(eq(messages.id, parseInt(id)))
      .returning();

    if (!result.length) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
