/* movies.net service worker: keeps the app opening when offline. Never caches videos, the database or other sites. */
const V = "mx-v10", SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || r.headers.has("range")) return;
  /* pages: always try the network first so a new version shows up right away */
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put("./index.html", c)); return res; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  /* icons and manifest: cache first */
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })));
});

/* push, background sync and periodic refresh (so the app can notify and update while closed) */
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "movies.net", { body: d.body || "New titles are available.", icon: "./icon-192.png", badge: "./icon-192.png", data: { url: d.url || "./" } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(l => { for (const c of l) if ("focus" in c) return c.focus(); return self.clients.openWindow((e.notification.data && e.notification.data.url) || "./"); }));
});
self.addEventListener("sync", e => { if (e.tag === "mx-sync") e.waitUntil(caches.open(V).then(c => c.add("./index.html")).catch(() => {})); });
self.addEventListener("periodicsync", e => { if (e.tag === "mx-refresh") e.waitUntil(caches.open(V).then(c => c.add("./index.html")).catch(() => {})); });
