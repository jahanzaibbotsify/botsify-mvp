<script setup lang="ts">
import { ref, computed, watch, defineExpose } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'
import UserFilters from '@/components/user/Filters.vue'
import UserTable from '@/components/user/Table.vue'
import ImportPanel from '@/components/user/ImportPanel.vue'
import UserDetails from '@/components/user/Details.vue'
import { ActionType, FilterType, User } from '@/types/user'

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)

// Reactive state
const searchQuery = ref<string>('')
const selectedFilter = ref<FilterType>('all')
const selectedAction = ref<ActionType>('')
const selectAll = ref<boolean>(false)
const showImportPanel = ref<boolean>(false)
const selectedUser = ref<User | null>(null)
const showUserDetails = ref<boolean>(false)

const users = ref<User[]>([
  {
    id: 1,
    name: 'Blessing Rose',
    locale: '',
    source: 'facebook',
    createdAt: '2025-02-07 13:53:24',
    country: 'United States',
    os: '-',
    phone: '1234567890',
    status: 'Active',
    hasConversation: false,
    selected: false
  },
  {
    id: 2,
    name: 'Love Bou',
    locale: '',
    source: 'facebook',
    createdAt: '2025-02-07 13:53:24',
    country: 'United States',
    os: '-',
    phone: '1234567890',
    status: 'Active',
    hasConversation: false,
    selected: false
  },
  {
    id: 3,
    name: 'Aminat Agbeke',
    locale: '',
    source: 'facebook',
    createdAt: '2025-02-07 13:53:24',
    country: 'United States',
    os: '-',
    phone: '1234567890',
    status: 'Active',
    hasConversation: false,
    selected: false
  },
  {
    id: 4,
    name: 'Christian James',
    locale: '',
    source: 'facebook',
    createdAt: '2025-02-07 13:53:24',
    country: 'United States',
    os: '-',
    phone: '1234567890',
    status: 'Active',
    hasConversation: true,
    selected: false
  },
  {
    id: 5,
    name: 'Godsave Fwangshak',
    locale: '',
    source: 'facebook',
    createdAt: '2025-02-07 13:53:24',
    country: 'United States',
    os: '-',
    phone: '1234567890',
    status: 'Active',
    hasConversation: true,
    selected: false
  }
])

// Modal methods
const openModal = (): void => {
  modalRef.value?.openModal()
}

const closeModal = (): void => {
  modalRef.value?.closeModal()
  resetFormState()
}

const resetFormState = (): void => {
  searchQuery.value = ''
  selectedFilter.value = 'all'
  selectedAction.value = ''
  selectAll.value = false
  showImportPanel.value = false
  selectedUser.value = null
  showUserDetails.value = false
  users.value.forEach(user => user.selected = false)
}

// Computed properties
const filteredUsers = computed<User[]>(() => {
  let filtered = users.value

  if (searchQuery.value) {
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.country.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.source.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(user => 
      user.status.toLowerCase() === selectedFilter.value
    )
  }

  return filtered
})

const selectedUsersCount = computed<number>(() => {
  return users.value.filter(user => user.selected).length
})

// Event handlers
const handleSelectAllUpdate = (value: boolean): void => {
  selectAll.value = value
  filteredUsers.value.forEach(user => {
    user.selected = value
  })
}

const handleUserSelectedUpdate = (userId: number): void => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    user.selected = !user.selected
  }
  
  // Update selectAll state based on current selection
  const allSelected = filteredUsers.value.every(user => user.selected)
  const noneSelected = filteredUsers.value.every(user => !user.selected)
  
  if (allSelected) {
    selectAll.value = true
  } else if (noneSelected) {
    selectAll.value = false
  }
}

const handleShowUserAttributes = (userId: number): void => {
  console.log(`Showing attributes for user ${userId}`)
}

const handleGoToConversation = (userId: number): void => {
  console.log(`Going to conversation for user ${userId}`)
  closeModal()
}

const handleDateRangeUpdate = (dateRange: { startDate: Date, endDate: Date }): void => {
  console.log('Fetching data with date range:', dateRange)
}

const handleImport = (): void => {
  showImportPanel.value = !showImportPanel.value
}

const handleImportUsers = (newUsers: User[]): void => {
  users.value.push(...newUsers)
  showImportPanel.value = false
}

const handleCloseImport = (): void => {
  showImportPanel.value = false
}

const handleUserClick = (user: User): void => {
  selectedUser.value = user
  showUserDetails.value = true
}

const handleBackFromDetails = (): void => {
  showUserDetails.value = false
  selectedUser.value = null
}

const handleUpdateUser = (updatedUser: User): void => {
  const index = users.value.findIndex(u => u.id === updatedUser.id)
  if (index !== -1) {
    users.value[index] = updatedUser
  }
}

const executeSelectedAction = (): void => {
  if (!selectedAction.value) return

  const selectedUsers = users.value.filter(user => user.selected)
  console.log(`Executing ${selectedAction.value} on ${selectedUsers.length} users`)
  
  switch (selectedAction.value) {
    case 'activate':
      selectedUsers.forEach(user => user.status = 'Active')
      break
    case 'deactivate':
      selectedUsers.forEach(user => user.status = 'Inactive')
      break
    case 'delete':
      users.value = users.value.filter(user => !user.selected)
      break
  }

  selectedAction.value = ''
  selectAll.value = false
}

// Watch for action changes
watch(selectedAction, (newAction) => {
  if (newAction && selectedUsersCount.value > 0) {
    executeSelectedAction()
  }
})

// Expose the open method to parent
defineExpose({ openModal })
</script>

<template>
  <ModalLayout 
    ref="modalRef"
    title="USER MANAGEMENT"
    max-width="1200px"
    :scrollable="false"
    @close="closeModal"
  >
    <!-- User Details View -->
    <UserDetails
      v-if="showUserDetails && selectedUser"
      :user="selectedUser"
      @back="handleBackFromDetails"
      @update-user="handleUpdateUser"
    />

    <!-- Main User Management View -->
    <div v-else>
      <!-- Filters and Controls -->
      <UserFilters
        :search-query="searchQuery"
        :selected-filter="selectedFilter"
        :selected-action="selectedAction"
        :selected-users-count="selectedUsersCount"
        @update:search-query="searchQuery = $event"
        @update:selected-filter="selectedFilter = $event"
        @update:selected-action="selectedAction = $event"
        @date-range-update="handleDateRangeUpdate"
        @import="handleImport"
      />

      <!-- Import Panel -->
      <ImportPanel 
        v-if="showImportPanel"
        @close="handleCloseImport"
        @import="handleImportUsers"
      />

      <!-- Users Table -->
      <UserTable
        :users="filteredUsers"
        :select-all="selectAll"
        @update:select-all="handleSelectAllUpdate"
        @update:user-selected="handleUserSelectedUpdate"
        @show-user-attributes="handleShowUserAttributes"
        @go-to-conversation="handleGoToConversation"
        @user-click="handleUserClick"
      />
    </div>
  </ModalLayout>
</template>