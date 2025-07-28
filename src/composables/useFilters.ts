import { ref, computed, watch } from 'vue';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterState {
  search: string;
  selectedFilters: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  perPage: number;
}

export interface UseFiltersOptions<T> {
  items: T[];
  searchFields?: (keyof T)[];
  filterFields?: Record<string, (item: T) => boolean>;
  sortFields?: Record<string, (a: T, b: T) => number>;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
  defaultPerPage?: number;
  storageKey?: string;
}

export function useFilters<T>(
  options: UseFiltersOptions<T>
) {
  const {
    items,
    searchFields = [],
    filterFields = {},
    sortFields = {},
    defaultSortBy = 'id',
    defaultSortOrder = 'desc',
    defaultPerPage = 20,
    storageKey
  } = options;

  // Filter state
  const filterState = ref<FilterState>({
    search: '',
    selectedFilters: [],
    sortBy: defaultSortBy,
    sortOrder: defaultSortOrder,
    page: 1,
    perPage: defaultPerPage
  });

  // Load state from localStorage if storageKey is provided
  if (storageKey) {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        filterState.value = { ...filterState.value, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load filter state from localStorage:', error);
    }
  }

  // Save state to localStorage when it changes
  if (storageKey) {
    watch(filterState, (newState) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } catch (error) {
        console.warn('Failed to save filter state to localStorage:', error);
      }
    }, { deep: true });
  }

  // Computed filtered and sorted items
  const filteredItems = computed(() => {
    let result = [...items];

    // Apply search filter
    if (filterState.value.search && searchFields.length > 0) {
      const searchTerm = filterState.value.search.toLowerCase();
      result = result.filter(item => {
        return searchFields.some(field => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm);
        });
      });
    }

    // Apply selected filters
    if (filterState.value.selectedFilters.length > 0) {
      result = result.filter(item => {
        return filterState.value.selectedFilters.every(filterKey => {
          const filterFn = filterFields[filterKey];
          return filterFn ? filterFn(item) : true;
        });
      });
    }

    return result;
  });

  const sortedItems = computed(() => {
    const items = filteredItems.value;
    const sortFn = sortFields[filterState.value.sortBy];
    
    if (!sortFn) return items;

    return [...items].sort((a, b) => {
      const result = sortFn(a, b);
      return filterState.value.sortOrder === 'asc' ? result : -result;
    });
  });

  const paginatedItems = computed(() => {
    const start = (filterState.value.page - 1) * filterState.value.perPage;
    const end = start + filterState.value.perPage;
    return sortedItems.value.slice(start, end);
  });

  // Pagination info
  const paginationInfo = computed(() => {
    const total = filteredItems.value.length;
    const totalPages = Math.ceil(total / filterState.value.perPage);
    
    return {
      total,
      totalPages,
      currentPage: filterState.value.page,
      perPage: filterState.value.perPage,
      hasNextPage: filterState.value.page < totalPages,
      hasPrevPage: filterState.value.page > 1
    };
  });

  // Available filter options
  const availableFilters = computed(() => {
    const filters: Record<string, FilterOption[]> = {};
    
    Object.keys(filterFields).forEach(filterKey => {
      const filterFn = filterFields[filterKey];
      const uniqueValues = new Set<string>();
      
      items.forEach(item => {
        if (filterFn(item)) {
          uniqueValues.add(filterKey);
        }
      });
      
      filters[filterKey] = Array.from(uniqueValues).map(value => ({
        value,
        label: value,
        count: items.filter(item => filterFn(item)).length
      }));
    });
    
    return filters;
  });

  // Actions
  const updateSearch = (search: string) => {
    filterState.value.search = search;
    filterState.value.page = 1; // Reset to first page
  };

  const toggleFilter = (filterKey: string) => {
    const index = filterState.value.selectedFilters.indexOf(filterKey);
    if (index > -1) {
      filterState.value.selectedFilters.splice(index, 1);
    } else {
      filterState.value.selectedFilters.push(filterKey);
    }
    filterState.value.page = 1; // Reset to first page
  };

  const clearFilters = () => {
    filterState.value.selectedFilters = [];
    filterState.value.page = 1;
  };

  const updateSorting = (sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    filterState.value.sortBy = sortBy;
    filterState.value.sortOrder = sortOrder;
    filterState.value.page = 1; // Reset to first page
  };

  const goToPage = (page: number) => {
    const maxPage = paginationInfo.value.totalPages;
    filterState.value.page = Math.max(1, Math.min(page, maxPage));
  };

  const nextPage = () => {
    if (paginationInfo.value.hasNextPage) {
      filterState.value.page++;
    }
  };

  const prevPage = () => {
    if (paginationInfo.value.hasPrevPage) {
      filterState.value.page--;
    }
  };

  const updatePerPage = (perPage: number) => {
    filterState.value.perPage = perPage;
    filterState.value.page = 1; // Reset to first page
  };

  const resetFilters = () => {
    filterState.value = {
      search: '',
      selectedFilters: [],
      sortBy: defaultSortBy,
      sortOrder: defaultSortOrder,
      page: 1,
      perPage: defaultPerPage
    };
  };

  return {
    // State
    filterState,
    
    // Computed
    filteredItems,
    sortedItems,
    paginatedItems,
    paginationInfo,
    availableFilters,
    
    // Actions
    updateSearch,
    toggleFilter,
    clearFilters,
    updateSorting,
    goToPage,
    nextPage,
    prevPage,
    updatePerPage,
    resetFilters
  };
} 