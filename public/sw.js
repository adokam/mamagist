/* Mamagist service worker.
 * Caches the app shell (the offline page and the app icon) so the app opens
 * without internet and shows a friendly offline page. Nothing else is cached:
 * no chat messages, dates, names or health data, and no Supabase auth or
 * debby-chat requests are ever cached or intercepted for storage.
 */
const CACHE = "mamagist-shell-v1";
const SHELL = ["/offline.html", "/icon-192.png", "/favicon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isSupabaseOrChat(url) {
  return (
    url.hostname.includes("supabase.co") ||
    url.pathname.includes("/auth/") ||
    url.pathname.includes("debby-chat") ||
    url.pathname.includes("/functions/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Never touch Supabase auth or the Debby edge function.
  if (isSupabaseOrChat(url)) return;

  // Page visits: try the network first, show the friendly offline page when
  // there is no internet.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline.html", { ignoreSearch: true }),
      ),
    );
    return;
  }

  // Same-origin static files (scripts, styles, icons): serve from the cache
  // when saved, otherwise fetch once and save a copy.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
