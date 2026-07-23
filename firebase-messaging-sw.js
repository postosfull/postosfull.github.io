// Service worker do Firebase Cloud Messaging — recebe avisos push em segundo plano
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDrLMQkVGglzpjePhOJhMBqHWOfd4PnS2A",
  authDomain: "postos-full.firebaseapp.com",
  projectId: "postos-full",
  storageBucket: "postos-full.firebasestorage.app",
  messagingSenderId: "928545566820",
  appId: "1:928545566820:web:3feb3938ced30a2eddef71"
});

const messaging = firebase.messaging();

// Aviso recebido com o app fechado / em segundo plano
messaging.onBackgroundMessage(payload => {
  const d = (payload && payload.data) || {};
  const n = (payload && payload.notification) || {};
  const titulo = n.title || d.title || "Postos Full";
  const opcoes = {
    body: n.body || d.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || "postos-full-aviso",
    data: d
  };
  return self.registration.showNotification(titulo, opcoes);
});

// Ao tocar na notificação, abre ou foca o app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(lista => {
      for (const c of lista){ if ("focus" in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});
