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
// Rationale: Map tiles for specific coordinates and zoom levels remain static.
// Serving map tiles from cache provides instant offline panning and zooming.
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
// Rationale: Place details and reports change frequently.
// NetworkFirst fetches fresh data online and falls back to cached data after a 4-second timeout.
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
