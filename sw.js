const CACHE='challenge-arena-v15';
const ASSETS=['./','./index.html','./style.css','./script.js','./ai-challenges.js','./admin-panel.js','./mobile-security.js','./arena-rush.js','./arena-rush-v2.js','./arena-rush-v3.js','./manifest.webmanifest','./privacy.html','./terms.html'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('./')))));