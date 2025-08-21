import { ref, computed } from 'vue';

export const useTabManagement = (tabs: any[], defaultTab: string = 'publish-bot') => {
  const currentTab = ref(defaultTab);

  // Computed tabs with disabled state
  const computedTabs = computed(() => {
    return tabs.map(tab => ({
      ...tab,
      disabled: false // This will be overridden by specific modal logic
    }));
  });

  const handleTabChange = (tabId: string) => {
    currentTab.value = tabId;
  };

  return {
    currentTab,
    computedTabs,
    handleTabChange
  };
};
