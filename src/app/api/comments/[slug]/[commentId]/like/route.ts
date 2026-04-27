import { NextResponse, type NextRequest } from "next/server";
import { likeComment } from "@/lib/redis";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; commentId: string }> },
) {
  const { slug, commentId } = await params;
  const count = await likeComment(slug, commentId);
  return NextResponse.json({ likes: count });
}
