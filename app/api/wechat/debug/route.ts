// GET /api/wechat/debug — test async pipeline step by step
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const APPID = "wxdd2dbd4a69db4102";
const APPSECRET = "bb3e67ad594eb26dc9865f9881c09950";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const openid = url.searchParams.get("openid") ?? "";
  const results: string[] = [];

  // Step 1: Get access_token
  try {
    const tokenRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
    );
    const tokenData = await tokenRes.json();
    if (tokenData.access_token) {
      results.push(`✅ Token: ${tokenData.access_token.slice(0, 12)}... expires: ${tokenData.expires_in}s`);
    } else {
      results.push(`❌ Token FAILED: ${JSON.stringify(tokenData)}`);
      return NextResponse.json({ results, verdict: "Token fetch failed" });
    }

    // Step 2: Send test customer service message
    if (openid) {
      const msgRes = await fetch(
        `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${tokenData.access_token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            touser: openid,
            msgtype: "text",
            text: { content: "🧪 芒宝调试测试 — 如果你看到这条消息，说明客服消息通道正常！" },
          }),
        }
      );
      const msgData = await msgRes.json();
      results.push(`📨 Customer msg: ${JSON.stringify(msgData)}`);
    } else {
      results.push("⚠️ No openid provided — skip customer msg test. Add ?openid=xxx");
    }
  } catch (err) {
    results.push(`💥 Exception: ${err}`);
  }

  return NextResponse.json({ results, verdict: "Done" });
}
