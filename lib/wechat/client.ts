// ═══════════════════════════════════════════════════════════════
// WeChat API Client — shared utilities for test account operations
// ═══════════════════════════════════════════════════════════════

const APPID = "wxdd2dbd4a69db4102";
const APPSECRET = "bb3e67ad594eb26dc9865f9881c09950";

// ═══ Access Token Cache ═══

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
  );
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access_token: " + JSON.stringify(data));

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken!;
}

// ═══ Send Customer Service Message ═══

export async function sendCustomerMsg(openid: string, content: string): Promise<boolean> {
  try {
    const token = await getAccessToken();
    const res = await fetch(
      `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          touser: openid,
          msgtype: "text",
          text: { content: content.slice(0, 2000) },
        }),
      }
    );
    const data = await res.json();
    return data.errcode === 0;
  } catch {
    return false;
  }
}

// ═══ Download Media (Voice) ═══

export async function downloadMedia(mediaId: string): Promise<ArrayBuffer> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/media/get?access_token=${token}&media_id=${mediaId}`
  );
  return res.arrayBuffer();
}

// ═══ Create Bottom Menu ═══

const MENU_CONFIG = {
  button: [
    {
      name: "每日推荐",
      sub_button: [
        { type: "click", name: "今日经济", key: "DAILY_ECON" },
        { type: "click", name: "今日英语", key: "DAILY_ENGLISH" },
        { type: "click", name: "今日AI", key: "DAILY_AI" },
      ],
    },
    {
      name: "认知分析",
      sub_button: [
        { type: "click", name: "分析概念", key: "ANALYZE" },
        { type: "click", name: "学习计划", key: "PLAN" },
        { type: "view", name: "打开网页", url: "https://mangoleaningos.top" },
      ],
    },
    {
      name: "我的",
      sub_button: [
        { type: "click", name: "认知状态", key: "STATE" },
        { type: "click", name: "使用帮助", key: "HELP" },
        { type: "view", name: "完整体验", url: "https://mangoleaningos.top/hub" },
      ],
    },
  ],
};

export async function createMenu(): Promise<boolean> {
  try {
    const token = await getAccessToken();
    const res = await fetch(
      `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(MENU_CONFIG),
      }
    );
    const data = await res.json();
    return data.errcode === 0;
  } catch {
    return false;
  }
}

// ═══ Get Followers ═══

export async function getFollowers(): Promise<string[]> {
  try {
    const token = await getAccessToken();
    const res = await fetch(
      `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${token}`
    );
    const data = await res.json();
    return data.data?.openid ?? [];
  } catch {
    return [];
  }
}
