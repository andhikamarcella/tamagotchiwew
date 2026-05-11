importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCxK_SM3_h-IHtM7zyVa-K1Gu-xQfhVDYE",
  authDomain: "pixel-paws-tamagotchi.firebaseapp.com",
  projectId: "pixel-paws-tamagotchi",
  storageBucket: "pixel-paws-tamagotchi.firebasestorage.app",
  messagingSenderId: "330948794614",
  appId: "1:330948794614:web:0e6976c060750825e1b4d7"
});

const messaging = firebase.messaging();

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
