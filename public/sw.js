// Mango Learning OS — Service Worker v0.1
// Offline cache + install prompt
const CACHE = "mango-v0.1";
const PRELOAD = ["/hub", "/pack", "/agent", "/profile", "/notes", "/offline", "/login"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRELOAD).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // Skip API calls and Supabase auth
  if (e.request.url.includes("/api/") || e.request.url.includes("supabase")) return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached || caches.match("/offline"));
      return cached || fetched;
    })
  );
});
