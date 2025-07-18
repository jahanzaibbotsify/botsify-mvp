<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';
import UserAttributes from './Attributes.vue'
import { User, UserAttribute, PaginationData, SortingData, SortBy, PerPage } from '@/types/user'
import { userApi } from '@/services/userApi';

const props = defineProps<{
  users: User[]
  selectAll: boolean
  pagination: PaginationData
  sorting: SortingData
  loading: boolean
}>()
const showAttributes = ref<boolean>(false)
const selectedUserAttributes = ref<UserAttribute[]>([])
const selectedUser = ref<User>()
const router = useRouter()

const emit = defineEmits<{
  'update:selectAll': [value: boolean]
  'update:userSelected': [userId: number]
  'userClick': [user: User]
  'sort': [sortBy: SortBy]
  'changePage': [page: number]
  'changePerPage': [perPage: PerPage]
}>()


const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const toggleSelectAll = (): void => {
  emit('update:selectAll', !props.selectAll)
}

const handleUserSelect = (userId: number): void => {
  emit('update:userSelected', userId)
}

const handleShowAttributes = (user: User): void => {
  selectedUserAttributes.value = user.attributes
  selectedUser.value = user
  showAttributes.value = true
}

const handleCloseAttributes = (): void => {
  showAttributes.value = false
  selectedUser.value = undefined
  selectedUserAttributes.value = []
}


const handleUpdateAttributes = (attributes: UserAttribute[]): void => {
  selectedUserAttributes.value = attributes
}

