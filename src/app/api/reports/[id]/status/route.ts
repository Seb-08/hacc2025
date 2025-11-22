import { db } from "~/server/db";
import { reports } from "~/server/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";


export async function PATCH(req: NextRequest, { params }: any) {
  const { id } = params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }

  try {
    const data = await db
      .update(reports)
      .set({ status: "closed" })
      .where(eq(reports.id, Number(id)));

    console.log("Updated report:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update report:", error);
    return NextResponse.json({ error: "Failed to update report status" }, { status: 500 });
  }
}


