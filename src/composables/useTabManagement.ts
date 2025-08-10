import { ref, computed } from 'vue';

export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

export const useTabManagement = (tabs: Tab[], defaultTab?: string) => {
  const currentTab = ref(defaultTab || tabs[0]?.id || '');
  
  // Computed tabs with disabled state
  const computedTabs = computed(() => {
    return tabs.map(tab => ({
      ...tab,
      disabled: tab.disabled || false
    }));
  });

  // Handle tab change
  const handleTabChange = (tabId: string, isConfigured: boolean = true) => {
    // Only allow tab change if configured or if it's the publish agent tab
    if (tabId === 'publish-agent' || isConfigured) {
      currentTab.value = tabId;
      return true;
    }
    return false;
  };

  // Check if tab is accessible
  const isTabAccessible = (tabId: string, isConfigured: boolean = true) => {
    return tabId === 'publish-agent' || isConfigured;
  };

  // Get current tab info
  const getCurrentTab = () => {
    return tabs.find(tab => tab.id === currentTab.value);
  };

  // Set current tab
  const setCurrentTab = (tabId: string) => {
    currentTab.value = tabId;
  };

  return {
    currentTab,
    computedTabs,
    handleTabChange,
    isTabAccessible,
    getCurrentTab,
    setCurrentTab
  };
};
