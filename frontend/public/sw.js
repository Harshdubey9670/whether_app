self.addEventListener('push', function (event) {
  if (event.data) {
    let payload = { title: 'WeatherVerse Alert', body: 'New weather update available.' };
    
    try {
      const parsedData = event.data.json();
      if (parsedData.title) payload.title = parsedData.title;
      if (parsedData.body) payload.body = parsedData.body;
    } catch (e) {
      payload.body = event.data.text();
    }

    const options = {
      body: payload.body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      }
    };

    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('http://localhost:5174/dashboard')
  );
});
