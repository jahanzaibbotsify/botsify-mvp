<script setup lang="ts">
import { ref, computed, defineEmits, defineProps } from 'vue'
import UserAttributes from './Attributes.vue'
import { User, UserAttribute, PaginationData, SortingData, SortBy, PerPage } from '@/types/user'

const props = defineProps<{
  users: User[]
  selectAll: boolean
  pagination: PaginationData
  sorting: SortingData
}>()

const showAttributes = ref<boolean>(false)
const selectedUserAttributes = ref<UserAttribute[]>([])

const emit = defineEmits<{
  'update:selectAll': [value: boolean]
  'update:userSelected': [userId: number]
  'showUserAttributes': [userId: number]
  'goToConversation': [userId: number]
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

const handleShowAttributes = (userId: number): void => {
  const user = props.users.find(u => u.id === userId)
  if (user) {
    selectedUserAttributes.value = user.attributes
    showAttributes.value = true
  }
}

const handleCloseAttributes = (): void => {
  showAttributes.value = false
}


const handleUpdateAttributes = (attributes: UserAttribute[]): void => {
  selectedUserAttributes.value = attributes
}

const goToConversation = (userId: number): void => {
  emit('goToConversation', userId)
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
  if (props.sorting.sortBy !== column) return '↕️'
  return props.sorting.sortOrder === 'asc' ? '↑' : '↓'
}

const getPageNumbers = computed(() => {
  const pages = []
  const { currentPage, totalPages } = props.pagination
  
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
          <th class="sortable" @click="handleSort('name')">
            NAME {{ getSortIcon('name') }}
          </th>
          <th class="sortable" @click="handleSort('type')">
            TYPE {{ getSortIcon('type') }}
          </th>
          <th class="sortable" @click="handleSort('active_for_bot')">
            ACTIVE FOR BOT {{ getSortIcon('active_for_bot') }}
          </th>
          <th>CREATED AT</th>
          <th>COUNTRY</th>
          <th>OS</th>
          <th>PHONE</th>
          <th></th>
          <th>STATUS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="users.length === 0" class="no-data-row">
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
                <div 
                  class="user-attributes" 
                  @click.stop
                  @click="handleShowAttributes(user.id)"
                >
                  Show Attributes
                </div>
              </div>
            </div>
          </td>
          <td>{{ user.type || 'N/A' }}</td>
          <td>{{ user.active_for_bot === 1 ? 'Yes' : 'No' }}</td>
          <td>{{ user.created_at }}</td>
          <td>{{ user.country }}</td>
          <td>{{ user.os }}</td>
          <td>{{ user.phone_number || 'N/A' }}</td>
          <td>
            <button 
              v-if="user.hasConversation" 
              class="conversation-btn"
              @click.stop
              @click="goToConversation(user.id)"
            >
              Go to Conversation
            </button>
          </td>
          <td>
            <span class="status-badge" :class="user.status.toLowerCase()">
              {{ user.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

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
      @close="handleCloseAttributes"
      @update="handleUpdateAttributes"
    />
  </div>
</template>

<style scoped>
.table-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 300px;
  max-height: 60vh;
  overflow-y: auto;
  position: relative;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
}

.per-page-select {
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.table-info {
  color: var(--color-text-primary);
  font-size: 14px;
}


.users-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  min-height: 300px;
}

.users-table th {
  background-color: var(--color-primary);
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
}


.users-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.users-table th.sortable:hover {
  background-color: var(--color-primary);
}

.users-table td {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  background-color: white;
}

.users-table tr:hover td {
  background-color: var(--color-bg-tertiary);
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: var(--color-bg-tertiary) !important;
}

.no-data-row {
  height: 200px;
}

.no-data-row:hover td {
  background-color: white !important;
}

.no-data-cell {
  text-align: center;
  vertical-align: middle;
  border-bottom: none !important;
  height: 200px;
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
  width: 40px;
  height: 40px;
  background-color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.user-attributes {
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.user-attributes:hover {
  text-decoration: underline;
  color: var(--color-primary);
}

.conversation-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.conversation-btn:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.active {
  background-color: var(--color-success);
  color: white;
}

.status-badge.inactive {
  background-color: var(--color-error);
  color: white;
}


.pagination-container {
  padding: 16px 20px;
  background-color: white;
  border-top: 1px solid #e9ecef;
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
  border: 1px solid var(--color-border);
  background-color: white;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-text-primary);
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
    font-size: 12px;
  }
  
  .users-table th,
  .users-table td {
    padding: 8px;
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