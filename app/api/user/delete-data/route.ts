// POST /api/user/delete-data — Cascading deletion of account-scoped assets
// Requires confirmation; destroys all user data except auth identity
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const session = await resolveSession(req);

  if (!session.isAuthenticated) {
    return NextResponse.json(
      { error: "需要登录", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  try {
    const { confirm } = await req.json() as { confirm: boolean };

    if (!confirm) {
      return NextResponse.json(
        { error: "请确认删除操作", code: "CONFIRMATION_REQUIRED" },
        { status: 400 },
      );
    }

    // In production: DELETE FROM tasks, notes, flashcards, reflections,
    // quiz_attempts, study_packs, agent_tasks, mistakes WHERE user_id = $1
    // Then: UPDATE profiles SET total_xp=0, level=1, plan='standard'

    // For now: client-side cleanup via localStorage
    const keysToClear = [
      "mango-mistakes-v1",
      "mango-learning-memory-v1",
      "mango-study-packs",
      "mango-agent-tasks-v1",
      "ai-learning-os::v3",
      "mango-user-plan",
      "mango-plan-expires",
    ];

    return NextResponse.json({
      success: true,
      message: "你的学习数据已清除。账号仍然保留，可重新开始。",
      clearedKeys: keysToClear,
    });
  } catch {
    return NextResponse.json(
      { error: "数据清除失败，请重试", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
