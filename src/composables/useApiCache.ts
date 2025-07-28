import { ref, computed } from 'vue';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  keyPrefix?: string; // Prefix for cache keys
}

export interface ApiCacheConfig {
  defaultTtl: number;
  maxSize: number;
  keyPrefix: string;
}

export function useApiCache<T = any>(options: CacheOptions = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    maxSize = 100,
    keyPrefix = 'api_cache_'
  } = options;

  const cache = ref<Map<string, CacheEntry<T>>>(new Map());
  const config: ApiCacheConfig = {
    defaultTtl: ttl,
    maxSize,
    keyPrefix
  };

  // Generate cache key
  const generateKey = (endpoint: string, params?: Record<string, any>): string => {
    const paramString = params ? JSON.stringify(params) : '';
    return `${keyPrefix}${endpoint}_${paramString}`;
  };

  // Check if cache entry is valid
  const isEntryValid = (entry: CacheEntry<T>): boolean => {
    return Date.now() < entry.expiresAt;
  };

  // Get cached data
  const getCached = (endpoint: string, params?: Record<string, any>): T | null => {
    const key = generateKey(endpoint, params);
    const entry = cache.value.get(key);
    
    if (!entry || !isEntryValid(entry)) {
      // Remove expired entry
      if (entry) {
        cache.value.delete(key);
      }
      return null;
    }
    
    return entry.data;
  };

  // Set cached data
  const setCached = (endpoint: string, data: T, params?: Record<string, any>, customTtl?: number): void => {
    const key = generateKey(endpoint, params);
    const now = Date.now();
    const entryTtl = customTtl || config.defaultTtl;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + entryTtl
    };

    // Remove oldest entries if cache is full
    if (cache.value.size >= config.maxSize) {
      const oldestKey = Array.from(cache.value.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      cache.value.delete(oldestKey);
    }

    cache.value.set(key, entry);
  };

  // Clear specific cache entry
  const clearCached = (endpoint: string, params?: Record<string, any>): boolean => {
    const key = generateKey(endpoint, params);
    return cache.value.delete(key);
  };

  // Clear all cache
  const clearAllCache = (): void => {
    cache.value.clear();
  };

  // Clear expired entries
  const clearExpired = (): number => {
    let clearedCount = 0;
    const now = Date.now();
    
    for (const [key, entry] of cache.value.entries()) {
      if (now >= entry.expiresAt) {
        cache.value.delete(key);
        clearedCount++;
      }
    }
    
    return clearedCount;
  };

  // Get cache statistics
  const getCacheStats = computed(() => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const entry of cache.value.values()) {
      if (now < entry.expiresAt) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      totalEntries: cache.value.size,
      validEntries,
      expiredEntries,
      maxSize: config.maxSize,
      usagePercentage: (cache.value.size / config.maxSize) * 100
    };
  });

  // Wrapper for API calls with caching
  const cachedApiCall = async <R = T>(
    endpoint: string,
    apiCall: () => Promise<R>,
    params?: Record<string, any>,
    customTtl?: number
  ): Promise<R> => {
    // Check cache first
    const cached = getCached(endpoint, params);
    if (cached !== null) {
      console.log(`📦 Cache hit for ${endpoint}`);
      return cached as R;
    }

    // Make API call
    console.log(`🌐 API call for ${endpoint}`);
    const data = await apiCall();
    
    // Cache the result
    setCached(endpoint, data as T, params, customTtl);
    
    return data;
  };

  // Preload cache with data
  const preloadCache = (endpoint: string, data: T, params?: Record<string, any>, customTtl?: number): void => {
    setCached(endpoint, data, params, customTtl);
  };

  // Get all cache keys
  const getCacheKeys = computed(() => {
    return Array.from(cache.value.keys());
  });

  // Check if endpoint is cached
  const isCached = (endpoint: string, params?: Record<string, any>): boolean => {
    const key = generateKey(endpoint, params);
    const entry = cache.value.get(key);
    return entry ? isEntryValid(entry) : false;
  };

  // Get cache entry info
  const getCacheInfo = (endpoint: string, params?: Record<string, any>) => {
    const key = generateKey(endpoint, params);
    const entry = cache.value.get(key);
    
    if (!entry) {
      return null;
    }
    
    return {
      key,
      timestamp: entry.timestamp,
      expiresAt: entry.expiresAt,
      isValid: isEntryValid(entry),
      age: Date.now() - entry.timestamp,
      ttl: entry.expiresAt - Date.now()
    };
  };

  return {
    // Core functions
    getCached,
    setCached,
    clearCached,
    clearAllCache,
    clearExpired,
    isCached,
    getCacheInfo,
    
    // Wrapper function
    cachedApiCall,
    
    // Utility functions
    preloadCache,
    generateKey,
    
    // Computed
    getCacheStats,
    getCacheKeys,
    
    // Configuration
    config
  };
}

// Specialized cache composables for common use cases
export function useUserCache() {
  return useApiCache<any>({
    ttl: 10 * 60 * 1000, // 10 minutes for user data
    maxSize: 50,
    keyPrefix: 'user_cache_'
  });
}

export function useChatCache() {
  return useApiCache<any>({
    ttl: 2 * 60 * 1000, // 2 minutes for chat data
    maxSize: 100,
    keyPrefix: 'chat_cache_'
  });
}

export function useConversationCache() {
  return useApiCache<any>({
    ttl: 5 * 60 * 1000, // 5 minutes for conversation data
    maxSize: 200,
    keyPrefix: 'conversation_cache_'
  });
} 