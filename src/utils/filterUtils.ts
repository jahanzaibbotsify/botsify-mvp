import { ref, type Ref } from 'vue'

// Base interfaces for generic filter system
export interface BaseFilterState {
  search: string
  page: number
  perPage: number
  sortBy: string
  sortOrder: string
}

export interface FilterParams {
  search?: string
  page?: number
  per_page?: number
  sortby?: string
  sortorder?: string
}

export interface UserFilterParams extends FilterParams {
  query?: string
  status?: string
  segment_id?: number
  date?: string
}

export interface ConversationFilterParams extends FilterParams {
  status?: string
  source?: string
}

// Generic filter manager that can be extended
export class BaseFilterManager<T extends BaseFilterState> {
  protected state: T
  protected debouncedSearch: Ref<string>
  protected debouncedSortBy: Ref<string>
  protected debouncedSortOrder: Ref<string>
  protected debounceTimeout: NodeJS.Timeout | null = null
  protected sortDebounceTimeout: NodeJS.Timeout | null = null
  protected changeCallback?: (params: any) => void

  constructor(initialState: T) {
    this.state = { ...initialState }
    this.debouncedSearch = ref('')
    this.debouncedSortBy = ref(this.state.sortBy)
    this.debouncedSortOrder = ref(this.state.sortOrder)
  }

  // Get current filter state
  getState(): T {
    return { ...this.state }
  }

  // Update a specific filter
  updateFilter<K extends keyof T>(key: K, value: T[K]): void {
    this.state[key] = value
    
    // Reset page when filters change (except page/perPage changes)
    if (key !== 'page' && key !== 'perPage') {
      this.state.page = 1
    }
    
    this.triggerChange()
  }

  // Update multiple filters at once
  updateFilters(updates: Partial<T>): void {
    Object.assign(this.state, updates)
    
    // Reset page if any filter other than page/perPage changed
    const hasNonPageChanges = Object.keys(updates).some(key => key !== 'page' && key !== 'perPage')
    if (hasNonPageChanges) {
      this.state.page = 1
    }
    
    this.triggerChange()
  }

  // Debounced search update
  updateSearch(search: string): void {
    console.log('updateSearch called with:', search)
    this.state.search = search
    
    // Clear existing timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }
    
    // Set new timeout
    this.debounceTimeout = setTimeout(() => {
      console.log('Debounced search triggered with:', search)
      this.debouncedSearch.value = search
      this.triggerChange()
    }, 500) // Increased to 500ms for better debouncing
  }

  // Debounced sorting update
  updateSorting(sortBy: string, sortOrder: string): void {
    console.log('updateSorting called with:', sortBy, sortOrder)
    this.state.sortBy = sortBy
    this.state.sortOrder = sortOrder
    
    // Clear existing timeout
    if (this.sortDebounceTimeout) {
      clearTimeout(this.sortDebounceTimeout)
    }
    
    // Set new timeout
    this.sortDebounceTimeout = setTimeout(() => {
      console.log('Debounced sorting triggered with:', sortBy, sortOrder)
      this.debouncedSortBy.value = sortBy
      this.debouncedSortOrder.value = sortOrder
      this.triggerChange()
    }, 300) // 300ms debounce for sorting
  }

  // Get debounced search value
  getDebouncedSearch(): string {
    return this.debouncedSearch.value
  }

  // Get debounced sorting values
  getDebouncedSorting(): { sortBy: string; sortOrder: string } {
    return {
      sortBy: this.debouncedSortBy.value,
      sortOrder: this.debouncedSortOrder.value
    }
  }

  // Reset all filters
  reset(): void {
    this.state.search = ''
    this.state.page = 1
    this.state.perPage = 20
    this.state.sortBy = 'id'
    this.state.sortOrder = 'desc'
    this.debouncedSearch.value = ''
    this.debouncedSortBy.value = 'id'
    this.debouncedSortOrder.value = 'desc'
    this.triggerChange()
  }

  // Set change callback
  onChanges(callback: (params: any) => void): void {
    this.changeCallback = callback
  }

  // Trigger change callback
  protected triggerChange(): void {
    if (this.changeCallback) {
      const params = this.toApiParams()
      console.log('FilterManager triggerChange called with params:', params)
      this.changeCallback(params)
    }
  }

  // Convert filter state to API parameters - to be implemented by subclasses
  toApiParams(): FilterParams {
    return {
      page: this.state.page,
      per_page: this.state.perPage,
      sortby: this.debouncedSortBy.value,
      sortorder: this.debouncedSortOrder.value
    }
  }
}

