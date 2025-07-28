import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useUserDataStore } from './user/userDataStore';
import { useUserFiltersStore } from './user/userFiltersStore';
import { useRoleStore } from '../roleStore';

export const useUserStore = defineStore('user', () => {
  // Import smaller store modules
  const userDataStore = useUserDataStore();
  const userFiltersStore = useUserFiltersStore();
  const roleStore = useRoleStore();

  // Computed properties that combine data from multiple stores
  const filteredUsers = computed(() => {
    let users = userDataStore.users;

    // Apply search filter
    if (userFiltersStore.filterState.search) {
      const searchTerm = userFiltersStore.filterState.search.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (userFiltersStore.filterState.filter !== 'all') {
      users = users.filter(user => user.status === userFiltersStore.filterState.filter);
    }

    // Apply segment filter
    if (userFiltersStore.filterState.segment !== 'all') {
      users = users.filter(user => {
        // This would need to be implemented based on actual segment logic
        return true;
      });
    }

    // Apply date range filter
    const { startDate, endDate } = userFiltersStore.filterState.dateRange;
    if (startDate && endDate) {
      users = users.filter(user => {
        // This would need to be implemented based on actual date logic
        return true;
      });
    }

    return users;
  });

  const paginatedUsers = computed(() => {
    const start = (userFiltersStore.filterState.page - 1) * userFiltersStore.filterState.perPage;
    const end = start + userFiltersStore.filterState.perPage;
    return filteredUsers.value.slice(start, end);
  });

  const canExecuteAction = computed(() => {
    const action = userDataStore.selectedAction;
    const hasSelectedUsers = userDataStore.hasSelectedUsers;

    if (!hasSelectedUsers) return false;

    // Check role-based permissions
    switch (action) {
      case 'delete':
      case 'delete_conversation':
        return roleStore.canDeleteUsers;
      case 'activate':
      case 'deactivate':
        return roleStore.canChangeUserStatus;
      default:
        return true;
    }
  });

  // Unified actions that coordinate between stores
  async function fetchUsersWithFilters(forceRefresh = false): Promise<void> {
    try {
      // Get API parameters from filters
      const apiParams = userFiltersStore.toApiParams();
      
      // Fetch users with current filters
      await userDataStore.fetchUsers(apiParams, forceRefresh);
      
      // Update pagination based on filtered results
      const totalItems = filteredUsers.value.length;
      const totalPages = Math.ceil(totalItems / userFiltersStore.filterState.perPage);
      
      userFiltersStore.updatePagination({
        currentPage: userFiltersStore.filterState.page,
        totalPages,
        totalItems,
        perPage: userFiltersStore.filterState.perPage
      });
    } catch (error) {
      console.error('❌ Error fetching users with filters:', error);
      throw error;
    }
  }

  async function executeUserAction(action: string, userIds: number[]): Promise<void> {
    // Check permissions
    if (!canExecuteAction.value) {
      throw new Error('You do not have permission to perform this action');
    }

    await userDataStore.executeUserAction(action as any, userIds);
  }

  function updateFilters(updates: any): void {
    userFiltersStore.updateFilter(updates);
  }

  function updateSearch(search: string): void {
    userFiltersStore.updateSearch(search);
  }

  function updateSorting(sortBy: string, sortOrder: 'asc' | 'desc'): void {
    userFiltersStore.updateSorting(sortBy as any, sortOrder);
  }

  function handlePageChange(page: number): void {
    userFiltersStore.handlePageChange(page);
  }

  function handlePerPageChange(perPage: number): void {
    userFiltersStore.handlePerPageChange(perPage as any);
  }

  function handleSelectionChange(type: 'all' | 'single', value?: boolean | number): void {
    userDataStore.handleSelectionChange(type, value);
  }

  function clearSelection(): void {
    userDataStore.clearSelection();
  }

  function resetFilters(): void {
    userFiltersStore.resetFilters();
  }

  // Expose all store functionality through a unified interface
  return {
    // State from composed stores
    user: userDataStore.user,
    loading: userDataStore.loading,
    error: userDataStore.error,
    users: userDataStore.users,
    selectedAction: userDataStore.selectedAction,
    selectAll: userDataStore.selectAll,
    selectedUser: userDataStore.selectedUser,
    showUserDetails: userDataStore.showUserDetails,
    filterState: userFiltersStore.filterState,
    pagination: userFiltersStore.pagination,
    sorting: userFiltersStore.sorting,
    
    // Whitelabel state
    isWhitelabelClient: userDataStore.isWhitelabelClient,
    whitelabelData: userDataStore.whitelabelData,
    
    // Computed from composed stores
    isAuthenticated: userDataStore.isAuthenticated,
    selectedUsersCount: userDataStore.selectedUsersCount,
    hasSelectedUsers: userDataStore.hasSelectedUsers,
    selectedUserIds: userDataStore.selectedUserIds,
    hasActiveFilters: userFiltersStore.hasActiveFilters,
    isDateRangeValid: userFiltersStore.isDateRangeValid,
    
    // Whitelabel computed
    companyName: userDataStore.companyName,
    primaryColor: userDataStore.primaryColor,
    secondaryColor: userDataStore.secondaryColor,
    logo: userDataStore.logo,
    favicon: userDataStore.favicon,
    maskUrl: userDataStore.maskUrl,
    
    // Computed that combine data from multiple stores
    filteredUsers,
    paginatedUsers,
    canExecuteAction,
    
    // Actions from composed stores
    fetchUsers: userDataStore.fetchUsers,
    fetchUserAttributes: userDataStore.fetchUserAttributes,
    login: userDataStore.login,
    logout: userDataStore.logout,
    clearUserCache: userDataStore.clearUserCache,
    clearAllCache: userDataStore.clearAllCache,
    
    // Whitelabel actions
    setWhitelabelData: userDataStore.setWhitelabelData,
    applyWhitelabelColors: userDataStore.applyWhitelabelColors,
    applyWhitelabelFavicon: userDataStore.applyWhitelabelFavicon,
    
    // Unified actions
    fetchUsersWithFilters,
    executeUserAction,
    updateFilters,
    updateSearch,
    updateSorting,
    handlePageChange,
    handlePerPageChange,
    handleSelectionChange,
    clearSelection,
    resetFilters,
    
    // Filter actions
    updateFilter: userFiltersStore.updateFilter,
    updateDateRange: userFiltersStore.updateDateRange,
    updatePagination: userFiltersStore.updatePagination,
    updateSortingData: userFiltersStore.updateSortingData,
    toApiParams: userFiltersStore.toApiParams,
    loadFromStorage: userFiltersStore.loadFromStorage,
    saveToStorage: userFiltersStore.saveToStorage
  };
}); 