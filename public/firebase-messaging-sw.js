importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDh4zzjgBNbB5ypIYlX2Y5ippzdDy-soaY",
  authDomain: "kaji-hunter.firebaseapp.com",
  projectId: "kaji-hunter",
  storageBucket: "kaji-hunter.firebasestorage.app",
  messagingSenderId: "592848599918",
  appId: "1:592848599918:web:cf0acbf9d3078c4640df7f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Kaji Hunter";
  const body = payload.notification?.body || "新しい通知があります。";

  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: {
      url: "/",
    },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});
