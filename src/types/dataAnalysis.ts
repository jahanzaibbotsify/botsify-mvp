// Data Analysis Types
export interface DataAnalysisFilter {
  id: string
  name: string
  type: 'text' | 'select' | 'date' | 'number' | 'boolean'
  options?: string[]
  required?: boolean
  placeholder?: string
  defaultValue?: any
}

export interface DataAnalysisRequest {
  prompt: string
  filters: Record<string, any>
}

export interface DataAnalysisResponse {
  success: boolean
  data: any[]
  message?: string
  error?: string
}

export interface LLMResponse {
  success: boolean
  data?: any
  message?: string
  error?: string
}

export interface TableColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'link'
  sortable?: boolean
  filterable?: boolean
}

export interface DataAnalysisState {
  loading: boolean
  error: string | null
  data: any[]
  columns: TableColumn[]
  filters: DataAnalysisFilter[]
  currentRequest: DataAnalysisRequest | null
}