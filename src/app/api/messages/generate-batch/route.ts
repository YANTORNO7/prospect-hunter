import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prospects, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateMessage, delay } from "@/lib/gemini";
import type { Prospect } from "@/types";

export async function POST() {
  try {
    const pending = await db
      .select()
      .from(prospects)
      .where(eq(prospects.messageStatus, "none"));

    if (!pending.length) {
      return NextResponse.json({
        success: true,
        generated: 0,
        failed: 0,
        message: "No prospects pending message generation",
      });
    }

    let generated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const prospect of pending) {
      try {
        const content = await generateMessage(prospect as Prospect);

        await db.insert(messages).values({
          prospectId: prospect.id,
          content,
          generatedAt: new Date().toISOString(),
        });

        await db
          .update(prospects)
          .set({
            messageStatus: "ready",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(prospects.id, prospect.id));

        generated++;

        // Rate limit: 15 RPM no free tier do Gemini = ~4s entre chamadas
        if (prospect !== pending[pending.length - 1]) {
          await delay(4000);
        }
      } catch (error) {
        failed++;
        errors.push(
          `${prospect.username}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      generated,
      failed,
      total: pending.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Batch generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
