import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prospects, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
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

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.prospectId, parseInt(id)));

    return NextResponse.json({ ...prospect[0], messages: msgs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch prospect";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await db
      .update(prospects)
      .set({
        status: body.status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(prospects.id, parseInt(id)))
      .returning();

    if (!result.length) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update prospect";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
