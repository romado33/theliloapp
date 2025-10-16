import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { FORCE_REBUILD_TOKEN, reactVersion } from './forceRebuild'

// Diagnostic: Check for duplicate React instances
import { version } from 'react'
console.log('🏗️ Build ID:', import.meta.env.VITE_BUILD_ID)
console.log('⚛️ React version:', version, reactVersion)
console.log('📦 React instance:', React)
console.log('🔄 Force rebuild token:', FORCE_REBUILD_TOKEN)

// CRITICAL: Unregister any stale service workers that might be caching old chunks
if ('serviceWorker' in navigator) {
  console.log('🧹 Cleaning up service workers...');
  navigator.serviceWorker.getRegistrations().then((regs) => {
    console.log(`Found ${regs.length} service worker(s) to unregister`);
    for (const r of regs) {
      r.unregister().then(() => console.log('✅ SW unregistered:', r.scope));
    }
  }).catch((err) => console.error('Failed to unregister SW:', err));
  
  // Clear all caches created by service workers
  if (window.caches?.keys) {
    caches.keys().then(keys => {
      console.log(`🗑️ Deleting ${keys.length} cache(s):`, keys);
      return Promise.all(keys.map(k => caches.delete(k)));
    }).then(() => console.log('✅ All caches cleared'))
      .catch((err) => console.error('Failed to clear caches:', err));
  }
}

// TODO: Re-enable service worker registration after cache is clean
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error('#root element not found');

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
