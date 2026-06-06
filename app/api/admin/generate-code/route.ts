// POST /api/admin/generate-code — Generate Mango Code(s)
// Hard-gated: admin role required
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { generateCodes } from "@/lib/mango-code/mango-code";
import type { GenerateCodeRequest } from "@/lib/mango-code/types";

export async function POST(req: NextRequest) {
  const session = await resolveSession(req);

  // Admin gate — server-side, not bypassable
  if (session.plan !== "admin") {
    return NextResponse.json(
      { error: "需要管理员权限", code: "ADMIN_REQUIRED" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json() as GenerateCodeRequest;

    if (!body.planGranted || !["standard", "pro", "admin"].includes(body.planGranted)) {
      return NextResponse.json(
        { error: "请选择有效的计划类型 (standard, pro, admin)", code: "INVALID_INPUT" },
        { status: 400 },
      );
    }

    if (body.durationDays < 0 || body.durationDays > 3650) {
      return NextResponse.json(
        { error: "有效期必须在 0-3650 天之间", code: "INVALID_INPUT" },
        { status: 400 },
      );
    }

    const result = generateCodes(body, session.userId!);

    return NextResponse.json({
      success: true,
      ...result,
      message: `成功生成 ${result.codes.length} 个兑换码`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "生成失败", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
