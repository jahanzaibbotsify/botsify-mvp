<script setup lang="ts">
import { ref, computed, watch, defineExpose } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'
import UserFilters from '@/components/user/Filters.vue'
import UserTable from '@/components/user/Table.vue'
import ImportPanel from '@/components/user/ImportPanel.vue'
import UserDetails from '@/components/user/Details.vue'
import { ActionType, User, SortBy, SortOrder, ApiUser, PerPage, PaginationData, SortingData } from '@/types/user'
import { userApi } from '@/services/userApi'
import { createUserFilterManager, type UserFilterState } from '@/utils/filterUtils'

const userRef = ref<InstanceType<typeof ModalLayout> | null>(null)

// Filter manager
const filterManager = createUserFilterManager()

// Reactive state
const selectedAction = ref<ActionType>('')
const selectAll = ref<boolean>(false)
const showImportPanel = ref<boolean>(false)
const selectedUser = ref<User | null>(null)
const showUserDetails = ref<boolean>(false)
const loading = ref<boolean>(false)

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

const users = ref<User[]>([])

// Computed properties for filtered users (client-side filtering for display)
const filteredUsers = computed<User[]>(() => {
  return users.value
})

// API Functions
const fetchUsers = async (): Promise<void> => {
  loading.value = true
  
  try {
    // Get filter parameters from filter manager
    const filterParams = filterManager.toApiParams()
    console.log('Filter params:', filterParams)
    
    // Merge with sorting and pagination
    const params = {
      ...filterParams,
      sortby: sorting.value.sortBy,
      sortorder: sorting.value.sortOrder,
      per_page: pagination.value.perPage,
      page: pagination.value.currentPage
    }
    console.log('Final API params:', params)
    
    const response = await userApi.getUsers(params)
    
    if (response.success) {
      console.log(response, "response....")
      // Use API data directly and add selected property
      users.value = response.data.users.data.map((apiUser: ApiUser) => ({
        ...apiUser,
        selected: false,
        status: apiUser.active_for_bot === 1 ? 'Active' : 'Inactive',
        hasConversation: Boolean(apiUser.last_converse)
      }))
      
      // Update pagination from API response
      if (response.data.users) {
        pagination.value = {
          currentPage: response.data.users.current_page,
          totalPages: response.data.users.last_page,
          totalItems: response.data.users.total,
          perPage: response.data.users.per_page as PerPage
        }
      }
    } else {
      console.error('Failed to fetch users:', response.message)
      users.value = []
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    users.value = []
  } finally {
    loading.value = false
  }
}

// const handleRefresh = (): void => {
//   fetchUsers()
// }

// Modal methods
const openModal = (): void => {
  userRef.value?.openModal()
  // Load data when modal opens
  fetchUsers()
}

const closeModal = (): void => {
  userRef.value?.closeModal()
  resetFormState()
}

const resetFormState = (): void => {
  filterManager.reset()
  selectedAction.value = ''
  selectAll.value = false
  showImportPanel.value = false
  selectedUser.value = null
  showUserDetails.value = false
  users.value.forEach(user => user.selected = false)
  
  // Reset pagination and sorting
  pagination.value.currentPage = 1
  sorting.value.sortBy = 'id'
  sorting.value.sortOrder = 'desc'
}

// Computed properties

const selectedUsersCount = computed<number>(() => {
  return users.value.filter(user => user.selected).length
})

// Consolidated event handlers
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

const handleUserAction = (action: string, data?: any): void => {
  switch (action) {
    case 'showAttributes':
      console.log(`Showing attributes for user ${data}`)
      break
    case 'goToConversation':
      console.log(`Going to conversation for user ${data}`)
      closeModal()
      break
    case 'userClick':
      selectedUser.value = data
      showUserDetails.value = true
      break
    case 'backFromDetails':
      showUserDetails.value = false
      selectedUser.value = null
      break
    case 'updateUser':
      const index = users.value.findIndex(u => u.id === data.id)
      if (index !== -1) {
        users.value[index] = data
      }
      break
  }
}

const handleImportActions = (action: 'toggle' | 'close' | 'import', data?: User[]): void => {
  switch (action) {
    case 'toggle':
      showImportPanel.value = !showImportPanel.value
      break
    case 'close':
      showImportPanel.value = false
      break
    case 'import':
      if (data) {
        users.value.push(...data)
        showImportPanel.value = false
      }
      break
  }
}

const executeSelectedAction = (): void => {
  if (!selectedAction.value) return

  const selectedUserIds = users.value
    .filter(user => user.selected)
    .map(user => user.id)
  
  if (selectedUserIds.length === 0) return
  
  executeUserAction(selectedAction.value, selectedUserIds)
}

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
      return
    }
    
    const response = await userApi.changeUserStatus(status, userIds)
    
    if (response.success) {
      console.log(`Successfully executed ${action} on ${userIds.length} users`)
      
      // Refresh the user list to get updated data
      await fetchUsers()
      
      // Reset selection
      selectedAction.value = ''
      selectAll.value = false
    } else {
      console.error('Failed to execute action:', response.message)
      alert(`Failed to ${action} users: ${response.message}`)
    }
  } catch (error) {
    console.error('Error executing action:', error)
    alert(`Error executing ${action}: ${error}`)
  } finally {
    loading.value = false
  }
}

