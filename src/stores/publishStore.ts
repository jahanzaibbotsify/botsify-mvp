import { defineStore } from 'pinia';
import { ref } from 'vue';
import { publishApi } from '@/services/publishApi';
import { createResource } from '@/utils/caching';
import type { 
  BotDetails, 
  CachedTemplatesResponse,
  BroadcastReportResponse,
} from '@/types';

export const usePublishStore = defineStore('publish', () => {
  // State
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Unified cache system
  const cache = ref<{
    whatsappTemplates: CachedTemplatesResponse | null;
    botDetails: BotDetails | null;
    broadcastReport: { data: BroadcastReportResponse; key: string } | null;
  }>({
    whatsappTemplates: null,
    botDetails: null,
    broadcastReport: null,
  });

  // Loading states
  const loadingStates = ref({
    whatsappTemplates: false,
    botDetails: false,
    broadcastReport: false,
    pluginData: false
  });

  // Cache validity flags
  const cacheValid = ref({
    whatsappTemplates: false,
    botDetails: false,
    broadcastReport: false,
    publishStatus: false
  });

  const facebookPages = createResource(() => publishApi.getFacebookPages());
  const publishStatus = createResource(() => publishApi.getPublishStatus());
  const commentResponder = createResource(() => publishApi.fetchFbCommentResponder(1));
  const thirdPartyConfig = createResource(() => publishApi.getThirdPartyConfig());
  const instagramPages = createResource(() => publishApi.getInstagramPages());
  const smsTemplates = createResource(
    (page = 1, perPage = 20, query?: string) =>
      publishApi.fetchSmsTemplates(page, perPage, query)
  );
  const smsReport = createResource(
    (page = 1, perPage = 20, query?: string, startDate?: string, endDate?: string) =>
      publishApi.fetchSmsReport(page, perPage, query, startDate, endDate)
  );
  const smsSegmentUsers = createResource(() => publishApi.getSegmentUsers('-1', 'sms'));

  // Social
  const getFbCommentResponder = async (page = 1) => {
    // For first page, use the cached resource
    if (page === 1) {
      try {
        const result = await commentResponder.load();
        return { success: true, data: result };
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to get Facebook comment responder' };
      }
    }
    
    // For other pages, make a direct API call
    try {
      const result = await publishApi.fetchFbCommentResponder(page);
      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to get Facebook comment responder' };
    }
  };

  const saveLandingSettings = async (backgroundStyle: 'primary' | 'gradient' | 'secondary' | 'plain-primary' | 'plain-secondary') => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.saveLandingSettings(backgroundStyle);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('Landing settings saved successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to save settings';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save settings';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  
  const getBotDetails = async () => {
    // Return cached bot details if already loaded
    if (cacheValid.value.botDetails && cache.value.botDetails) {
      return { success: true, data: cache.value.botDetails };
    }
    
    // Prevent multiple simultaneous calls
    if (loadingStates.value.botDetails) {
      return { success: false, error: 'Bot details are already being loaded' };
    }
    
    loadingStates.value.botDetails = true;
    error.value = null;
    
    try {
      const result = await publishApi.getBotDetails();
      
      if (result.success) {
        // Cache the bot details
        cache.value.botDetails = result.data;
        cacheValid.value.botDetails = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get bot details';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get bot details';
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.botDetails = false;
    }
  };


  const saveWhatsAppSettings = async (settings: {
    api_key: string;
    bot_id: string;
    client_id?: string | null;
    client_secret?: string | null;
    interactive_buttons?: boolean;
    req_type?: string;
    temporary_token?: string | null;
    type: '360_dialog' | 'meta';
    webhook?: string;
    whatsapp: string;
    whatsapp_account_id?: string | null;
    whatsapp_phone_id?: string | null;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.saveWhatsAppSettings(settings);
      
      if (result.success) {
        if(settings.type === '360_dialog' && result.data.status === 'error'){
          return { success: false, error: result.data.message };
        }
        publishStatus.invalidate();

        loadingStates.value.botDetails = false;
        cache.value.botDetails = null;
        cacheValid.value.botDetails = false;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || `Failed to save ${settings.type === '360_dialog' ? 'Dialog360' : 'Meta Cloud'} settings`;
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || `Failed to save ${settings.type === '360_dialog' ? 'Dialog360' : 'Meta Cloud'} settings`;
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const saveWebhookSettings = async (settings: {
    business_id: string;
    catalog_access_token: string;
    order_webhook?: string;
    catalog_id?: string | null;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.saveWebhookSettings(settings);
      
      if (result.success) {
        // Clear cache to force refresh
        cache.value.botDetails = null;
        cacheValid.value.botDetails = false;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to save webhook settings';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save webhook settings';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const connectCatalog = async (url: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.connectCatalog(url);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to connect catalog';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to connect catalog';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const getCatalog = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.getCatalog();
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get catalog data';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get catalog data';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const fetchWhatsAppTemplates = async (page: number = 1, perPage: number = 20, query?: string) => {
    // Return cached templates if already loaded for the same page, per_page, and query
    if (cacheValid.value.whatsappTemplates && cache.value.whatsappTemplates && 
        cache.value.whatsappTemplates.page === page && 
        cache.value.whatsappTemplates.perPage === perPage &&
        cache.value.whatsappTemplates.query === query) {
      return { success: true, data: { status: 'success', templates: cache.value.whatsappTemplates } };
    }
    
    // Prevent multiple simultaneous calls
    if (loadingStates.value.whatsappTemplates) {
      return { success: false, error: 'WhatsApp templates are already being loaded' };
    }
    
    loadingStates.value.whatsappTemplates = true;
    error.value = null;
    
    try {
      const result = await publishApi.fetchWhatsAppTemplates(page, perPage, query);
      
      if (result.success) {
        // Cache the templates with pagination info and query
        cache.value.whatsappTemplates = {
          data: result.data.templates?.data || [],
          page: page,
          perPage: perPage,
          total: result.data.templates?.total || 0,
          to: result.data.templates?.to || 0,
          prev_page_url: result.data.templates?.prev_page_url || null,
          query: query,
          per_page: perPage,
          current_page: page,
          last_page: result.data.templates?.last_page || 1,
          from: result.data.templates?.from || 1,
          next_page_url: result.data.templates?.next_page_url || null
        };
        cacheValid.value.whatsappTemplates = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to fetch WhatsApp templates';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch WhatsApp templates';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.whatsappTemplates = false;
    }
  };

  const deleteWhatsAppTemplate = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.deleteWhatsAppTemplate(id);
      
      if (result.success) {
        // Clear WhatsApp templates cache
        cache.value.whatsappTemplates = null;
        cacheValid.value.whatsappTemplates = false;
        loadingStates.value.whatsappTemplates = false;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to delete WhatsApp template';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete WhatsApp template';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const getWhatsAppBroadcastReport = async (params: {
    page?: number;
    per_page?: number;
    query?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    // Create a cache key based on params
    const cacheKey = JSON.stringify(params);
    
    // Return cached broadcast report if already loaded with same params
    if (cacheValid.value.broadcastReport && cache.value.broadcastReport && cache.value.broadcastReport.key === cacheKey) {
      return { success: true, data: cache.value.broadcastReport.data };
    }
    
    // Prevent multiple simultaneous calls
    if (loadingStates.value.broadcastReport) {
      return { success: false, error: 'Broadcast report is already being loaded' };
    }
    
    loadingStates.value.broadcastReport = true;
    error.value = null;
    
    try {
      const result = await publishApi.getWhatsAppBroadcastReport(params);
      
      if (result.success) {
        // Cache the broadcast report with params key
        cache.value.broadcastReport = {
          data: result.data,
          key: cacheKey
        };
        cacheValid.value.broadcastReport = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get WhatsApp broadcast report';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get WhatsApp broadcast report';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.broadcastReport = false;
    }
  };

  const connectionInstaPage = async (type: string, pageId: string, pageName: string, accessToken: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.connectionInstaPage(type, pageId, pageName, accessToken);
      
      if (result.success) {
        publishStatus.invalidate();
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to reconnect Facebook page';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to reconnect Facebook page';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };


  const updateDialog360Profile = async (profile: string, image?: File) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.updateDialog360Profile(profile, image);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('WhatsApp profile updated successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to update WhatsApp profile';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update WhatsApp profile';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const loadDataForPlugins = async (data: string) => {
    loadingStates.value.pluginData = true;
    error.value = null;

    try {
      const result = await publishApi.loadDataForPlugins(data);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to load plugin data';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load plugin data';
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.pluginData = false;
    }
  };

  // SMS Templates
  // Removed getSmsTemplates method - use loadDataForPlugins directly

  const resetStore = () => {
    // Reset all cache
    cache.value = {
      whatsappTemplates: null,
      botDetails: null,
      broadcastReport: null,
    };

    // Reset all loading states
    loadingStates.value = {
      whatsappTemplates: false,
      botDetails: false,
      broadcastReport: false,
      pluginData: false
    };

    // Reset all cache validity flags
    cacheValid.value = {
      whatsappTemplates: false,
      botDetails: false,
      broadcastReport: false,
      publishStatus: false
    };

    // Invalidate all resources
    smsTemplates.invalidate();
  };

  const createTemplate = async (templateData: any, type?: string) => {
    try {
      const result = await publishApi.createTemplate(templateData, type);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to create WhatsApp template';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create WhatsApp template';
      return { success: false, error: error.value };
    }
  };

  const createWhatsappBroadcastTask = async (payload: {
    title: string;
    message: string;
    template: string; // Changed from template_id: number
    user_segment: string;
    users: Array<{ phone_number: string }>;
    template_data?: string | null;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await publishApi.createWhatsappBroadcastTask(payload);

      if (result.success) {
        loadingStates.value.broadcastReport = false;
        cache.value.broadcastReport = null;
        cacheValid.value.broadcastReport = false;

        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to create WhatsApp broadcast task';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create WhatsApp broadcast task';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const sendSmsBroadcast = async (payload: {
    template_id: number;
    user_segment: string;
    users: Array<{ phone_number: string }>;
    send_at?: string | null;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await publishApi.sendSmsBroadcast(payload);
      if (result.success) {
        smsReport.invalidate();
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to send SMS broadcast';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to send SMS broadcast';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    facebookPages,
    publishStatus,
    commentResponder,
    getFbCommentResponder,

    // Third Party Config
    thirdPartyConfig,

    // Instagram
    instagramPages,

    // SMS Templates
    smsTemplates,
    smsSegmentUsers,
    smsReport,
    sendSmsBroadcast,
    createTemplate,

    // State
    isLoading,
    error,
    cache,
    cacheValid,
    loadingStates,
    
    // Actions
    saveLandingSettings,
    saveWhatsAppSettings,
    saveWebhookSettings,
    getBotDetails,
    fetchWhatsAppTemplates,
    deleteWhatsAppTemplate,
    getWhatsAppBroadcastReport,
    updateDialog360Profile,
    loadDataForPlugins,
    createWhatsappBroadcastTask,
    connectionInstaPage,
    connectCatalog,
    getCatalog,
    resetStore
  };
}); 