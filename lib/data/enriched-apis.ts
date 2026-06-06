// ═══════════════════════════════════════════════════════════════
// Enriched Public APIs — Extended data sources for MangoOS
// arXiv, LibreTranslate, OpenWeatherMap, NewsAPI-ready
// ═══════════════════════════════════════════════════════════════

// ═══ arXiv API ═══
export async function searchArxiv(query: string, maxResults = 5) {
  try {
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${maxResults}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const xml = await res.text();

    const entries: { title: string; summary: string; link: string; published: string }[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    let m;
    while ((m = entryRegex.exec(xml)) !== null) {
      const e = m[1];
      entries.push({
        title: (e.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1]?.replace(/<[^>]+>/g, "").trim() ?? "",
        summary: (e.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ?? [])[1]?.replace(/<[^>]+>/g, "").trim().slice(0, 300) ?? "",
        link: (e.match(/<id[^>]*>([\s\S]*?)<\/id>/i) ?? [])[1]?.trim() ?? "",
        published: (e.match(/<published[^>]*>([\s\S]*?)<\/published>/i) ?? [])[1]?.trim().slice(0, 10) ?? "",
      });
    }
    return entries;
  } catch { return []; }
}

// ═══ LibreTranslate (no key needed) ═══
export async function translateText(text: string, target: string = "zh"): Promise<string> {
  try {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "auto", target, format: "text" }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json() as { translatedText: string };
    return data.translatedText ?? text;
  } catch { return text; }
}

// ═══ Weather API (affects learning recommendations) ═══
export interface WeatherData {
  temp: number; condition: string; icon: string;
}
export async function getWeather(city: string = "Beijing"): Promise<WeatherData | null> {
  try {
    // Using Open-Meteo (free, no key)
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const geoData = await geoRes.json() as { results?: [{ latitude: number; longitude: number }] };
    if (!geoData.results?.[0]) return null;
    const { latitude, longitude } = geoData.results[0];
    const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    const wData = await wRes.json() as { current_weather?: { temperature: number; weathercode: number } };
    const w = wData.current_weather;
    if (!w) return null;
    const conditions: Record<number, string> = { 0: "晴", 1: "晴", 2: "多云", 3: "阴", 45: "雾", 51: "小雨", 61: "雨", 71: "雪", 95: "雷暴" };
    return { temp: w.temperature, condition: conditions[w.weathercode] ?? "未知", icon: w.weathercode <= 1 ? "☀️" : w.weathercode <= 3 ? "⛅" : "🌧️" };
  } catch { return null; }
}

// ═══ Generate learning suggestion based on weather ═══
export async function getWeatherLearningTip(): Promise<string | null> {
  const weather = await getWeather();
  if (!weather) return null;
  if (weather.condition === "晴") return `${weather.icon} 天气晴朗 ${weather.temp}°C — 适合高强度学习冲刺`;
  if (weather.condition === "雨") return `${weather.icon} 雨天 ${weather.temp}°C — 适合深度阅读和笔记整理`;
  return `${weather.icon} ${weather.condition} ${weather.temp}°C — 按计划学习`;
}
