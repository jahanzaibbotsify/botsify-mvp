import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userApi } from '@/services/userApi';
import type { User } from '../types';
import type { 
  UserAttribute, 
  ActionType, 
  FilterType, 
  SegmentType, 
  SortBy, 
  SortOrder, 
  PerPage,
  PaginationData,
  SortingData,
  ApiUser
} from '@/types/user';

// User filter state interface
export interface UserFilterState {
  search: string
  filter: FilterType
  segment: SegmentType
  dateRange: {
    startDate: Date | null
    endDate: Date | null
  }
  page: number
  perPage: PerPage
  sortBy: SortBy
  sortOrder: SortOrder
}

// Extended user type with UI-specific properties
export interface ExtendedUser extends Omit<ApiUser, 'status'> {
  selected: boolean
  status: 'Active' | 'Inactive'
  hasConversation: boolean
}

export const useUserStore = defineStore('user', () => {
  // User authentication state
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // User management state
  const users = ref<ExtendedUser[]>([])
  const selectedAction = ref<ActionType>('')
  const selectAll = ref<boolean>(false)
  const selectedUser = ref<User | null>(null)
  const showUserDetails = ref<boolean>(false)

  // Filter state
  const filterState = ref<UserFilterState>({
    search: '',
    filter: 'all',
    segment: 'all',
    dateRange: {
      startDate: null,
      endDate: null
    },
    page: 1,
    perPage: 20,
    sortBy: 'id',
    sortOrder: 'desc'
  })

  // Pagination and sorting state
  const pagination = ref<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 20
  })

  const sorting = ref<SortingData>({
    sortBy: 'id',
    sortOrder: 'desc'
  })

  // Cache for user data
  const usersCache = ref<Map<string, { 
    users: ExtendedUser[], 
    pagination: PaginationData,
    timestamp: number 
  }>>(new Map())

  // Cache for user attributes
  const attributesCache = ref<Map<string, { 
    attributes: UserAttribute[], 
    timestamp: number 
  }>>(new Map())
  
  // Cache expiration time (5 minutes)
  const CACHE_EXPIRY_TIME = 5 * 60 * 1000

  // Computed properties
  const isAuthenticated = computed(() => !!user.value);

  const selectedUsersCount = computed<number>(() => {
    return users.value.filter(user => user.selected).length
  })

  // Helper function to check if cache is valid
  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_EXPIRY_TIME
  }

  // Helper function to generate cache key
  const generateCacheKey = (params: any) => {
    return JSON.stringify(params)
  }

  // Helper function to get cached users
  const getCachedUsers = (cacheKey: string) => {
    const cached = usersCache.value.get(cacheKey)
    if (cached && isCacheValid(cached.timestamp)) {
      return cached
    }
    return null
  }

  // Helper function to set cached users
  const setCachedUsers = (cacheKey: string, users: ExtendedUser[], pagination: PaginationData) => {
    usersCache.value.set(cacheKey, {
      users,
      pagination,
      timestamp: Date.now()
    })
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
    usersCache.value.clear()
    attributesCache.value.clear()
  }

  // Convert filter state to API parameters
  const toApiParams = () => {
    const params: any = {
      page: filterState.value.page,
      per_page: filterState.value.perPage,
      sortby: filterState.value.sortBy,
      sortorder: filterState.value.sortOrder
    }

    // Add search query
    if (filterState.value.search) {
      params.query = filterState.value.search
    }

    // Add status filter
    if (filterState.value.filter !== 'all') {
      params.status = filterState.value.filter === 'active' ? '1' : '0'
    }

    // Add segment filter
    if (filterState.value.segment !== 'all') {
      const segmentMap: Record<string, number> = {
        sms: -2,
        whatsapp: -3,
        facebook: -4,
        website: -5,
        instagram: -6,
        telegram: -7
      }
      params.segment_id = segmentMap[filterState.value.segment]
    }

    // Add date range in the correct format
    if (filterState.value.dateRange.startDate && filterState.value.dateRange.endDate) {
      const startDate = filterState.value.dateRange.startDate.toISOString().split('T')[0].replace(/-/g, '/')
      const endDate = filterState.value.dateRange.endDate.toISOString().split('T')[0].replace(/-/g, '/')
      params.date = `${startDate}-${endDate}`
    }

    return params
  }

  // Transform API user to extended user
  const transformApiUser = (apiUser: ApiUser): ExtendedUser => {
    return {
      ...apiUser,
      selected: false,
      status: apiUser.active_for_bot === 1 ? 'Active' : 'Inactive',
      hasConversation: Boolean(apiUser.last_converse)
    }
  }

  // Fetch users with caching
  const fetchUsers = async (forceRefresh = false): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const params = toApiParams()
      const cacheKey = generateCacheKey(params)
      
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = getCachedUsers(cacheKey)
        if (cached) {
          console.log('Using cached users data')
          users.value = cached.users
          pagination.value = cached.pagination
          loading.value = false
          return
        }
      }
      
      console.log('Fetching users with params:', params)
      const response = await userApi.getUsers(params)
      
      if (response.success) {
        // Transform API data to extended users
        const transformedUsers = response.data.users.data.map(transformApiUser)
        users.value = transformedUsers
        
        // Update pagination from API response
        if (response.data.users) {
          pagination.value = {
            currentPage: response.data.users.current_page,
            totalPages: response.data.users.last_page,
            totalItems: response.data.users.total,
            perPage: response.data.users.per_page as PerPage
          }
        }
        
        // Cache the results
        setCachedUsers(cacheKey, transformedUsers, pagination.value)
        
        console.log('✅ Users fetched and cached successfully')
      } else {
        console.error('Failed to fetch users:', response.message)
        error.value = response.message || 'Failed to fetch users'
        users.value = []
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      error.value = 'An error occurred while fetching users'
      users.value = []
    } finally {
      loading.value = false
    }
  }

  // Update filter state
  const updateFilter = (updates: Partial<UserFilterState>) => {
    Object.assign(filterState.value, updates)
    
    // Reset page if any filter other than page/perPage changed
    const hasNonPageChanges = Object.keys(updates).some(key => key !== 'page' && key !== 'perPage')
    if (hasNonPageChanges) {
      filterState.value.page = 1
    }
    
    // Fetch users with new filters
    fetchUsers()
  }

  // Update search with debouncing
  const updateSearch = (search: string) => {
    filterState.value.search = search
    
    // Clear existing timeout
    if ((window as any).searchTimeout) {
      clearTimeout((window as any).searchTimeout)
    }
    
    // Set new timeout
    ;(window as any).searchTimeout = setTimeout(() => {
      filterState.value.page = 1
      fetchUsers()
    }, 500)
  }

  // Update sorting
  const updateSorting = (sortBy: SortBy, sortOrder: SortOrder) => {
    filterState.value.sortBy = sortBy
    filterState.value.sortOrder = sortOrder
    filterState.value.page = 1
    fetchUsers()
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      filterState.value.page = page
      fetchUsers()
    }
  }

  const handlePerPageChange = (perPage: PerPage) => {
    filterState.value.perPage = perPage
    filterState.value.page = 1
    fetchUsers()
  }

  // Handle selection changes
  const handleSelectionChange = (type: 'all' | 'single', value?: boolean | number): void => {
    if (type === 'all') {
      selectAll.value = value as boolean
      users.value.forEach(user => {
        user.selected = value as boolean
      })
    } else {
      const userId = value as number
      const user = users.value.find(u => u.id === userId)
      if (user) {
        user.selected = !user.selected
        
        // Update selectAll state based on current selection
        const allSelected = users.value.every(user => user.selected)
        const noneSelected = users.value.every(user => !user.selected)
        
        if (allSelected) selectAll.value = true
        else if (noneSelected) selectAll.value = false
      }
    }
  }

  // Execute user actions
  const executeUserAction = async (action: ActionType, userIds: number[]): Promise<void> => {
    if (!action || userIds.length === 0) return
    
    loading.value = true
    
    try {
      // Map actions to API status codes
      const statusMap = {
        'activate': 1,
        'deactivate': 0,
        'delete': 2,
        'test': 3,
        'export': 4,
        'delete_conversation': 6
      }
      
      const status = statusMap[action]
      if (status === undefined) {
        console.error('Unknown action:', action)
        error.value = 'Unknown action selected'
        return
      }
      
      const response = await userApi.changeUserStatus(status, userIds)
      
      if (response.success) {
        if (response.data.file) {
          const blob = new Blob([response.data.file], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'exported_users.csv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        
        console.log(`Successfully executed ${action} on ${userIds.length} users`)
        
        // Clear cache and refresh the user list
        clearAllCache()
        await fetchUsers(true)
        
        // Reset selection
        selectedAction.value = ''
        selectAll.value = false
      } else {
        console.error('Failed to execute action:', response.message)
        error.value = response.message || `Failed to ${action} users`
      }
    } catch (err) {
      console.error('Error executing action:', err)
      error.value = `Error executing ${action}`
    } finally {
      loading.value = false
    }
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

  // User authentication methods
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

  return {
    // User authentication
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    
    // User management state
    users,
    selectedAction,
    selectAll,
    selectedUser,
    showUserDetails,
    filterState,
    pagination,
    sorting,
    selectedUsersCount,
    
    // Methods
    fetchUsers,
    updateFilter,
    updateSearch,
    updateSorting,
    handlePageChange,
    handlePerPageChange,
    handleSelectionChange,
    executeUserAction,
    fetchUserAttributes,
    
    // Cache management
    clearUserCache,
    clearAllCache
  };
});