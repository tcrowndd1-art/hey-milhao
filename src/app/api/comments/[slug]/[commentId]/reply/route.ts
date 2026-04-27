import { NextResponse, type NextRequest } from "next/server";
import { getReplies, addReply, likeReply } from "@/lib/redis";
import { hashIp } from "@/lib/hash";

export const runtime = "nodejs";

function getIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await params;
  const replies = await getReplies(commentId);
  return NextResponse.json({ replies });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; commentId: string }> },
) {
  const { commentId } = await params;
  let body: { message?: string; action?: string; replyId?: string };
  try { body = (await req.json()) as typeof body; }
  catch { return NextResponse.json({ error: "invalid_body" }, { status: 400 }); }

  // Like a reply
  if (body.action === "like" && body.replyId) {
    const count = await likeReply(commentId, body.replyId);
    return NextResponse.json({ likes: count });
  }

  // Add a reply
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length < 2) {
    return NextResponse.json({ error: "message_required" }, { status: 422 });
  }

  const ipHash = hashIp(getIp(req));
  const result = await addReply(commentId, ipHash, message);

  if ("error" in result) {
    return NextResponse.json(result, { status: result.error === "too_fast" ? 429 : 503 });
  }
  return NextResponse.json(result, { status: 201 });
}
