<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TableColumn } from '@/types/dataAnalysis'

interface Props {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const sortColumn = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const itemsPerPage = ref(20)

const sortedData = computed(() => {
  if (!sortColumn.value) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = a[sortColumn.value]
    const bVal = b[sortColumn.value]
    
    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedData.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(props.data.length / itemsPerPage.value)
})

const handleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const getSortIcon = (column: string) => {
  if (sortColumn.value !== column) return ''
  return sortDirection.value === 'asc' ? 'asc' : 'desc'
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handlePerPageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  itemsPerPage.value = parseInt(target.value)
  currentPage.value = 1
}

const getPageNumbers = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  // Always show first page
  if (total > 0) pages.push(1)
  
  // Show pages around current page
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  
  // Add ellipsis if there's a gap
  if (start > 2) pages.push('...')
  
  // Add pages around current
  for (let i = start; i <= end; i++) {
    if (i !== 1 && i !== total) pages.push(i)
  }
  
  // Add ellipsis if there's a gap
  if (end < total - 1) pages.push('...')
  
  // Always show last page
  if (total > 1) pages.push(total)
  
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
          :value="itemsPerPage" 
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
        Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} 
        to {{ Math.min(currentPage * itemsPerPage, data.length) }} 
        of {{ data.length }} entries
      </div>
    </div>
    
    <div class="table-scroll-container">
      <table class="users-table">
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              :class="{ 'sortable': column.sortable, [getSortIcon(column.key)]: column.sortable }"
              @click="column.sortable && handleSort(column.key)"
            >
              {{ column.label.toUpperCase() }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading skeleton rows -->
          <template v-if="loading">
            <tr v-for="i in itemsPerPage" :key="`skeleton-${i}`" class="skeleton-row">
              <td v-for="column in columns" :key="column.key">
                <div class="skeleton-text"></div>
              </td>
            </tr>
          </template>
          
          <!-- No data state -->
          <tr v-else-if="data.length === 0" class="no-data-row">
            <td :colspan="columns.length" class="no-data-cell">
              <div class="no-data-content">
                <div class="no-data-icon">📊</div>
                <div class="no-data-text">No data found</div>
                <div class="no-data-subtext">Try adjusting your search criteria</div>
              </div>
            </td>
          </tr>
          
          <!-- Data rows -->
          <tr 
            v-else 
            v-for="(item, index) in paginatedData" 
            :key="index"
            class="clickable-row"
          >
            <td v-for="column in columns" :key="column.key">
              <template v-if="column.type === 'badge'">
                <span class="status-badge" :class="String(item[column.key]).toLowerCase()">
                  {{ item[column.key] }}
                </span>
              </template>
              <template v-else-if="column.type === 'number'">
                {{ typeof item[column.key] === 'number' ? item[column.key].toLocaleString() : item[column.key] }}
              </template>
              <template v-else>
                {{ item[column.key] || 'N/A' }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="totalPages > 1">
      <div class="pagination">
        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
        >
          Previous
        </button>
        
        <template v-for="page in getPageNumbers" :key="page">
          <button 
            v-if="typeof page === 'number'"
            class="pagination-btn page-number"
            :class="{ active: page === currentPage }"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
          <span v-else class="pagination-ellipsis">{{ page }}</span>
        </template>
        
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
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
  margin-top: var(--space-4);
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
  min-width: 800px;
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

.users-table th.sortable {
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

.users-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  background-color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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

.status-badge.high {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.medium {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge.low {
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

.skeleton-text {
  height: 14px;
  background-color: #e5e7eb;
  border-radius: 4px;
  width: 70%;
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
  
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pagination-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}

/* Medium desktop responsiveness */
@media (max-width: 1280px) and (min-width: 769px) {
  .table-controls {
    flex-wrap: wrap;
    gap: 10px 12px;
  }

  .table-info {
    flex: 1 1 100%;
  }

  .users-table {
    min-width: 720px;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>