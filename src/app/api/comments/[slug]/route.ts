import { NextResponse, type NextRequest } from "next/server";
import { getComments, addComment } from "@/lib/redis";
import { hashIp } from "@/lib/hash";

export const runtime = "nodejs";

function getIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "0.0.0.0";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const comments = await getComments(slug);
  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  let body: { name?: string; message?: string };
  try {
    body = (await req.json()) as { name?: string; message?: string };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || name.length < 1) {
    return NextResponse.json({ error: "name_required" }, { status: 422 });
  }
  if (!message || message.length < 2) {
    return NextResponse.json({ error: "message_required" }, { status: 422 });
  }

  const ipHash = hashIp(getIp(req));
  const result = await addComment(slug, ipHash, name, message);

  if ("error" in result) {
    const status = result.error === "too_fast" ? 429 : 503;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 201 });
}
