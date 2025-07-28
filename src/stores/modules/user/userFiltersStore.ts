import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  FilterType, 
  SegmentType, 
  SortBy, 
  SortOrder, 
  PerPage,
  PaginationData,
  SortingData
} from '@/types/user';

export interface UserFilterState {
  search: string;
  filter: FilterType;
  segment: SegmentType;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  page: number;
  perPage: PerPage;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export const useUserFiltersStore = defineStore('userFilters', () => {
  // Filter state
  const filterState = ref<UserFilterState>({
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
    sortOrder: 'desc'
  });

  // Pagination and sorting state
  const pagination = ref<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 20
  });

  const sorting = ref<SortingData>({
    sortBy: 'id',
    sortOrder: 'desc'
  });

  // Computed properties
  const hasActiveFilters = computed(() => {
    return filterState.value.search !== '' ||
           filterState.value.filter !== 'all' ||
           filterState.value.segment !== 'all' ||
           filterState.value.dateRange.startDate !== null ||
           filterState.value.dateRange.endDate !== null;
  });

  const isDateRangeValid = computed(() => {
    const { startDate, endDate } = filterState.value.dateRange;
    if (!startDate || !endDate) return true;
    return startDate <= endDate;
  });

  // Actions
  function updateFilter(updates: Partial<UserFilterState>): void {
    Object.assign(filterState.value, updates);
    // Reset to first page when filters change
    filterState.value.page = 1;
  }

  function updateSearch(search: string): void {
    filterState.value.search = search;
    filterState.value.page = 1;
  }

  function updateDateRange(startDate: Date | null, endDate: Date | null): void {
    filterState.value.dateRange = { startDate, endDate };
    filterState.value.page = 1;
  }

  function updateSorting(sortBy: SortBy, sortOrder: SortOrder): void {
    filterState.value.sortBy = sortBy;
    filterState.value.sortOrder = sortOrder;
    filterState.value.page = 1;
  }

  function handlePageChange(page: number): void {
    filterState.value.page = page;
  }

  function handlePerPageChange(perPage: PerPage): void {
    filterState.value.perPage = perPage;
    filterState.value.page = 1;
  }

  function updatePagination(data: PaginationData): void {
    pagination.value = data;
  }

  function updateSortingData(data: SortingData): void {
    sorting.value = data;
  }

  function toApiParams(): Record<string, any> {
    const params: Record<string, any> = {
      page: filterState.value.page,
      per_page: filterState.value.perPage,
      sort_by: filterState.value.sortBy,
      sort_order: filterState.value.sortOrder
    };

    if (filterState.value.search) {
      params.search = filterState.value.search;
    }

    if (filterState.value.filter !== 'all') {
      params.filter = filterState.value.filter;
    }

    if (filterState.value.segment !== 'all') {
      params.segment = filterState.value.segment;
    }

    if (filterState.value.dateRange.startDate) {
      params.start_date = filterState.value.dateRange.startDate.toISOString();
    }

    if (filterState.value.dateRange.endDate) {
      params.end_date = filterState.value.dateRange.endDate.toISOString();
    }

    return params;
  }

  function resetFilters(): void {
    filterState.value = {
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
      sortOrder: 'desc'
    };
  }

  function loadFromStorage(storedState: Partial<UserFilterState>): void {
    if (storedState) {
      Object.assign(filterState.value, storedState);
    }
  }

  function saveToStorage(): UserFilterState {
    return { ...filterState.value };
  }

  return {
    // State
    filterState,
    pagination,
    sorting,
    
    // Computed
    hasActiveFilters,
    isDateRangeValid,
    
    // Actions
    updateFilter,
    updateSearch,
    updateDateRange,
    updateSorting,
    handlePageChange,
    handlePerPageChange,
    updatePagination,
    updateSortingData,
    toApiParams,
    resetFilters,
    loadFromStorage,
    saveToStorage
  };
}); 