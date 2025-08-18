<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';
import UserAttributes from './Attributes.vue'
import { UserAttribute, SortBy, PerPage, SortOrder } from '@/types/user'
import { useUserStore, type ExtendedUser } from '@/stores/userStore'
import { useRoleStore } from '@/stores/roleStore'
import { userApi } from '@/services/userApi';
import {Table, TableHead, TableHeader, TableBody, TableCell, TableRow, Badge, Button} from '@/components/ui';
import { formatDate } from '@/utils';

const userStore = useUserStore()
const roleStore = useRoleStore()
const router = useRouter()

const attributesModalRef = ref<InstanceType<typeof UserAttributes> | null>(null)
const selectedUserAttributes = ref<UserAttribute[]>([])
const selectedUser = ref<ExtendedUser>()

const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const toggleSelectAll = (): void => {
  userStore.handleSelectionChange('all', !userStore.selectAll)
}

const handleUserSelect = (userId: number): void => {
  userStore.handleSelectionChange('single', userId)
}

const handleShowAttributes = (user: ExtendedUser): void => {
  selectedUserAttributes.value = user.attributes
  selectedUser.value = user
  attributesModalRef.value?.openModal()
}

const handleCloseAttributes = (): void => {
  selectedUser.value = undefined
  selectedUserAttributes.value = []
}

const handleUpdateAttributes = (attributes: UserAttribute[]): void => {
  selectedUserAttributes.value = attributes
}

const handleDeleteUser = (userId: number) => {
  window.$confirm({
    text: 'Are you sure you want to delete this user?',
  }, async() => {
    const response = await userApi.changeUserStatus(2, [userId]);
    if (response.success) {
      window.$toast.success(`Successfully deleted user.`);
      userStore.updateSorting('name', userStore.sorting.sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      window.$toast.error(`Failed to delete users: ${response.message}`);
    }
  });
}

const goToConversation = (fbId: string): void => {
  if (fbId) {
    router.push({ name: 'conversation', params: { id: fbId } })
  }
}

const handleRowClick = (user: ExtendedUser): void => {
  // Convert ExtendedUser to User type for the store
  const userForStore = {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    plan: 'free' as const,
    avatar: user.profile_pic
  }
  userStore.selectedUser = userForStore
  userStore.showUserDetails = true
}

const handleSort = (sortBy: SortBy): void => {
  const newSortOrder = userStore.sorting.sortBy === sortBy && userStore.sorting.sortOrder === 'asc' ? 'desc' : 'asc'
  userStore.updateSorting(sortBy, newSortOrder)
}

const handlePageChange = (page: number): void => {
  userStore.handlePageChange(page)
}

const handlePerPageChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  const perPage = parseInt(target.value) as PerPage
  userStore.handlePerPageChange(perPage)
}

const getSortIcon = (column: SortBy): SortOrder => {
  if (userStore.sorting.sortBy !== column) return 'desc'
  return userStore.sorting.sortOrder === 'asc' ? 'asc' : 'desc'
}

const getPageNumbers = computed(() => {
  const pages = []
  const { currentPage, totalPages } = userStore.pagination

  // Always show first page
  if (totalPages > 0) pages.push(1)
  
  // Show pages around current page
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  
  // Add ellipsis if there's a gap
  if (start > 2) pages.push('...')
  
  // Add pages around current
  for (let i = start; i <= end; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i)
  }
  
  // Add ellipsis if there's a gap
  if (end < totalPages - 1) pages.push('...')
  
  // Always show last page
  if (totalPages > 1) pages.push(totalPages)
  
  return pages
})
</script>

