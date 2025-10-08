import { NextResponse } from "next/server";
import { db } from "../../../server/db";
import { posts } from "../../../server/db/schema";
import { ilike, asc, desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { name, rating, imageUrl } = await req.json();

    if (!name || rating == null || !imageUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await db.insert(posts).values({
      name,
      rating: Number(rating),
      imageUrl,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("order") || "desc";

  // Determine sort direction
  const sortDirection = order === "asc" ? asc : desc;

  // Determine which column to sort by
  const sortColumn =
    sortBy === "name"
      ? posts.name
      : sortBy === "rating"
      ? posts.rating
      : posts.createdAt;

  // Base query
  const results = query
    ? await db
        .select()
        .from(posts)
        .where(ilike(posts.name, `%${query}%`))
        .orderBy(sortDirection(sortColumn))
    : await db.select().from(posts).orderBy(sortDirection(sortColumn));

  return NextResponse.json(results);
}