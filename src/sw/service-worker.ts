/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Precache all files built by Vite
precacheAndRoute((self as any).__WB_MANIFEST);

// Force immediate activation
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ============================================================================
// CacheFirst strategy for CARTO Positron map tiles (basemaps.cartocdn.com)
// WHY CacheFirst: Map tiles for specific lat/lng/zoom values are completely static, 
// so there is zero risk of staleness. Serving them from the cache instantly 
// enables smooth panning and zooming on the map when fully offline.
// ============================================================================
registerRoute(
  ({ url }) => url.origin === 'https://basemaps.cartocdn.com',
  new CacheFirst({
    cacheName: 'carto-map-tiles',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200], // Allow opaque responses (CORS) to be cached
      }),
      new ExpirationPlugin({
        maxEntries: 500, // Bound cache size to prevent disk bloat
        maxAgeSeconds: 30 * 24 * 60 * 60, // Keep tiles cached for 30 days
      }),
    ],
  })
);

// ============================================================================
// NetworkFirst strategy for Supabase REST queries (supabase.co)
// WHY NetworkFirst: Directory entries and user reviews are dynamic and update
// frequently. We always try the network first to display fresh information, 
// falling back to cached results (with a 4-second timeout) if offline or slow.
// ============================================================================
registerRoute(
  ({ url }) => url.origin.includes('supabase.co') && url.pathname.includes('/rest/v1/'),
  new NetworkFirst({
    cacheName: 'supabase-rest-cache',
    networkTimeoutSeconds: 4, // Failover quickly to cache if connection is slow
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  })
);
