import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prospects } from "@/lib/db/schema";
import { like, eq, sql, desc, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];
    if (status) conditions.push(eq(prospects.status, status));
    if (search) {
      conditions.push(
        sql`(${prospects.username} LIKE ${"%" + search + "%"} OR ${prospects.name} LIKE ${"%" + search + "%"} OR ${prospects.bio} LIKE ${"%" + search + "%"})`
      );
    }

    const whereClause =
      conditions.length > 0
        ? sql`${sql.join(conditions, sql` AND `)}`
        : undefined;

    // Sort column mapping
    const sortColumnMap = {
      createdAt: prospects.createdAt,
      followers: prospects.followers,
      username: prospects.username,
      status: prospects.status,
    } as const;

    type SortKey = keyof typeof sortColumnMap;
    const sortCol =
      sort in sortColumnMap
        ? sortColumnMap[sort as SortKey]
        : prospects.createdAt;
    const orderFn = order === "asc" ? asc : desc;

    const data = await db
      .select()
      .from(prospects)
      .where(whereClause)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(prospects)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch prospects";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
