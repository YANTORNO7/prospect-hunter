import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { searchConfigs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db
      .delete(searchConfigs)
      .where(eq(searchConfigs.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
