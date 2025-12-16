/**
 * Service Worker pour Bilan-Easy
 * Permet le fonctionnement hors-ligne de l'application
 */

const CACHE_NAME = 'bilan-easy-v1';
const OFFLINE_URL = '/offline.html';

// Ressources à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de l\'installation:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Suppression de l\'ancien cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation terminée');
        return self.clients.claim();
      })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers des domaines externes (API, etc.)
  if (!url.origin.includes(self.location.origin)) {
    // Pour Supabase et autres APIs, essayer le réseau d'abord
    if (url.hostname.includes('supabase') || url.hostname.includes('googleapis')) {
      event.respondWith(
        fetch(request)
          .catch(() => {
            // En cas d'échec, retourner une réponse vide pour les APIs
            return new Response(JSON.stringify({ offline: true }), {
              headers: { 'Content-Type': 'application/json' }
            });
          })
      );
      return;
    }
    return;
  }

  // Stratégie : Network First, puis Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre en cache la réponse réussie
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(async () => {
        // En cas d'échec réseau, chercher dans le cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Pour les pages HTML, retourner la page offline
        if (request.headers.get('accept')?.includes('text/html')) {
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }

        // Retourner une réponse d'erreur générique
        return new Response('Contenu non disponible hors-ligne', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Écouter les messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urls))
      .then(() => {
        event.ports[0].postMessage({ success: true });
      })
      .catch((error) => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }
});

// Synchronisation en arrière-plan (si supporté)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-answers') {
    event.waitUntil(syncAnswers());
  }
});

// Fonction de synchronisation des réponses
async function syncAnswers() {
  try {
    // Récupérer les données en attente de synchronisation
    const cache = await caches.open('bilan-easy-sync');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const data = await response.json();
        
        // Tenter de synchroniser avec le serveur
        try {
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          // Supprimer du cache de synchronisation après succès
          await cache.delete(request);
        } catch (error) {
          console.error('[SW] Échec de synchronisation:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Erreur lors de la synchronisation:', error);
  }
}

console.log('[SW] Service Worker chargé');
