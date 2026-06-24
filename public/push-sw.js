self.addEventListener('push', (event) => {
  const fallback = {
    title: 'VERTEX',
    body: 'Você tem um novo lembrete.',
    tag: 'vertex-reminder',
    url: '/'
  };

  const data = event.data ? event.data.json() : fallback;
  const title = data.title || fallback.title;
  const options = {
    body: data.body || fallback.body,
    icon: data.icon || '/icons/icon-192.svg',
    badge: data.badge || '/icons/icon-192.svg',
    tag: data.tag || fallback.tag,
    data: {
      url: data.url || fallback.url
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const client = clientList.find((item) => item.url.includes(self.location.origin));
      if (client) {
        client.focus();
        return client.navigate(targetUrl);
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
