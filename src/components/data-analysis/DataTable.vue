<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TableColumn } from '@/types/dataAnalysis'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@/components/ui";

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

// const totalPages = computed(() => {
//   return Math.ceil(props.data.length / itemsPerPage.value)
// })

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

const getEmptyStateMessage = () => {
  // Check if the issue might be related to date selection
  const currentDate = new Date()
  const hasFutureDates = props.data.some((row: any) => {
    // Check for common date fields
    const dateFields = ['date', 'created_at', 'updated_at', 'timestamp']
    return dateFields.some(field => {
      const value = row[field]
      if (value && typeof value === 'string') {
        const rowDate = new Date(value)
        return rowDate > currentDate
      }
      return false
    })
  })
  
  if (hasFutureDates) {
    return 'Selected date range may include future dates. Please select a past date range to see data.'
  }
  
  if (props.data.length === 0) {
    return 'Try adjusting your search criteria or selecting a different date range.'
  }
  
  return 'Try adjusting your search criteria.'
}
</script>

<template>
  <div class="">
    <!-- Data Table -->
    <div class="table-section">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader
                v-for="column in columns"
                :key="column.key"
                :sortable="column.sortable"
                :sort="getSortIcon(column.key)"
                @click="column.sortable && handleSort(column.key)"
            >
              {{ column.label.toUpperCase() }}
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <!-- Loading skeleton rows -->
          <template v-if="loading">
            <TableRow v-for="i in itemsPerPage" :key="`skeleton-${i}`" skeleton>
              <TableCell v-for="column in columns" :key="column.key" :isLoading="true" skeletonType="text">
              </TableCell>
            </TableRow>
          </template>

          <!-- No data state -->
          <TableRow v-else-if="data.length === 0" noData>
            <TableCell :noData="true" :colspan="columns.length">
              <div class="empty-state">
                <div class="empty-icon">📊</div>
                <div class="empty-text">No data found</div>
                <div class="empty-subtext">
                  {{ getEmptyStateMessage() }}
                </div>
              </div>
            </TableCell>
          </TableRow>

          <!-- Data rows -->
          <TableRow
              v-else
              v-for="(item, index) in paginatedData"
              :key="index"
              clickable
          >
            <TableCell v-for="column in columns" :key="column.key">
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
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<style scoped>
.table-section {
  overflow: hidden;
}

.table-section h4 {
  margin: 0 0 var(--space-4) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.empty-subtext {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  max-width: 300px;
}

.status-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
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

.status-badge.high {
  background-color: var(--color-success);
  color: white;
}

.status-badge.medium {
  background-color: var(--color-warning);
  color: white;
}

.status-badge.low {
  background-color: var(--color-error);
  color: white;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .table-section {
    margin: var(--space-2);
  }
  
  .empty-state {
    padding: var(--space-6);
  }
  
  .empty-icon {
    font-size: 2.5rem;
  }
  
  .empty-text {
    font-size: 1rem;
  }
  
  .empty-subtext {
    font-size: 0.8rem;
    max-width: 250px;
  }
}
</style>