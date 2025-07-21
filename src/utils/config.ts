export const APP_URL = import.meta.env.VITE_APP_URL || 'https://agentic.botsify.com';
export const BOTSIFY_WEB_URL = import.meta.env.VITE_BOTSIFY_URL || 'https://botsify.com';
export const BOTSIFY_BASE_URL = `${import.meta.env.VITE_BOTSIFY_URL}/api` || 'https://botsify.com/api';
export const BOTSIFY_AUTH_TOKEN = import.meta.env.VITE_BOTSIFY_AUTH_TOKEN || '';
export const BOTSIFY_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// VAPID public key for push notifications
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
