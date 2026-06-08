// GET /api/agent/status?runId=xxx — Poll for run progress (V14.8.1)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const runId = req.nextUrl.searchParams.get("runId");
  if (!runId) return NextResponse.json({ error: "missing runId" }, { status: 400 });

  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
    const { data: run } = await sb.from("agent_runs").select("*").eq("id", runId).single();
    if (!run) return NextResponse.json({ error: "not found" }, { status: 404 });

    // Also get document if exists
    const { data: doc } = await sb.from("outcome_documents").select("id").eq("run_id", runId).maybeSingle();

    return NextResponse.json({
      runId: run.id,
      status: run.status,
      qualityScore: run.quality_score,
      sourceCount: run.source_count,
      documentId: doc?.id || null,
      createdAt: run.created_at,
    });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
