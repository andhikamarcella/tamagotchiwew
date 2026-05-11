const PIXEL_PAWS_CACHE = "pixel-paws-offline-v2";
const OFFLINE_URL = "/offline";
const OFFLINE_ASSETS = ["/icon.svg", "/favicon.svg"];

function offlineHtmlResponse() {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>You're Offline · Pixel Paws</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#111827,#312e81 50%,#0f172a);font-family:'Pixelify Sans',monospace,sans-serif;color:#0f172a}.card{width:min(92vw,36rem);box-sizing:border-box;border:4px solid #0f172a;background:#fff;padding:24px;text-align:center;box-shadow:8px 8px 0 #0f172a;border-radius:28px}.paw{font-size:64px}.status{border:4px solid #0f172a;background:#fef3c7;padding:12px;margin:16px 0;font-weight:700}.btn{display:inline-block;margin:6px;border:3px solid #0f172a;background:#bef264;color:#0f172a;padding:12px 16px;text-decoration:none;box-shadow:3px 3px 0 #0f172a;font:inherit;cursor:pointer}.btn.secondary{background:#fff}p,li{line-height:1.6}.help{display:none;margin-top:14px;border:3px solid #0f172a;background:#eef2ff;padding:12px;text-align:left}.help.open{display:block}.muted{font-size:12px}</style></head><body><main class="card"><div class="paw">🐾</div><h1>You're Offline</h1><p id="statusText">Connection lost. Pixel Paws will be ready when you're back online.</p><div class="status">Your save is safe · Reconnect to continue online features</div><p>Online features like sync, notifications, couple mode, and cloud save may be unavailable until you reconnect.</p><button class="btn" id="retryButton" type="button">Retry Connection</button><button class="btn secondary" id="helpButton" type="button" aria-expanded="false" aria-controls="offlineHelp">Offline Help</button><section class="help" id="offlineHelp"><h2>Offline Help</h2><ul><li>Single-player progress stays in this browser and syncs after reconnecting.</li><li>Do not clear site data while offline if you want to keep local progress.</li><li>Couple Mode, cloud save, FCM token creation, and news refresh require internet.</li><li>If this is your first visit, reconnect once so the service worker can cache the app shell.</li></ul></section><p class="muted">Network: <span id="networkState">checking...</span></p></main><script>(()=>{const state=document.getElementById('networkState');const status=document.getElementById('statusText');const help=document.getElementById('offlineHelp');const helpButton=document.getElementById('helpButton');function update(){const online=navigator.onLine;state.textContent=online?'online - retry now':'offline';status.textContent=online?'Connection looks back. Tap retry to reload Pixel Paws.':'Connection lost. Pixel Paws will be ready when you are back online.'}window.addEventListener('online',update);window.addEventListener('offline',update);document.getElementById('retryButton').addEventListener('click',()=>{if(navigator.onLine){location.href='/'}else{update();status.textContent='Still offline. Your save is safe; try again after Wi-Fi returns.'}});helpButton.addEventListener('click',()=>{const open=!help.classList.contains('open');help.classList.toggle('open',open);helpButton.setAttribute('aria-expanded',String(open));});update();})();</script></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

async function cacheOfflineShell() {
  const cache = await caches.open(PIXEL_PAWS_CACHE);
  await cache.put(OFFLINE_URL, offlineHtmlResponse());
  await Promise.allSettled(OFFLINE_ASSETS.map((url) => cache.add(new Request(url, { cache: "reload" }))));
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheOfflineShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("pixel-paws-offline-") && key !== PIXEL_PAWS_CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const isNavigation = request.mode === "navigate" || request.destination === "document" || (request.headers.get("accept") || "").includes("text/html");
  if (!isNavigation) return;

  event.respondWith((async () => {
    try {
      return await fetch(request);
    } catch (error) {
      const cache = await caches.open(PIXEL_PAWS_CACHE);
      const cached = await cache.match(OFFLINE_URL) || await cache.match(new Request(OFFLINE_URL));
      return cached || offlineHtmlResponse();
    }
  })());
});

try {
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

  if (self.firebase?.apps?.length === 0) {
    self.firebase.initializeApp({
      apiKey: "AIzaSyCxK_SM3_h-IHtM7zyVa-K1Gu-xQfhVDYE",
      authDomain: "pixel-paws-tamagotchi.firebaseapp.com",
      projectId: "pixel-paws-tamagotchi",
      storageBucket: "pixel-paws-tamagotchi.firebasestorage.app",
      messagingSenderId: "330948794614",
      appId: "1:330948794614:web:0e6976c060750825e1b4d7"
    });
  }

  const messaging = self.firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Pixel Paws";
    const options = {
      body: payload.notification?.body || "You have a new Pixel Paws update.",
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: payload.data || {}
    };

    self.registration.showNotification(title, options);
  });
} catch (error) {
  console.warn("Pixel Paws FCM service worker features unavailable:", error);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      if ("focus" in client) return client.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow("/");
    return undefined;
  }));
});
