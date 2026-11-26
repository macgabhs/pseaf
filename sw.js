/* AWN PSEAF Field App service worker.
   Updates install automatically:
   - The app files (page, app.js, manifest) are fetched network-first,
     bypassing the browser cache, so a phone with signal always gets the
     latest release. The cached copy is only used when offline or when
     the network takes longer than 4 seconds.
   - BUILD changes on every release, so phones detect the new worker,
     install it straight away and hand control to it; the app then
     reloads itself at a safe moment.
   BUILD is set by the build script. If you edit files by hand, change it. */
const BUILD = '1.4-20261126172500';
const CACHE = 'awn-pseaf-' + BUILD;
const CORE = ['./', './index.html', './app.js', './manifest.webmanifest'];
const ICONS = ['./icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
const TIMEOUT_MS = 4000;

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      /* cache:'reload' skips the HTTP cache so a release is never
         installed with stale files from GitHub Pages' 10 minute cache. */
      return Promise.all(CORE.concat(ICONS).map(function(u){
        return fetch(new Request(u, { cache:'reload' })).then(function(res){
          if(!res.ok){ throw new Error('Could not fetch ' + u); }
          return c.put(u, res);
        });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k.indexOf('awn-pseaf-') === 0 && k !== CACHE; })
        .map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('message', function(e){
  if(e.data === 'version' && e.source){ e.source.postMessage({ type:'version', build:BUILD }); }
});

function isCore(url){
  const p = url.pathname;
  return p.endsWith('/') || p.endsWith('/index.html') || p.endsWith('/app.js') || p.endsWith('/manifest.webmanifest');
}

/* Network first, no HTTP cache, with a timeout and an offline fallback. */
function networkFirst(req, key){
  return new Promise(function(resolve){
    let done = false;
    const fallback = function(){
      caches.match(key, { ignoreSearch:true }).then(function(hit){
        if(done){ return; }
        if(hit){ done = true; resolve(hit); }
      });
    };
    const timer = setTimeout(fallback, TIMEOUT_MS);
    fetch(req, { cache:'no-store' }).then(function(res){
      clearTimeout(timer);
      if(res.ok){
        const copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(key, copy); });
      }
      if(!done){ done = true; resolve(res); }
    }).catch(function(){
      clearTimeout(timer);
      caches.match(key, { ignoreSearch:true }).then(function(hit){
        if(done){ return; }
        done = true;
        resolve(hit || caches.match('./index.html').then(function(r){ return r || Response.error(); }));
      });
    });
  });
}

self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET'){ return; }
  const url = new URL(req.url);
  if(url.origin !== self.location.origin){ return; }

  if(req.mode === 'navigate'){
    e.respondWith(networkFirst(req, './index.html'));
    return;
  }
  if(isCore(url)){
    e.respondWith(networkFirst(req, req));
    return;
  }
  /* Icons and anything else: cache first. */
  e.respondWith(
    caches.match(req).then(function(hit){
      return hit || fetch(req).then(function(res){
        if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
        return res;
      });
    })
  );
});
