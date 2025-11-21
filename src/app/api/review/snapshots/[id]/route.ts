// src/app/api/review/snapshots/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reportSnapshots } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const snapshotId = Number(id);
    if (Number.isNaN(snapshotId)) {
      return NextResponse.json(
        { error: "Invalid snapshot ID" },
        { status: 400 },
      );
    }

    // Only allow removing approved snapshots for safety
    const [deleted] = await db
      .delete(reportSnapshots)
      .where(
        and(
          eq(reportSnapshots.id, snapshotId),
          eq(reportSnapshots.status, "approved"),
        ),
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Approved snapshot not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE snapshot error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to remove snapshot" },
      { status: 500 },
    );
  }
}
