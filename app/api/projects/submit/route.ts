import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/projects/submit — mark a project as submitted
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, content } = body as {
      projectId: string;
      content: string;
    };

    if (!projectId?.trim()) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Submission content is required" },
        { status: 400 }
      );
    }

    // In a full implementation, this would update the database.
    // For the client-side store version, the submission is handled
    // by the component via useStore or local state.
    // This endpoint serves as the future database integration point.

    return NextResponse.json({
      success: true,
      projectId,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    });
  } catch (err) {
    console.error("[projects/submit] error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to submit project",
      },
      { status: 500 }
    );
  }
}
