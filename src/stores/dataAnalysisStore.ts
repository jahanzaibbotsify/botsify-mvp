import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { TableColumn } from '@/types/dataAnalysis'

export const useDataAnalysisStore = defineStore('dataAnalysis', () => {
  /**
   * UI loading state for analysis requests and filter updates
   */
  const loading = ref(false)

  /**
   * Human‑readable error when network or formatting fails
   */
  const error = ref<string | null>(null)

  /**
   * The latest tabular rows shown in the table (kept for export)
   */
  const data = ref<any[]>([])

  /**
   * Generated columns for the table view
   */
  const columns = ref<TableColumn[]>([])

  /**
   * Local filter state used by the shared filters UI
   */
  const filterState = ref({
    search: '',
    filter: 'all',
    segment: 'all',
    dateRange: {
      startDate: null as Date | null,
      endDate: null as Date | null
    }
  })

  // Computed
  const hasData = computed(() => data.value.length > 0)
  const hasError = computed(() => !!error.value)

  /** Clear all stored rows, columns and error */
  const clearData = () => {
    data.value = []
    columns.value = []
    error.value = null
  }

  /** Reset error only */
  const clearError = () => {
    error.value = null
  }

  /** Merge partial updates into local filter state */
  const updateFilter = (updates: any) => {
    Object.assign(filterState.value, updates)
  }

  /** Update search text */
  const updateSearch = (searchValue: string) => {
    filterState.value.search = searchValue
  }

  /**
   * Export current rows in store as CSV (Table headers derived from columns)
   */
  const exportData = () => {
    if (data.value.length === 0) return

    // Convert data to CSV format
    const headers = columns.value.map(col => col.label).join(',')
    const rows = data.value.map(row =>
      columns.value.map(col => row[col.key] || '').join(',')
    ).join('\n')

    const csvContent = `${headers}\n${rows}`

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `data-analysis-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Generate columns from the first row of data
   */
  const generateColumns = (data: any[]): TableColumn[] => {
    if (!data || data.length === 0) return []

    const firstRow = data[0]
    return Object.keys(firstRow).map(key => ({
      key,
      label: key.replace(/_/g, ' ').toUpperCase(),
      type: inferColumnType(firstRow[key]),
      sortable: true,
      filterable: true
    }))
  }

  /**
   * Best‑effort column type inference for formatting
   */
  const inferColumnType = (value: any): 'text' | 'number' | 'date' | 'boolean' | 'link' => {
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') {
      if (value.includes('@')) return 'link' // Email
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date' // ISO date
      if (value.startsWith('http')) return 'link' // URL
    }
    return 'text'
  }

  /**
   * Convenience helper to set rows and regenerate columns
   */
  const setTableData = (rows: any[]) => {
    data.value = Array.isArray(rows) ? rows : []
    columns.value = generateColumns(data.value)
  }

  return {
    // State
    loading,
    error,
    data,
    columns,
    filterState,
    
    // Computed
    hasData,
    hasError,
    
    // Actions
    clearData,
    clearError,
    updateFilter,
    updateSearch,
    exportData,

    // Helper functions
    generateColumns,
    setTableData
  }
})