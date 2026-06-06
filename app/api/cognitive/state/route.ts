// GET /api/cognitive/state — returns user's cognitive DNA
import { NextResponse } from "next/server";
import { loadDNA } from "@/lib/ai/cognitive-engine";

export async function GET() {
  const dna = loadDNA();
  return NextResponse.json({
    entries: dna.entries,
    last_state: dna.last_state,
    total_entries: dna.entries.length,
  });
}
