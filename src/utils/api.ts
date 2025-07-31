/**
 * Consolidated API Utilities
 * Handles API key management, HTTP client configuration, and API operations
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BOTSIFY_AUTH_TOKEN, BOTSIFY_BASE_URL } from './config';
import { apiKeyStorage } from './storage';

// API Key Management
export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private currentKey: string | null = null;

  private constructor() {}

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  /**
   * Extract API key from URL path or localStorage
   */
  extractFromUrl(): string {
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(segment => segment.length > 0);
    
    // Try to get from storage first
    const storedKey = this.getCurrent();
    if (storedKey) {
      return storedKey;
    }
    
    // Extract from URL path
    if (segments.length >= 2 && segments[0] === 'agent') {
      const apiKey = segments[1];
      this.set(apiKey);
      return apiKey;
    }
    
    // Look for valid API key pattern in URL segments
    for (const segment of segments) {
      if (this.isValidFormat(segment)) {
        this.set(segment);
        return segment;
      }
    }
    
    return '';
  }

  /**
   * Get current API key
   */
  getCurrent(): string {
    if (this.currentKey) {
      return this.currentKey;
    }
    
    const stored = apiKeyStorage.get('key') as string | null;
    if (stored) {
      this.currentKey = stored;
      return stored;
    }
    
    return '';
  }

  /**
   * Set API key and update localStorage
   */
  set(apiKey: string): void {
    if (apiKey && this.isValidFormat(apiKey)) {
      this.currentKey = apiKey;
      apiKeyStorage.set('key', apiKey);
    }
  }

  /**
   * Clear API key
   */
  clear(): void {
    this.currentKey = null;
    apiKeyStorage.remove('key');
  }

  /**
   * Validate API key format
   */
  isValidFormat(apiKey: string): boolean {
    return apiKey.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(apiKey);
  }

  /**
   * Check if API key is valid and available
   */
  isValid(): boolean {
    const key = this.getCurrent();
    return key.length > 0 && this.isValidFormat(key);
  }

  getDefaultRedirect(): string {
    const apiKey = this.getCurrent();
    return apiKey ? `/agent/${apiKey}` : '/agent/default';
  }
}

// HTTP Client Configuration
export class HttpClient {
  private static instance: HttpClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: BOTSIFY_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOTSIFY_AUTH_TOKEN}`
      }
    });

    this.setupInterceptors();
  }

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const apiKey = ApiKeyManager.getInstance().getCurrent();
        if (apiKey && config.params) {
          config.params.apikey = apiKey;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.error('Unauthorized access, redirecting to login');
          window.location.href = '/unauthenticated';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the axios instance
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }
}

// API Operations
export class ApiOperations {
  private static instance: ApiOperations;
  private httpClient: HttpClient;
  private apiKeyManager: ApiKeyManager;

  private constructor() {
    this.httpClient = HttpClient.getInstance();
    this.apiKeyManager = ApiKeyManager.getInstance();
  }

  static getInstance(): ApiOperations {
    if (!ApiOperations.instance) {
      ApiOperations.instance = new ApiOperations();
    }
    return ApiOperations.instance;
  }

  /**
   * Get bot details with caching
   */
  async getBotDetails(): Promise<any> {
    const apiKey = this.apiKeyManager.getCurrent();
    if (!apiKey) {
      throw new Error('No API key available');
    }

    try {
      const data = await this.httpClient.get(`/v1/bot/get-data?apikey=${apiKey}`);
      return data;
    } catch (error) {
      console.error('Error fetching bot details:', error);
      throw error;
    }
  }

  /**
   * Send chat message
   */
  async sendMessage(message: any): Promise<any> {
    const apiKey = this.apiKeyManager.getCurrent();
    if (!apiKey) {
      throw new Error('No API key available');
    }

    try {
      const data = await this.httpClient.post('/v1/chat/send', {
        ...message,
        apikey: apiKey
      });
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get user data
   */
  async getUserData(): Promise<any> {
    const apiKey = this.apiKeyManager.getCurrent();
    if (!apiKey) {
      throw new Error('No API key available');
    }

    try {
      const data = await this.httpClient.get(`/v1/user/data?apikey=${apiKey}`);
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
}

// Export singleton instances
export const apiKeyManager = ApiKeyManager.getInstance();
export const httpClient = HttpClient.getInstance();
export const apiOperations = ApiOperations.getInstance();

// Legacy exports for backward compatibility
export const axiosInstance = httpClient.getInstance();
export const extractApiKey = () => apiKeyManager.extractFromUrl();
export const getCurrentApiKey = () => apiKeyManager.getCurrent();
export const setApiKey = (key: string) => apiKeyManager.set(key);
export const clearApiKey = () => apiKeyManager.clear();
export const getDefaultRedirect = () => apiKeyManager.getDefaultRedirect();
export const isValidApiKeyFormat = (key: string) => apiKeyManager.isValidFormat(key);