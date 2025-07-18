import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userApi } from '@/services/userApi';
import type { User } from '../types';
import type { UserAttribute } from '@/types/user';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Cache for user attributes
  const attributesCache = ref<Map<string, { attributes: UserAttribute[]; timestamp: number }>>(new Map())
  
  // Cache expiration time (5 minutes)
  const CACHE_EXPIRY_TIME = 5 * 60 * 1000

  const isAuthenticated = computed(() => !!user.value);

  async function login(email: string, _password: string) {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulated login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      user.value = {
        id: '1',
        name: 'Demo User',
        email,
        plan: 'free',
        avatar: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      };
    } catch (e) {
      error.value = 'Login failed. Please try again.';
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
  }

  // Helper function to check if cache is valid
  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_EXPIRY_TIME
  }

  // Helper function to get cached attributes
  const getCachedAttributes = (userId: string) => {
    const cached = attributesCache.value.get(userId)
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.attributes
    }
    return null
  }

  // Helper function to set cached attributes
  const setCachedAttributes = (userId: string, attributes: UserAttribute[]) => {
    attributesCache.value.set(userId, {
      attributes,
      timestamp: Date.now()
    })
  }

  // Helper function to clear cache for a user
  const clearUserCache = (userId: string) => {
    attributesCache.value.delete(userId)
  }

  // Helper function to clear all cache
  const clearAllCache = () => {
    attributesCache.value.clear()
  }

  // Fetch user attributes with caching
  const fetchUserAttributes = async (userId: string, forceRefresh = false) => {
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cached = getCachedAttributes(userId)
      if (cached) {
        console.log('Using cached attributes for user:', userId)
        return { success: true, data: cached, fromCache: true }
      }
    }

    try {
      console.log('Fetching user attributes for user ID:', userId)
      const response = await userApi.getUserAttributes(userId)
      
      if (response.success && response.data) {
        // Cache the attributes
        setCachedAttributes(userId, response.data)
        console.log('✅ User attributes fetched and cached successfully:', response.data)
        return { ...response, fromCache: false }
      } else {
        console.error('❌ Failed to fetch user attributes:', response.message)
        return { ...response, fromCache: false }
      }
    } catch (error) {
      console.error('❌ Error fetching user attributes:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user attributes',
        data: [],
        fromCache: false
      }
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    // Cache management
    getCachedAttributes,
    setCachedAttributes,
    clearUserCache,
    clearAllCache,
    // Main method
    fetchUserAttributes
  };
});