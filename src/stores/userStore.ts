import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/services/userApi'
import type { 
  User, 
  ApiUser, 
  SortBy, 
  PerPage, 
  GetUsersParams,
  AttributeResponse,
  UserAttribute,
  ActionType
} from '@/types/user'
import type { SortOrder, PaginationData } from '@/types/api'

// User filter state interface
interface UserFilterState {
  segmentId: number | null
  date: string
  search: string
  status: string
  sortBy: SortBy
  sortOrder: SortOrder
  perPage: PerPage
  currentPage: number
}

// Extended user interface for UI
interface ExtendedUser extends User {
  selected: boolean
  hasConversation: boolean
}

// Transform API user to UI user
const transformApiUser = (apiUser: ApiUser): ExtendedUser => {
  return {
    ...apiUser,
    status: apiUser.status === 1 ? 'Active' : 'Inactive',
    selected: false,
    hasConversation: false
  }
}

export const useUserStore = defineStore('user', () => {
  // User filter state
  const filters = ref<UserFilterState>({
    segmentId: null,
    date: '',
    search: '',
    status: '',
    sortBy: 'id',
    sortOrder: 'desc',
    perPage: 20,
    currentPage: 1
  })

  // User management state
  const users = ref<ExtendedUser[]>([])
  const selectedAction = ref<ActionType>('')
  const selectAll = ref<boolean>(false)
  const selectedUser = ref<User | null>(null)
  const showUserDetails = ref<boolean>(false)
  const loading = ref<boolean>(false)
  const pagination = ref<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 20
  })

  // Execute user actions
  const executeUserAction = async (action: ActionType, userIds: number[]): Promise<void> => {
    if (!action || userIds.length === 0) return
    
    try {
      loading.value = true
      
      switch (action) {
        case 'activate':
          await userApi.changeUserStatus(1, userIds)
          break
        case 'deactivate':
          await userApi.changeUserStatus(0, userIds)
          break
        case 'delete':
          await userApi.executeUserAction('delete', userIds)
          break
        case 'delete_conversation':
          await userApi.executeUserAction('delete_conversation', userIds)
          break
        default:
          console.warn(`Unknown action: ${action}`)
      }
      
      // Refresh users after action
      await fetchUsers()
      
      // Reset selection
      selectedAction.value = ''
      selectAll.value = false
      users.value.forEach(user => user.selected = false)
      
    } catch (error) {
      console.error('Error executing user action:', error)
      window.$toast.error('Failed to execute user action')
    } finally {
      loading.value = false
    }
  }

  // Fetch users with proper error handling
  const fetchUsers = async (): Promise<void> => {
    loading.value = true
    
    try {
      const params: GetUsersParams = {
        page: filters.value.currentPage,
        per_page: filters.value.perPage,
        sortby: filters.value.sortBy,
        sortorder: filters.value.sortOrder
      }

      if (filters.value.search) {
        params.search = filters.value.search
      }

      if (filters.value.status) {
        params.status = filters.value.status
      }

      if (filters.value.segmentId) {
        params.segment_id = filters.value.segmentId
      }

      if (filters.value.date) {
        params.date = filters.value.date
      }

      const response = await userApi.getUsers(params)
      
      if (response.success && response.data) {
        const responseData = response.data as { users: { data: ApiUser[]; current_page: number; last_page: number; total: number; per_page: number } }
        
        if (responseData.users && responseData.users.data) {
          const transformedUsers = responseData.users.data.map(transformApiUser)
          users.value = transformedUsers
          
          // Update pagination
          pagination.value = {
            currentPage: responseData.users.current_page,
            totalPages: responseData.users.last_page,
            totalItems: responseData.users.total,
            perPage: responseData.users.per_page as PerPage
          }
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      window.$toast.error('Failed to fetch users')
    } finally {
      loading.value = false
    }
  }

  // Update filter state
  const updateFilter = (updates: Partial<UserFilterState>) => {
    Object.assign(filters.value, updates)
    
    // Reset page if any filter other than page/perPage changed
    const hasNonPageChanges = Object.keys(updates).some(key => key !== 'currentPage' && key !== 'perPage')
    if (hasNonPageChanges) {
      filters.value.currentPage = 1
    }
    
    fetchUsers()
  }

  // Update search with debouncing
  const updateSearch = (search: string) => {
    filters.value.search = search
    
    // Clear existing timeout
    if ((window as any).searchTimeout) {
      clearTimeout((window as any).searchTimeout)
    }
    
    // Set new timeout
    ;(window as any).searchTimeout = setTimeout(() => {
      filters.value.currentPage = 1
      fetchUsers()
    }, 500)
  }

  // Update sorting
  const updateSorting = (sortBy: SortBy, sortOrder: SortOrder) => {
    filters.value.sortBy = sortBy
    filters.value.sortOrder = sortOrder
    filters.value.currentPage = 1
    fetchUsers()
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      filters.value.currentPage = page
      fetchUsers()
    }
  }

  const handlePerPageChange = (perPage: PerPage) => {
    filters.value.perPage = perPage
    filters.value.currentPage = 1
    fetchUsers()
  }

  // Computed properties
  const selectedUsersCount = computed<number>(() => {
    return users.value.filter(user => user.selected).length
  })

  // Handle selection changes
  const handleSelectionChange = (type: 'all' | 'single', value?: boolean | number): void => {
    if (type === 'all') {
      const selectAllValue = value as boolean
      selectAll.value = selectAllValue
      users.value.forEach(user => user.selected = selectAllValue)
    } else if (type === 'single' && typeof value === 'number') {
      const user = users.value.find(u => u.id === value)
      if (user) {
        user.selected = !user.selected
        // Update select all state
        selectAll.value = users.value.every(u => u.selected)
      }
    }
  }

  // Fetch user attributes
  const fetchUserAttributes = async (fbId: string): Promise<UserAttribute[]> => {
    try {
      const response = await userApi.getUserAttributes(fbId)
      if (response.success && response.data) {
        return response.data
      }
      return []
    } catch (error) {
      console.error('Error fetching user attributes:', error)
      return []
    }
  }

  // Update user attributes
  const updateUserAttributes = async (userIds: number[], attributes: UserAttribute[]): Promise<boolean> => {
    try {
      const response = await userApi.updateUserAttributes(userIds, attributes)
      return response.success
    } catch (error) {
      console.error('Error updating user attributes:', error)
      return false
    }
  }

  // Delete user attribute
  const deleteUserAttribute = async (messengerUserId: string, attributeId: number): Promise<boolean> => {
    try {
      const response = await userApi.deleteUserAttribute(messengerUserId, attributeId)
      return response.success
    } catch (error) {
      console.error('Error deleting user attribute:', error)
      return false
    }
  }

  return {
    // User management state
    users,
    selectedAction,
    selectAll,
    selectedUser,
    showUserDetails,
    filters,
    pagination,
    loading,
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
    updateUserAttributes,
    deleteUserAttribute
  }
})