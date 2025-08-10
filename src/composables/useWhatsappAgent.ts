import { ref, computed } from 'vue';
import { usePublishStore } from '@/stores/publishStore';

export const useWhatsappAgent = () => {
  const publishStore = usePublishStore();

  // Configuration state
  const isConfigured = ref(false);
  const isLoading = ref(false);

  // Template management state
  const currentPage = ref(1);
  const itemsPerPage = ref(20);
  const searchQuery = ref('');
  const filteredTemplates = ref<any[]>([]);
  const paginationData = ref({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Determine bot service based on configuration
  const botService = computed(() => {
    if (publishStore.botDetailsCache?.dialog360) {
      return 'dialog360';
    } else if (publishStore.botDetailsCache?.whatsapp_cloud) {
      return 'facebookAPI';
    }
    return 'facebookAPI'; // Default to Meta Cloud
  });

  // Computed properties for template management
  const totalPages = computed(() => {
    return Math.ceil(paginationData.value.totalItems / paginationData.value.itemsPerPage);
  });

  // Configuration methods
  const checkConfiguration = async () => {
    try {
      const result = await publishStore.getBotDetails();
      if (result.success && result.data) {
        // Check if either Dialog360 or WhatsApp Cloud is configured
        isConfigured.value = !!(result.data.dialog360 || result.data.whatsapp_cloud);
      }
    } catch (error) {
      console.error('Failed to check WhatsApp configuration:', error);
      isConfigured.value = false;
    }
  };

  // Save Meta Cloud settings
  const saveMetaSettings = async (settings: any) => {
    isLoading.value = true;
    try {
      console.log('Saving Meta Cloud settings:', settings);
      const result = await publishStore.saveWhatsAppCloudSettings({
        temporaryToken: settings.temporaryToken,
        phoneNumber: settings.phoneNumber,
        phoneNumberId: settings.phoneNumberId,
        whatsappBusinessAccountId: settings.whatsappBusinessAccountId,
        clientId: settings.clientId,
        clientSecret: settings.clientSecret
      });
      
      if (result.success) {
        window.$toast?.success('Meta Cloud settings saved successfully!');
        // Recheck configuration after saving
        await checkConfiguration();
        return { success: true };
      } else {
        window.$toast?.error('Failed to save Meta Cloud settings');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Failed to save Meta Cloud settings:', error);
      window.$toast?.error('Failed to save Meta Cloud settings');
      return { success: false, error: error };
    } finally {
      isLoading.value = false;
    }
  };

  // Save Dialog360 settings
  const saveDialog360Settings = async (settings: any) => {
    isLoading.value = true;
    try {
      console.log('Saving Dialog360 settings:', settings);
      const result = await publishStore.saveDialog360Settings(settings);
      
      if (result.success) {
        window.$toast?.success('Dialog360 settings saved successfully!');
        // Recheck configuration after saving
        await checkConfiguration();
        return { success: true };
      } else {
        window.$toast?.error('Failed to save Dialog360 settings');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Failed to save Dialog360 settings:', error);
      window.$toast?.error('Failed to save Dialog360 settings');
      return { success: false, error: error };
    } finally {
      isLoading.value = false;
    }
  };

  // Template management methods
  const fetchWhatsAppTemplates = async (page: number = 1, perPage: number = 20) => {
    if (publishStore.isLoadingTemplates) return;
    
    try {
      const result = await publishStore.fetchWhatsAppTemplates(page, perPage);
      
      if (result.success) {
        const templates = result.data.templates?.data || [];
        filteredTemplates.value = templates;
        
        // Update pagination data
        paginationData.value = {
          currentPage: page,
          totalPages: Math.ceil((result.data.templates?.total || 0) / perPage),
          totalItems: result.data.templates?.total || 0,
          itemsPerPage: perPage
        };
        
        currentPage.value = page;
        return { success: true, data: result.data };
      } else {
        console.error('Failed to fetch WhatsApp templates:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Error fetching WhatsApp templates:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteWhatsAppTemplate = async (id: number) => {
    try {
      const result = await publishStore.deleteWhatsAppTemplate(id);
      
      if (result.success) {
        // Refresh templates after deletion
        await fetchWhatsAppTemplates(currentPage.value, itemsPerPage.value);
        return { success: true, data: result.data };
      } else {
        console.error('Failed to delete WhatsApp template:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Error deleting WhatsApp template:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshWhatsAppTemplates = () => {
    return fetchWhatsAppTemplates(1, itemsPerPage.value);
  };

  const setTemplates = (templates: any[]) => {
    filteredTemplates.value = templates;
  };

  const handleSearch = (query: string) => {
    searchQuery.value = query;
    // Reset to first page when searching
    fetchWhatsAppTemplates(1, itemsPerPage.value);
  };

  const handlePageChange = (page: number) => {
    fetchWhatsAppTemplates(page, itemsPerPage.value);
  };

  return {
    // Configuration state and methods
    isConfigured,
    isLoading,
    botService,
    checkConfiguration,
    saveMetaSettings,
    saveDialog360Settings,
    
    // Template management state and methods
    currentPage,
    itemsPerPage,
    searchQuery,
    filteredTemplates,
    paginationData,
    totalPages,
    fetchWhatsAppTemplates,
    deleteWhatsAppTemplate,
    refreshWhatsAppTemplates,
    setTemplates,
    handleSearch,
    handlePageChange
  };
};
