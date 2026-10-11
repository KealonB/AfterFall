/* AFTERFALL v0.1.0 offline support. Bump the cache name for every published version. */
const CACHE = 'afterfall-v0.1.0';
const ASSETS = ['./','./index.html','./styles.css','./data.js','./game.js','./favicon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(name => name.startsWith('afterfall-')&&name!==CACHE).map(name=>caches.delete(name)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if(event.request.method!=='GET')return;
  const u=new URL(event.request.url);
  if(u.origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});}
    return res;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