const handleDeleteUser = (userId: number) => {
  window.$confirm({}, async() => {
    const response = await userApi.changeUserStatus(2, [userId]);
    if (response.success) {
      window.$toast.success(`Successfully deleted user.`);
      emit('sort', 'name')
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


const handleRowClick = (user: User): void => {
  emit('userClick', user)
}


const handleSort = (sortBy: SortBy): void => {
  emit('sort', sortBy)
}

const handlePageChange = (page: number): void => {
  emit('changePage', page)
}

const handlePerPageChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  const perPage = parseInt(target.value) as PerPage
  emit('changePerPage', perPage)
}

const getSortIcon = (column: SortBy): string => {
  if (props.sorting.sortBy !== column) return ''
  return props.sorting.sortOrder === 'asc' ? 'asc' : 'desc'
}

const getPageNumbers = computed(() => {
  const pages = []
  const { currentPage, totalPages } = props.pagination
  
  console.log('getPageNumbers - pagination props:', props.pagination)
  console.log('getPageNumbers - currentPage:', currentPage, 'totalPages:', totalPages)
  
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
  
  console.log('getPageNumbers - generated pages:', pages)
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
          :value="pagination.perPage" 
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
        Showing {{ ((pagination.currentPage - 1) * pagination.perPage) + 1 }} 
        to {{ Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems) }} 
        of {{ pagination.totalItems }} entries
      </div>
    </div>
    <div class="table-scroll-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                :checked="selectAll" 
                @change="toggleSelectAll"
              >
            </th>
            <th class="sortable" :class="getSortIcon('name')" @click="handleSort('name')">
              NAME
            </th>
            <th class="sortable" :class="getSortIcon('type')" @click="handleSort('type')">
              TYPE
            </th>
            <th>CREATED AT</th>
            <th>COUNTRY</th>
            <th>PHONE</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" v-for="i in pagination.perPage" :key="`skeleton-${i}`" class="skeleton-row">
            <td>
              <div class="skeleton-checkbox"></div>
            </td>
            <td>
              <div class="skeleton-user-info">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-user-details">
                  <div class="skeleton-name"></div>
                  <div class="skeleton-email"></div>
                </div>
              </div>
            </td>
            <td><div class="skeleton-text"></div></td>
            <td><div class="skeleton-text"></div></td>
            <td><div class="skeleton-text"></div></td>
            <td><div class="skeleton-text"></div></td>
            <td><div class="skeleton-badge"></div></td>
            <td>
              <div class="skeleton-actions">
                <div class="skeleton-action-btn"></div>
                <div class="skeleton-action-btn"></div>
                <div class="skeleton-action-btn"></div>
              </div>
            </td>
          </tr>
          <tr v-else-if="users.length === 0" class="no-data-row">
            <td colspan="10" class="no-data-cell">
              <div class="no-data-content">
                <div class="no-data-icon">📄</div>
                <div class="no-data-text">No data found</div>
                <div class="no-data-subtext">Try adjusting your search or filter criteria</div>
              </div>
            </td>
          </tr>
          <tr 
            v-else 
            v-for="user in users" 
            :key="user.id"
            class="clickable-row"
            @click="handleRowClick(user)"
          >
            <td>
              <input
                @click.stop
                type="checkbox" 
                :checked="user.selected"
                @change="handleUserSelect(user.id)"
              >
            </td>
            <td>
              <div class="user-info">
                <div class="user-avatar">{{ getUserInitials(user.name) }}</div>
                <div class="user-details">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td>{{ user.type || 'N/A' }}</td>
            <td>{{ user.created_at }}</td>
            <td>{{ user.country }}</td>
            <td>{{ user.phone_number || 'N/A' }}</td>
            <td>
              <span class="status-badge" :class="user.status.toLowerCase()">
                {{ user.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  v-if="user.hasConversation" 
                  class="action-btn conversation-btn"
                  @click.stop
                  @click="goToConversation(user.fbId)"
                  title="Go to Conversation"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
                <button 
                  class="action-btn attributes-btn"
                  @click.stop
                  @click="handleShowAttributes(user)"
                  title="Show Attributes"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                  </svg>
                </button>
                <button 
                  class="action-btn delete-btn"
                  @click.stop
                  @click="handleDeleteUser(user.id)"
                  title="Delete User"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

     <!-- Pagination -->
     <div class="pagination-container">
      <div class="pagination">
        <button 
          class="pagination-btn"
          :disabled="pagination.currentPage === 1"
          @click="handlePageChange(pagination.currentPage - 1)"
        >
          Previous
        </button>
        
        <template v-for="page in getPageNumbers" :key="page">
          <button 
            v-if="typeof page === 'number'"
            class="pagination-btn page-number"
            :class="{ active: page === pagination.currentPage }"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
          <span v-else class="pagination-ellipsis">{{ page }}</span>
        </template>
        
        <button 
          class="pagination-btn"
          :disabled="pagination.currentPage === pagination.totalPages"
          @click="handlePageChange(pagination.currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>

    <!-- User Attributes Modal -->
    <UserAttributes
      v-if="showAttributes"
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
  border-radius: 8px;
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

.table-scroll-container {
  overflow-x: auto;
  max-height: 50vh;
  overflow-y: auto;
  background-color: white;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.table-scroll-container::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.table-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
  transition: filter 0.3s ease;
}

.users-table th {
  background-color: #f8fafc;
  color: #374151;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  white-space: nowrap;
  border-bottom: 2px solid #e5e7eb;
}

.users-table th {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  position: relative;
}

.users-table th.sortable:hover {
  background-color: #f1f5f9;
}

.users-table th.sortable::after {
  content: '↕';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  opacity: 0.7;
}

.users-table th.sortable.asc::after {
  content: '↑';
  opacity: 1;
}

.users-table th.sortable.desc::after {
  content: '↓';
  opacity: 1;
}

/* Column width constraints */
.users-table th:nth-child(1) { width: 50px; } /* Checkbox */
.users-table th:nth-child(2) { width: 250px; } /* Name */
.users-table th:nth-child(3) { width: 100px; } /* Type */
.users-table th:nth-child(4) { width: 180px; } /* Created At */
.users-table th:nth-child(5) { width: 150px; } /* Country */
.users-table th:nth-child(6) { width: 160px; } /* Phone */
.users-table th:nth-child(7) { width: 120px; } /* Status */
.users-table th:nth-child(8) { width: 150px; } /* Actions */

.users-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  background-color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Column width constraints for cells */
.users-table td:nth-child(1) { width: 50px; } /* Checkbox */
.users-table td:nth-child(2) { width: 250px; } /* Name */
.users-table td:nth-child(3) { width: 100px; } /* Type */
.users-table td:nth-child(4) { width: 180px; } /* Created At */
.users-table td:nth-child(5) { width: 150px; } /* Country */
.users-table td:nth-child(6) { width: 160px; } /* Phone */
.users-table td:nth-child(7) { width: 120px; } /* Status */
.users-table td:nth-child(8) { width: 150px; } /* Actions */

.users-table tr:hover td {
  background-color: #f9fafb;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f9fafb !important;
}

.no-data-row {
  height: 150px;
}

.no-data-row:hover td {
  background-color: white !important;
}

.no-data-cell {
  text-align: center;
  vertical-align: middle;
  border-bottom: none !important;
  height: 150px;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
}

.no-data-icon {
  font-size: 48px;
  opacity: 0.3;
  margin-bottom: 8px;
}

.no-data-text {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.no-data-subtext {
  font-size: 14px;
  color: var(--color-text-primary);
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

.active-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
}

.active-badge.active {
  background-color: var(--color-success);
  color: white;
}

.active-badge.inactive {
  background-color: var(--color-error);
  color: white;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.action-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: #f3f4f6;
  transform: scale(1.1);
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.conversation-btn {
  color: var(--color-primary);
}

.attributes-btn {
  color: var(--color-accent);
}

.delete-btn {
  color: var(--color-error);
}

.status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background-color: #fef2f2;
  color: #dc2626;
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

  



/* Skeleton Loading Styles */
.skeleton-row {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-row:hover td {
  background-color: white !important;
}

.skeleton-checkbox {
  width: 16px;
  height: 16px;
  background-color: #e5e7eb;
  border-radius: 3px;
  margin: 0 auto;
}

.skeleton-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-avatar {
  width: 35px;
  height: 35px;
  background-color: #e5e7eb;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-user-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.skeleton-name {
  height: 16px;
  background-color: #e5e7eb;
  border-radius: 4px;
  width: 80%;
}

.skeleton-email {
  height: 12px;
  background-color: #e5e7eb;
  border-radius: 4px;
  width: 60%;
}

.skeleton-text {
  height: 14px;
  background-color: #e5e7eb;
  border-radius: 4px;
  width: 70%;
}

.skeleton-badge {
  height: 24px;
  background-color: #e5e7eb;
  border-radius: 12px;
  width: 60px;
  margin: 0 auto;
}

.skeleton-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.skeleton-action-btn {
  width: 32px;
  height: 32px;
  background-color: #e5e7eb;
  border-radius: 6px;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
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
  
  .users-table {
    font-size: 14px;
  }
  
  .users-table th,
  .users-table td {
    padding: 12px 8px;
  }
  
  .users-table th {
    font-size: 12px;
  }
  
  .users-table td {
    font-size: 14px;
  }
  
  .user-name {
    font-size: 14px;
  }
  
  .user-email {
    font-size: 12px;
  }
  
  .action-btn svg {
    width: 16px;
    height: 16px;
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
