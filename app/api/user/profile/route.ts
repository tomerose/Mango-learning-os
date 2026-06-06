// GET /api/user/profile — Fetch user profile
// PATCH /api/user/profile — Update user profile (nickname, avatar, preferences)
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { getPlanInfo } from "@/lib/plan/types";
import { getQuotaStatus } from "@/lib/quota/quota";

export async function GET(req: NextRequest) {
  const session = await resolveSession(req);

  if (!session.isAuthenticated) {
    return NextResponse.json({
      isGuest: true,
      plan: getPlanInfo("guest"),
      quota: getQuotaStatus("guest", "guest"),
      learningAssets: { studyPacks: 0, agentTasks: 0, notes: 0, mistakes: 0, flashcards: 0, reviews: 0 },
    });
  }

  // Read asset counts from localStorage (client-side proxy)
  // In production: SELECT COUNT(*) FROM each table WHERE user_id = $1

  return NextResponse.json({
    isGuest: false,
    userId: session.userId,
    email: session.email,
    plan: getPlanInfo(session.plan, session.planExpiresAt ?? undefined),
    quota: getQuotaStatus(session.userId!, session.plan),
    learningAssets: {
      studyPacks: 0,
      agentTasks: 0,
      notes: 0,
      mistakes: 0,
      flashcards: 0,
      reviews: 0,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await resolveSession(req);

  if (!session.isAuthenticated) {
    return NextResponse.json(
      { error: "需要登录", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  try {
    const { nickname, avatarUrl } = await req.json() as { nickname?: string; avatarUrl?: string };

    // In production: UPDATE profiles SET display_name=$1, avatar_url=$2 WHERE id=$3
    // ...via Supabase

    return NextResponse.json({
      success: true,
      nickname: nickname ?? "学习者",
      avatarUrl: avatarUrl ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "更新失败", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
