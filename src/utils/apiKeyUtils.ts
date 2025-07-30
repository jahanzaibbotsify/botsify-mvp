/**
 * Utility functions for API key management
 */

import { useRoleStore } from "@/stores/roleStore";

/**
 * Extracts API key from URL path or localStorage
 * @returns The API key if found, empty string otherwise
 */
export function extractApiKey(): string {
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(segment => segment.length > 0);
  
  // Try to get from localStorage first
  const storedApiKey = localStorage.getItem('bot_api_key');
  if (storedApiKey) {
    return storedApiKey;
  }
  
  // Extract from URL path
  // For routes like /agent/123, the API key is the second segment
  if (segments.length >= 2 && segments[0] === 'agent') {
    const apiKey = segments[1];
    localStorage.setItem('bot_api_key', apiKey);
    return apiKey;
  }
  
  // For other routes, try to find a valid API key pattern
  // Look for segments that might be API keys (alphanumeric, reasonable length)
  for (const segment of segments) {
    if (segment.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(segment)) {
      localStorage.setItem('bot_api_key', segment);
      return segment;
    }
  }
  
  return '';
}

/**
 * Gets the current API key from store or localStorage
 * @returns The API key if found, empty string otherwise
 */
export function getCurrentApiKey(): string {
  const storedApiKey = localStorage.getItem('bot_api_key');
  return storedApiKey || '';
}

/**
 * Sets the API key in localStorage
 * @param apiKey The API key to store
 */
export function setApiKey(apiKey: string): void {
  if (apiKey) {
    localStorage.setItem('bot_api_key', apiKey);
  }
}

/**
 * Clears the API key from localStorage
 */
export function clearApiKey(): void {
  localStorage.removeItem('bot_api_key');
}

/**
 * Validates if a string looks like a valid API key
 * @param apiKey The string to validate
 * @returns True if it looks like a valid API key
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return apiKey.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(apiKey);
}


// Cache for user role to avoid repeated store calls
let cachedUserRole: string | null = null;
let roleCacheExpiry: number = 0;
const ROLE_CACHE_DURATION = 5000; // 5 seconds

export function getDefaultRedirect() {
  // Check if API key exists in localStorage (fast operation)
  const storedApiKey = getCurrentApiKey();
  
  if (storedApiKey && storedApiKey !== 'undefined' && storedApiKey !== 'null') {
    // If API key exists, redirect to agent with that key
    return { name: 'agent', params: { id: storedApiKey } };
  }
  
  // Use cached role if available and not expired
  const now = Date.now();
  if (cachedUserRole && now < roleCacheExpiry) {
    if (cachedUserRole === 'live_chat_agent') {
      return { name: 'conversation' };
    } else {
      return { name: 'agent', params: { id: 'default' } };
    }
  }
  
  // Fallback: get role from store (this should be rare)
  try {
    const roleStore = useRoleStore();
    const isLiveChatAgent = roleStore.isLiveChatAgent;
    
    // Cache the result
    cachedUserRole = isLiveChatAgent ? 'live_chat_agent' : 'default';
    roleCacheExpiry = now + ROLE_CACHE_DURATION;
    
    if (isLiveChatAgent) {
      return { name: 'conversation' };
    } else {
      return { name: 'agent', params: { id: 'default' } };
    }
  } catch (error) {
    // If store is not available, default to agent
    console.warn('Role store not available, defaulting to agent route');
    return { name: 'agent', params: { id: 'default' } };
  }
}

// Function to clear role cache when user data changes
export function clearRoleCache() {
  cachedUserRole = null;
  roleCacheExpiry = 0;
}