<template>
  <div class="table-container">
    <!-- Table Controls -->
    <div class="table-controls">
      <div class="per-page-selector">
        <label for="per-page">Show:</label>
        <select 
          id="per-page" 
          :value="userStore.pagination.perPage" 
          @change="handlePerPageChange"
          class="per-page-select"
        >
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
        <span>entries</span>
      </div>
      
      <div class="table-info">
        Showing {{ ((userStore.pagination.currentPage - 1) * userStore.pagination.perPage) + 1 }} 
        to {{ Math.min(userStore.pagination.currentPage * userStore.pagination.perPage, userStore.pagination.totalItems) }} 
        of {{ userStore.pagination.totalItems }} entries
      </div>
    </div>
    
    <!-- Users Table -->
    <Table>
      <TableHead>
          <TableHeader width="50px" class="text-center">
            <input 
              type="checkbox" 
              :checked="userStore.selectAll" 
              @change="toggleSelectAll"
            >
          </TableHeader>
          <TableHeader 
            sortable 
            :sort="getSortIcon('name')" 
            @click="handleSort('name')"
            width="250px"
          >
            NAME
          </TableHeader>
          <TableHeader 
            sortable 
            :sort="getSortIcon('created_at')" 
            @click="handleSort('created_at')"
            width="180px"
          >
            CREATED AT
          </TableHeader>
          <TableHeader 
            sortable 
            :sort="getSortIcon('country')" 
            @click="handleSort('country')"
            width="150px"
          >
            COUNTRY
          </TableHeader>
          <TableHeader width="160px">PHONE</TableHeader>
          <TableHeader width="120px">STATUS</TableHeader>
          <TableHeader width="150px">ACTIONS</TableHeader>
      </TableHead>
      
      <TableBody>
        <!-- Skeleton Loading Rows -->
        <TableRow v-if="userStore.loading" v-for="i in 5" :key="`skeleton-${i}`" skeleton>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="badge"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="actions"></TableCell>
          </TableRow>

        <!-- Empty state -->
        <TableRow v-else-if="userStore.users.length === 0" noData>
            <TableCell noData colspan="7">
              <div class="empty-state">
                <i class="pi pi-file-o"></i>
                <p>No user found</p>
              </div>
            </TableCell>
          </TableRow>

        <!-- User Data Rows -->
        <TableRow 
          v-else 
          v-for="user in userStore.users" 
          :key="user.id"
          clickable
          @click="handleRowClick(user)"
        >
          <TableCell class="text-center">
            <input
              @click.stop
              type="checkbox" 
              :checked="user.selected"
              @change="handleUserSelect(user.id)"
            >
          </TableCell>
          <TableCell>
            <div class="user-info">
              <div class="user-avatar">{{ getUserInitials(user.name) }}</div>
              <div class="user-details">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
          </TableCell>
          <TableCell>{{ formatDate(user.created_at) }}</TableCell>
          <TableCell>{{ user.country }}</TableCell>
          <TableCell>{{ user.phone_number || 'N/A' }}</TableCell>
          <TableCell>
            <Badge size="small" :variant="user.status === 'Active' ? 'success' : 'error'">
              {{ user.status }}
            </Badge>
          </TableCell>
          <TableCell>
            <div class="action-buttons">
              <Button 
                v-if="user.hasConversation" 
                variant="primary-outline"
                size="small"
                icon="pi pi-comments"
                :icon-only="true"
                @click.stop="goToConversation(user.fbId)"
                title="Go to Conversation"
              />
              <Button 
                v-if="roleStore.canViewUserAttributes"
                variant="secondary"
                size="small"
                icon="pi pi-database"
                :icon-only="true"
                @click.stop="handleShowAttributes(user)"
                title="Show Attributes"
              />
              <Button 
                v-if="roleStore.canDeleteUsers"
                variant="error-outline"
                size="small"
                icon="pi pi-trash"
                :icon-only="true"
                @click.stop="handleDeleteUser(user.id)"
                title="Delete User"
              />
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

     <!-- Pagination -->
     <div class="pagination-container">
      <div class="pagination">
        <button 
          class="pagination-btn"
          :disabled="userStore.pagination.currentPage === 1"
          @click="handlePageChange(userStore.pagination.currentPage - 1)"
        >
          Previous
        </button>
        
        <template v-for="page in getPageNumbers" :key="page">
          <button 
            v-if="typeof page === 'number'"
            class="pagination-btn page-number"
            :class="{ active: page === userStore.pagination.currentPage }"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
          <span v-else class="pagination-ellipsis">{{ page }}</span>
        </template>
        
        <button 
          class="pagination-btn"
          :disabled="userStore.pagination.currentPage === userStore.pagination.totalPages"
          @click="handlePageChange(userStore.pagination.currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>

    <!-- User Attributes Modal -->
    <UserAttributes
      ref="attributesModalRef"
      :attributes="selectedUserAttributes"
      :user="selectedUser"
      @close="handleCloseAttributes"
      @update="handleUpdateAttributes"
    />
  </div>
</template>

<style scoped>
.table-container {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
}

.per-page-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

.table-info {
  color: var(--color-text-primary);
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 35px;
  height: 35px;
  background-color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 15px;
}

.user-email {
  font-size: 13px;
  color: var(--color-text-secondary);
}



.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--color-text-tertiary);
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.pagination-container {
  padding: 16px 20px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background-color: white;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.page-number.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.pagination-ellipsis {
  padding: 8px 4px;
  color: var(--color-text-primary);
  font-size: 14px;
}

.text-center{
  text-align: center;
}

@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .per-page-selector,
  .table-info {
    justify-content: center;
  }
  
  .user-name {
    font-size: 14px;
  }
  
  .user-email {
    font-size: 12px;
  }
  
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pagination-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
