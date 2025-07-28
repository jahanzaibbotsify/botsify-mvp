import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userApi } from '@/services/userApi';
import type { User } from '@/types';
import type { 
  UserAttribute, 
  ActionType, 
  ApiUser,
  GetUsersParams
} from '@/types/user';

// Whitelabel data interface
interface WhitelabelData {
  company_name: string;
  primary_color: string;
  secondary_color: string;
  logo: string | null;
  favicon: string | null;
  domain: string | null;
  mask_url: string;
}

// Extended user type with UI-specific properties
export interface ExtendedUser extends Omit<ApiUser, 'status'> {
  selected: boolean;
  status: 'Active' | 'Inactive';
  hasConversation: boolean;
}

export const useUserDataStore = defineStore('userData', () => {
  // User authentication state
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // User management state
  const users = ref<ExtendedUser[]>([]);
  const selectedAction = ref<ActionType>('');
  const selectAll = ref<boolean>(false);
  const selectedUser = ref<User | null>(null);
  const showUserDetails = ref<boolean>(false);

  // Cache for user data
  const usersCache = ref<Map<string, { 
    users: ExtendedUser[], 
    pagination: any,
    timestamp: number 
  }>>(new Map());

  // Cache for user attributes
  const attributesCache = ref<Map<string, { 
    attributes: UserAttribute[], 
    timestamp: number 
  }>>(new Map());
  
  // Whitelabel state
  const isWhitelabelClient = ref(false);
  const whitelabelData = ref<WhitelabelData | null>(null);
  
  // Cache expiration time (5 minutes)
  const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

  // Computed properties
  const isAuthenticated = computed(() => !!user.value);

  const selectedUsersCount = computed<number>(() => {
    return users.value.filter(user => user.selected).length;
  });

  const hasSelectedUsers = computed(() => selectedUsersCount.value > 0);

  const selectedUserIds = computed<number[]>(() => {
    return users.value
      .filter(user => user.selected)
      .map(user => user.id);
  });

  // Cache utility functions
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_EXPIRY_TIME;
  };

  const generateCacheKey = (params: any): string => {
    return JSON.stringify(params);
  };

  const getCachedUsers = (cacheKey: string) => {
    const cached = usersCache.value.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached;
    }
    return null;
  };

  const setCachedUsers = (cacheKey: string, users: ExtendedUser[], pagination: any) => {
    usersCache.value.set(cacheKey, {
      users,
      pagination,
      timestamp: Date.now()
    });
  };

  const getCachedAttributes = (userId: string) => {
    const cached = attributesCache.value.get(userId);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.attributes;
    }
    return null;
  };

  const setCachedAttributes = (userId: string, attributes: UserAttribute[]) => {
    attributesCache.value.set(userId, {
      attributes,
      timestamp: Date.now()
    });
  };

  const clearUserCache = (userId: string) => {
    attributesCache.value.delete(userId);
  };

  const clearAllCache = () => {
    usersCache.value.clear();
    attributesCache.value.clear();
  };

  // Data transformation
  const transformApiUser = (apiUser: ApiUser): ExtendedUser => {
    return {
      ...apiUser,
      selected: false,
      status: apiUser.status === 1 ? 'Active' : 'Inactive',
      hasConversation: false // This would need to be determined based on actual data
    };
  };

  // API actions
  const fetchUsers = async (params: GetUsersParams = {}, forceRefresh = false): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      // Check cache first
      const cacheKey = generateCacheKey({ action: 'fetch_users', params });
      const cached = getCachedUsers(cacheKey);
      
      if (!forceRefresh && cached) {
        users.value = cached.users;
        console.log('📦 Using cached users data');
        return;
      }

      const response = await userApi.getUsers(params);
      
      if (response.success && response.data) {
        const transformedUsers = response.data.users.data.map(transformApiUser);
        users.value = transformedUsers;
        
        // Cache the result
        setCachedUsers(cacheKey, transformedUsers, response.data.users);
        
        console.log('✅ Fetched users:', transformedUsers.length);
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      console.error('❌ Error fetching users:', err);
      error.value = err.message || 'Failed to fetch users';
    } finally {
      loading.value = false;
    }
  };

  const fetchUserAttributes = async (userId: string, forceRefresh = false): Promise<UserAttribute[]> => {
    try {
      // Check cache first
      const cached = getCachedAttributes(userId);
      if (!forceRefresh && cached) {
        console.log('📦 Using cached user attributes');
        return cached;
      }

      const response = await userApi.getUserAttributes(userId);
      
      if (response.success && response.data) {
        const attributes = response.data || [];
        
        // Cache the result
        setCachedAttributes(userId, attributes);
        
        console.log('✅ Fetched user attributes:', attributes.length);
        return attributes;
      } else {
        throw new Error(response.message || 'Failed to fetch user attributes');
      }
    } catch (err: any) {
      console.error('❌ Error fetching user attributes:', err);
      throw err;
    }
  };

  // Selection actions
  const handleSelectionChange = (type: 'all' | 'single', value?: boolean | number): void => {
    if (type === 'all') {
      const selectValue = value as boolean;
      selectAll.value = selectValue;
      users.value.forEach(user => {
        user.selected = selectValue;
      });
    } else {
      const userId = value as number;
      const user = users.value.find(u => u.id === userId);
      if (user) {
        user.selected = !user.selected;
        // Update selectAll based on individual selections
        selectAll.value = users.value.every(u => u.selected);
      }
    }
  };

  const clearSelection = (): void => {
    selectAll.value = false;
    users.value.forEach(user => {
      user.selected = false;
    });
  };

  // User actions
  const executeUserAction = async (action: ActionType, userIds: number[]): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await userApi.executeUserAction(action, userIds);
      
      if (response.success) {
        console.log(`✅ Executed ${action} for users:`, userIds);
        
        // Clear cache for affected users
        userIds.forEach(userId => clearUserCache(userId.toString()));
        
        // Refresh users list
        await fetchUsers({}, true);
        
        // Clear selection
        clearSelection();
      } else {
        throw new Error(response.message || `Failed to execute ${action}`);
      }
    } catch (err: any) {
      console.error(`❌ Error executing ${action}:`, err);
      error.value = err.message || `Failed to execute ${action}`;
    } finally {
      loading.value = false;
    }
  };

  // Authentication actions
  async function login(email: string, password: string): Promise<boolean> {
    try {
      loading.value = true;
      error.value = null;

      const response = await userApi.login(email, password);
      
      if (response.success && response.data) {
        user.value = response.data.user;
        console.log('✅ User logged in successfully');
        return true;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      error.value = err.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout(): void {
    user.value = null;
    clearAllCache();
    console.log('✅ User logged out');
  }

  // Whitelabel functions
  function setWhitelabelData(data: { is_whitelabel_client: boolean; whitelabel: WhitelabelData }) {
    isWhitelabelClient.value = data.is_whitelabel_client;
    whitelabelData.value = data.whitelabel;

    // Apply whitelabel colors to CSS custom properties
    if (data.is_whitelabel_client && data.whitelabel) {
      applyWhitelabelColors(data.whitelabel);
      applyWhitelabelFavicon(data.whitelabel.favicon);
    }
  }

  // Apply whitelabel colors to CSS variables
  function applyWhitelabelColors(whitelabel: WhitelabelData) {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', whitelabel.primary_color);
    root.style.setProperty('--color-primary-hover', adjustColor(whitelabel.primary_color, 20));
    root.style.setProperty('--color-primary-active', adjustColor(whitelabel.primary_color, -20));
    root.style.setProperty('--color-secondary', whitelabel.secondary_color);
  }

  // Apply whitelabel favicon
  function applyWhitelabelFavicon(favicon: string | null) {
    if (favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }

  // Helper function to adjust color brightness
  function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Whitelabel computed properties
  const companyName = computed(() => whitelabelData.value?.company_name || 'Botsify');
  const primaryColor = computed(() => whitelabelData.value?.primary_color || '#00A3FF');
  const secondaryColor = computed(() => whitelabelData.value?.secondary_color || '#10B981');
  const logo = computed(() => whitelabelData.value?.logo || null);
  const favicon = computed(() => whitelabelData.value?.favicon || null);
  const maskUrl = computed(() => whitelabelData.value?.mask_url || '');

  return {
    // State
    user,
    loading,
    error,
    users,
    selectedAction,
    selectAll,
    selectedUser,
    showUserDetails,
    
    // Whitelabel state
    isWhitelabelClient,
    whitelabelData,
    
    // Computed
    isAuthenticated,
    selectedUsersCount,
    hasSelectedUsers,
    selectedUserIds,
    
    // Whitelabel computed
    companyName,
    primaryColor,
    secondaryColor,
    logo,
    favicon,
    maskUrl,
    
    // Actions
    fetchUsers,
    fetchUserAttributes,
    handleSelectionChange,
    clearSelection,
    executeUserAction,
    login,
    logout,
    
    // Whitelabel actions
    setWhitelabelData,
    applyWhitelabelColors,
    applyWhitelabelFavicon,
    
    // Cache management
    clearUserCache,
    clearAllCache,
    isCacheValid,
    generateCacheKey,
    getCachedUsers,
    setCachedUsers,
    getCachedAttributes,
    setCachedAttributes
  };
}); 