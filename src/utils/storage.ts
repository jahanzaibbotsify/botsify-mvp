/**
 * Centralized Storage Management
 * Handles localStorage operations, caching, and real-time data management
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface StorageConfig {
  prefix: string;
  defaultTTL: number;
  maxSize?: number;
}

class StorageManager {
  private prefix: string;
  private defaultTTL: number;
  private maxSize: number;
  private cache = new Map<string, CacheEntry>();

  constructor(config: StorageConfig) {
    this.prefix = config.prefix;
    this.defaultTTL = config.defaultTTL;
    this.maxSize = config.maxSize || 50; // Default max cache entries
  }

  /**
   * Check if localStorage is available and working
   */
  isAvailable(): boolean {
    try {
      const testKey = `${this.prefix}_test`;
      localStorage.setItem(testKey, 'test');
      const result = localStorage.getItem(testKey) === 'test';
      localStorage.removeItem(testKey);
      return result;
    } catch {
      return false;
    }
  }

  /**
   * Get item from localStorage with optional caching
   */
  get<T>(key: string, useCache = true): T | null {
    const fullKey = `${this.prefix}_${key}`;
    
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(fullKey);
      if (cached && this.isValid(cached)) {
        return cached.data;
      }
    }

    // Get from localStorage
    try {
      const item = localStorage.getItem(fullKey);
      if (item) {
        const parsed = JSON.parse(item);
        
        // Cache the result
        if (useCache) {
          this.setCache(fullKey, parsed);
        }
        
        return parsed;
      }
    } catch (error) {
      console.error(`Error reading from localStorage: ${fullKey}`, error);
    }
    
    return null;
  }

  /**
   * Set item in localStorage with optional caching
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const fullKey = `${this.prefix}_${key}`;
    
    try {
      localStorage.setItem(fullKey, JSON.stringify(value));
      
      // Cache the result
      this.setCache(fullKey, value, ttl);
    } catch (error) {
      console.error(`Error writing to localStorage: ${fullKey}`, error);
      this.handleStorageError(error);
    }
  }

  /**
   * Remove item from localStorage and cache
   */
  remove(key: string): void {
    const fullKey = `${this.prefix}_${key}`;
    
    try {
      localStorage.removeItem(fullKey);
      this.cache.delete(fullKey);
    } catch (error) {
      console.error(`Error removing from localStorage: ${fullKey}`, error);
    }
  }

  /**
   * Clear all items with this prefix
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      this.cache.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  /**
   * Get all keys with this prefix
   */
  keys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(`${this.prefix}_`, ''));
    } catch {
      return [];
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Set cache entry
   */
  private setCache<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  /**
   * Handle storage errors (e.g., quota exceeded)
   */
  private handleStorageError(error: any): void {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, clearing old data');
      this.clearOldEntries();
    }
  }

  /**
   * Clear old cache entries
   */
  private clearOldEntries(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        if (key) {
          this.cache.delete(key)
        }
      }
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): { size: number; keys: string[]; cacheSize: number } {
    return {
      size: this.keys().length,
      keys: this.keys(),
      cacheSize: this.cache.size
    }
  }
}

// Create specialized storage managers
export const apiKeyStorage = new StorageManager({
  prefix: 'bot_api',
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 10
});

export const chatStorage = new StorageManager({
  prefix: 'chat',
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100
});

export const userStorage = new StorageManager({
  prefix: 'user',
  defaultTTL: 15 * 60 * 1000, // 15 minutes
  maxSize: 20
});

export const cacheStorage = new StorageManager({
  prefix: 'cache',
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  maxSize: 50
});

// Real-time message management
export class MessageManager {
  private messageQueue: Array<{ id: string; data: any; timestamp: number }> = [];
  private maxQueueSize = 1000;
  private flushInterval: number | null = null;

  constructor() {
    this.startAutoFlush();
  }

  /**
   * Add message to queue for batch processing
   */
  addMessage(id: string, data: any): void {
    this.messageQueue.push({
      id,
      data,
      timestamp: Date.now()
    });

    // Remove old messages if queue is too large
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue = this.messageQueue.slice(-this.maxQueueSize / 2);
    }
  }

  /**
   * Flush messages to storage
   */
  flush(): void {
    if (this.messageQueue.length === 0) return;

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    try {
      const existing = chatStorage.get<Array<{ id: string; data: any; timestamp: number }>>('messages') || [];
      const updated = [...existing, ...messages];
      
      // Keep only last 1000 messages
      const trimmed = updated.slice(-1000);
      
      chatStorage.set('messages', trimmed);
    } catch (error) {
      console.error('Error flushing messages:', error);
    }
  }

  /**
   * Start automatic flushing
   */
  private startAutoFlush(): void {
    this.flushInterval = window.setInterval(() => {
      this.flush();
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Stop automatic flushing
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush(); // Final flush
  }

  /**
   * Get message queue size
   */
  getQueueSize(): number {
    return this.messageQueue.length;
  }
}

export const messageManager = new MessageManager(); 