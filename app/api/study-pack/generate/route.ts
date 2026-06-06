// V11 Study Pack Generate — Proxy to the existing exam-review pipeline
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // Forward to the existing exam-review generate endpoint
  const body = await req.json();
  const res = await fetch(new URL("/api/exam-review/generate", req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
