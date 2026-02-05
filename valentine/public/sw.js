self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "Valentine 💖", body: "Thinking of you…" };

  event.waitUntil(
    self.registration.showNotification(data.title || "Valentine 💖", {
      body: data.body || "Thinking of you…",
      icon: data.icon || "/her.jpg",
      badge: data.badge || "/her.jpg",
      vibrate: [80, 40, 80],
      data: { url: data.url || "/" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(clients.openWindow(url));
});