// Watch for filter changes to trigger API calls
filterManager.onChanges((params) => {
  console.log('Filter changed, params:', params)
  // Reset to first page when filters change
  pagination.value.currentPage = 1
  fetchUsers()
})

// Override the updateFilters method to handle debounced search and sorting
const originalUpdateFilters = filterManager.updateFilters.bind(filterManager)
filterManager.updateFilters = (updates: Partial<UserFilterState>) => {
  console.log('User.vue updateFilters called with:', updates)
  
  // If search is being updated, use debounced search and don't trigger immediate change
  if (updates.search !== undefined) {
    console.log('Handling search update with debouncing')
    filterManager.updateSearch(updates.search)
    return // Don't call original updateFilters for search
  }
  
  // If sorting is being updated, use debounced sorting and don't trigger immediate change
  if (updates.sortBy !== undefined || updates.sortOrder !== undefined) {
    console.log('Handling sorting update with debouncing')
    const currentSorting = filterManager.getDebouncedSorting()
    const newSortBy = updates.sortBy !== undefined ? updates.sortBy : currentSorting.sortBy
    const newSortOrder = updates.sortOrder !== undefined ? updates.sortOrder : currentSorting.sortOrder
    filterManager.updateSorting(newSortBy, newSortOrder)
    return // Don't call original updateFilters for sorting
  }
  
  // For date range updates, log the change
  if (updates.dateRange !== undefined) {
    console.log('Handling date range update:', updates.dateRange)
  }
  
  // For non-search/sorting updates, use the original method
  console.log('Calling original updateFilters with:', updates)
  originalUpdateFilters(updates)
}

// Watch for pagination changes only (sorting is now handled by filter manager)
watch([() => pagination.value.currentPage, () => pagination.value.perPage], () => {
  fetchUsers()
})

// Initial data load - moved to modal open
// onMounted(() => {
//   fetchUsers()
// })

// Pagination and sorting handlers
const handleSort = (sortBy: SortBy): void => {
  console.log('handleSort called with:', sortBy)
  
  let newSortOrder: SortOrder = 'desc'
  
  if (sorting.value.sortBy === sortBy) {
    // Toggle sort order if same column
    newSortOrder = sorting.value.sortOrder === 'asc' ? 'desc' : 'asc'
  }
  
  // Update the local sorting state for UI
  sorting.value.sortBy = sortBy
  sorting.value.sortOrder = newSortOrder
  
  // Use the filter manager's debounced sorting
  filterManager.updateSorting(sortBy, newSortOrder)
  
  // Reset to first page when sorting changes
  pagination.value.currentPage = 1
}


const handlePageChange = (page: number): void => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.currentPage = page
  }
}

const handlePerPageChange = (perPage: PerPage): void => {
  pagination.value.perPage = perPage
  pagination.value.totalPages = Math.ceil(filteredUsers.value.length / perPage)
  
  // Adjust current page if necessary
  if (pagination.value.currentPage > pagination.value.totalPages) {
    pagination.value.currentPage = Math.max(1, pagination.value.totalPages)
  }
}

// Watch for action changes
watch(selectedAction, (newAction) => {
  if (newAction && selectedUsersCount.value > 0) {
    executeSelectedAction()
  }
})

// Update pagination when filtered users change
watch(filteredUsers, (newFilteredUsers) => {
  pagination.value.totalItems = newFilteredUsers.length
  pagination.value.totalPages = Math.ceil(newFilteredUsers.length / pagination.value.perPage)
  
  // Reset to first page if current page is out of bounds
  if (pagination.value.currentPage > pagination.value.totalPages) {
    pagination.value.currentPage = Math.max(1, pagination.value.totalPages)
  }
})

// Expose the open method to parent
defineExpose({ openModal })
</script>

<template>
  <ModalLayout 
    ref="userRef"
    title="USER MANAGEMENT"
    max-width="1200px"
    :scrollable="false"
    @close="closeModal"
  >
    <!-- User Details View -->
    <UserDetails
      v-if="showUserDetails && selectedUser"
      :user="selectedUser"
      @back="() => handleUserAction('backFromDetails')"
      @update-user="(user: User) => handleUserAction('updateUser', user)"
    />

    <!-- Main User Management View -->
    <div v-else>
      <!-- Filters and Controls -->
      <UserFilters
        :selected-action="selectedAction"
        :selected-users-count="selectedUsersCount"
        :filter-state="filterManager.getState()"
        @update:filter-state="filterManager.updateFilters($event)"
        @update:selected-action="selectedAction = $event"
        @import="() => handleImportActions('toggle')"
      />

      <!-- Import Panel -->
      <ImportPanel 
        v-if="showImportPanel"
        @close="() => handleImportActions('close')"
        @import="(users: User[]) => handleImportActions('import', users)"
      />

      <!-- Users Table -->
      <UserTable
        :users="users"
        :select-all="selectAll"
        :pagination="pagination"
        :sorting="sorting"
        :loading="loading"
        @update:select-all="(value: boolean) => handleSelectionChange('all', value)"
        @update:user-selected="(userId: number) => handleSelectionChange('single', userId)"
        @show-user-attributes="(userId: number) => handleUserAction('showAttributes', userId)"
        @go-to-conversation="(userId: number) => handleUserAction('goToConversation', userId)"
        @user-click="(user: User) => handleUserAction('userClick', user)"
        @sort="handleSort"
        @change-page="handlePageChange"
        @change-per-page="handlePerPageChange"
      />
    </div>
  </ModalLayout>
</template>