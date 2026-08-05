// Service worker — cache para funcionamento offline
const CACHE = "postos-full-v259";
const ARQUIVOS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./logo-full.png", "./logo-transportadora.png", "./logo-conveniencia.png", "./mr-full-joinha.png", "./favicon.ico", "./favicon-32.png", "./apple-touch-icon.png", "./svg2pdf.umd.min.js"];

self.addEventListener("install", e => {
  // v219 - "reload" obriga a buscar na REDE. Com o addAll de antes, o navegador podia
  // entregar a copia que ele ja tinha em cache e o app nascia uma versao atrasado.
  // E um arquivo que falhe nao derruba mais a instalacao inteira (addAll e' tudo-ou-nada).
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      ARQUIVOS.map(u =>
        fetch(new Request(u, { cache: "reload" }))
          .then(r => (r && r.ok) ? c.put(u, r) : null)
          .catch(() => null)
      )
    ))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(chaves =>
      Promise.all(chaves.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: rede primeiro (pega atualizacoes), cache como reserva (offline)
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;                                  // v219 - POST nao se repete
  if (!e.request.url.startsWith(self.location.origin)) return;             // externos (Firebase, fontes)

  // v219 - ao ABRIR a pagina, revalidar com o servidor em vez de aceitar o cache do
  // navegador. "no-cache" manda a pergunta com o ETag: se nada mudou volta 304 (barato),
  // se mudou volta o arquivo novo. E o que faz a versao nova chegar na primeira recarga.
  const pedido = (e.request.mode === "navigate")
    ? new Request(e.request.url, { cache: "no-cache", credentials: "same-origin" })
    : e.request;

  e.respondWith(
    fetch(pedido)
      .then(resp => {
        // v219 - so guardar resposta BOA. Antes, um 404 ou um erro do servidor entrava
        // no cache e voltava depois como se fosse o app.
        if (resp && resp.ok && resp.type === "basic"){
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