// User-specific filter state and manager
export interface UserFilterState extends BaseFilterState {
  filter: string
  segment: string
  dateRange: {
    startDate: Date | null
    endDate: Date | null
  }
}

export class UserFilterManager extends BaseFilterManager<UserFilterState> {
  constructor(initialState: Partial<UserFilterState> = {}) {
    const defaultState: UserFilterState = {
      search: '',
      filter: 'all',
      segment: 'all',
      dateRange: {
        startDate: null,
        endDate: null
      },
      page: 1,
      perPage: 20,
      sortBy: 'id',
      sortOrder: 'desc',
      ...initialState
    }
    super(defaultState)
  }

  toApiParams(): UserFilterParams {
    const baseParams = super.toApiParams()
    const params: UserFilterParams = { ...baseParams }

    // Add search query (debounced)
    if (this.debouncedSearch.value) {
      params.query = this.debouncedSearch.value
    }

    // Add status filter
    if (this.state.filter !== 'all') {
      params.status = this.state.filter === 'active' ? '1' : '0'
    }

    // Add segment filter
    if (this.state.segment !== 'all') {
      const segmentMap: Record<string, number> = {
        sms: -2,
        whatsapp: -3,
        facebook: -4,
        website: -5
      }
      params.segment_id = segmentMap[this.state.segment]
    }

    // Add date range in the correct format
    if (this.state.dateRange.startDate && this.state.dateRange.endDate) {
      const startDate = this.state.dateRange.startDate.toISOString().split('T')[0].replace(/-/g, '/')
      const endDate = this.state.dateRange.endDate.toISOString().split('T')[0].replace(/-/g, '/')
      params.date = `${startDate}-${endDate}`
    }

    return params
  }
}

// Conversation-specific filter state and manager
export interface ConversationFilterState extends BaseFilterState {
  status: string
  source: string
}

export class ConversationFilterManager extends BaseFilterManager<ConversationFilterState> {
  constructor(initialState: Partial<ConversationFilterState> = {}) {
    const defaultState: ConversationFilterState = {
      search: '',
      status: 'all',
      source: 'all',
      page: 1,
      perPage: 20,
      sortBy: 'id',
      sortOrder: 'desc',
      ...initialState
    }
    super(defaultState)
  }

  toApiParams(): ConversationFilterParams {
    const baseParams = super.toApiParams()
    const params: ConversationFilterParams = { ...baseParams }
    
    if (this.state.status !== 'all') {
      params.status = this.state.status
    }
    
    if (this.state.source !== 'all') {
      params.source = this.state.source
    }
    
    return params
  }
}

// Generic search manager for simple search functionality
export class SearchManager {
  private searchValue: Ref<string>
  private debouncedValue: Ref<string>
  private debounceTimeout: NodeJS.Timeout | null = null
  private changeCallback?: (search: string) => void

  constructor(initialSearch = '') {
    this.searchValue = ref(initialSearch)
    this.debouncedValue = ref(initialSearch)
  }

  getSearch(): string {
    return this.searchValue.value
  }

  getDebouncedSearch(): string {
    return this.debouncedValue.value
  }

  updateSearch(search: string): void {
    this.searchValue.value = search
    
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }
    
    this.debounceTimeout = setTimeout(() => {
      this.debouncedValue.value = search
      if (this.changeCallback) {
        this.changeCallback(search)
      }
    }, 300)
  }

  onSearchChange(callback: (search: string) => void): void {
    this.changeCallback = callback
  }

  reset(): void {
    this.searchValue.value = ''
    this.debouncedValue.value = ''
  }
}

// Factory functions for creating filter managers
export function createUserFilterManager(initialState?: Partial<UserFilterState>): UserFilterManager {
  return new UserFilterManager(initialState)
}

export function createConversationFilterManager(initialState?: Partial<ConversationFilterState>): ConversationFilterManager {
  return new ConversationFilterManager(initialState)
}

export function createSearchManager(initialSearch = ''): SearchManager {
  return new SearchManager(initialSearch)
}

// Utility function to create custom filter managers
export function createFilterManager<T extends BaseFilterState>(
  initialState: T,
  toApiParamsFn?: (state: T, baseParams: FilterParams) => any
): BaseFilterManager<T> & { toApiParams: () => any } {
  const manager = new BaseFilterManager(initialState)
  
  if (toApiParamsFn) {
    manager.toApiParams = () => toApiParamsFn(manager.getState(), manager.toApiParams())
  }
  
  return manager as BaseFilterManager<T> & { toApiParams: () => any }
} 
