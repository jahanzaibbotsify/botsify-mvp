export const APP_URL = import.meta.env.VITE_APP_URL || 'https://agentic.botsify.com';
export const BOTSIFY_WEB_URL = import.meta.env.VITE_BOTSIFY_URL || 'https://dev.botsify.com';
export const BOTSIFY_BASE_URL = `${import.meta.env.VITE_BOTSIFY_URL}/api` || 'https://botsify.com/api';
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

export const STRIPE_API_KEY = import.meta.env.VITE_BOTSIFY_STRIPE_API_KEY;
//export const BOTSIFY_AUTH_TOKEN = getCookieValue('botsify_token');
export const BOTSIFY_AUTH_TOKEN = getInitialToken();

export function getCookieValue(name: string): string {
  // Handle case where document is not available (SSR)
  if (typeof document === 'undefined') {
    return '';
  }
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  // Check if the cookie was actually found (split occurred)
  if (parts.length === 2) {
    const cookieValue = parts.pop()!.split(';')[0];
    return cookieValue;
  }
  
  return ''; // Cookie not found
}

export function getInitialToken(): string | null {
    const token = localStorage.getItem('accessToken');
    return token ? JSON.parse(token) : null;
}

/**
 * Check if the current URL matches BOTSIFY_WEB_URL
 */
export function isBotsifyWebUrl(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.origin === BOTSIFY_WEB_URL
}