const CACHE_NAME = 'wsnail-v1.0.0';
const API_CACHE_NAME = 'wsnail-api-v1.0.0';

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/safari-pinned-tab.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/images/logo.png',
  '/images/og-image.jpg',
  '/manifest.json'
];

// API请求缓存
const API_CACHE_URLS = [
  '/api/ai-tools',
  '/api/categories',
  '/api/tools/search'
];

// 安装Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith('wsnail-') && cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 处理网络请求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 只处理同源请求
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到缓存，直接返回
        if (response) {
          return response;
        }

        // 如果是API请求，缓存到API_CACHE
        if (API_CACHE_URLS.some(apiUrl => url.pathname === apiUrl)) {
          return fetch(event.request)
            .then(response => {
              // 只缓存成功的响应
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(API_CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              // 如果网络请求失败，尝试从API_CACHE返回旧数据
              return caches.match(event.request);
            });
        }

        // 对于其他请求，先尝试网络，失败后使用缓存
        return fetch(event.request)
          .then(response => {
            // 缓存成功响应
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // 网络失败时，尝试从缓存获取
            return caches.match(event.request);
          });
      })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics-data') {
    event.waitUntil(
      // 这里可以添加后台同步逻辑
      console.log('Background sync: analytics data')
    );
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '您有新的AI工具推荐！',
    icon: '/images/logo.png',
    badge: '/images/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('WSNAIL - AI工具平台', options)
  );
});

// 点击通知
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view-tools') {
    event.waitUntil(
      clients.openWindow('/ai-tools')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});