/**
 * Utility functions for API key management
 */

/**
 * Extracts API key from URL path or localStorage
 * @returns The API key if found, empty string otherwise
 */
export function extractApiKey(): string {
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(segment => segment.length > 0);
  
  // Try to get from localStorage first
  const storedApiKey = localStorage.getItem('bot_api_key');
  
  // Extract from URL path
  // For routes like /agent/123, the API key is the second segment
  if (segments.length >= 2 && segments[0] === 'agent') {
    const apiKey = segments[1];
    
    // Check if URL API key is different from localStorage
    if (apiKey && apiKey !== storedApiKey && apiKey !== 'undefined' && apiKey !== 'null') {
      console.log('🔄 ApiKeyUtils: URL API key differs from localStorage, updating...', {
        urlApiKey: apiKey,
        storedApiKey
      });
      localStorage.setItem('bot_api_key', apiKey);
      console.log('✅ ApiKeyUtils: API key updated from URL:', apiKey);
      return apiKey;
    } else if (apiKey && (!storedApiKey || storedApiKey === 'undefined' || storedApiKey === 'null')) {
      localStorage.setItem('bot_api_key', apiKey);
      console.log('🔑 ApiKeyUtils: API key set from URL:', apiKey);
      return apiKey;
    } else if (storedApiKey) {
      return storedApiKey;
    }
  }
  
  // For other routes, try to find a valid API key pattern
  // Look for segments that might be API keys (alphanumeric, reasonable length)
  for (const segment of segments) {
    if (segment.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(segment)) {
      // Check if URL API key is different from localStorage
      if (segment && segment !== storedApiKey && segment !== 'undefined' && segment !== 'null') {
        console.log('🔄 ApiKeyUtils: URL API key differs from localStorage, updating...', {
          urlApiKey: segment,
          storedApiKey
        });
        localStorage.setItem('bot_api_key', segment);
        console.log('✅ ApiKeyUtils: API key updated from URL:', segment);
        return segment;
      } else if (segment && (!storedApiKey || storedApiKey === 'undefined' || storedApiKey === 'null')) {
        localStorage.setItem('bot_api_key', segment);
        console.log('🔑 ApiKeyUtils: API key set from URL:', segment);
        return segment;
      }
    }
  }
  
  // Return stored API key if available
  return storedApiKey || '';
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