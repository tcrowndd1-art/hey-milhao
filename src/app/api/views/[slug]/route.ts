import { NextResponse, type NextRequest } from "next/server";
import { getViews, incrementViewIfNew } from "@/lib/redis";
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
  const count = await getViews(slug);
  return NextResponse.json({ count });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const ipHash = hashIp(getIp(req));
  const result = await incrementViewIfNew(slug, ipHash);
  return NextResponse.json(result);
}
