import { defineStore } from 'pinia';
import { ref } from 'vue';
import { publishApi } from '@/services/publishApi';

export const usePublishStore = defineStore('publish', () => {
  // State
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Unified cache system
  const cache = ref<{
    templates: { data: any[]; page: number; perPage: number; total: number; to: number; prev_page_url: string | null; query?: string } | null;
    botDetails: any;
    broadcastReport: { data: any; key: string } | null;
    smsReport: { data: any; page: number } | null;
    thirdPartyConfig: any;
    facebookPages: any;
    instagramPages: any;
    publishStatus: any;
    commentResponder: any;
  }>({
    templates: null,
    botDetails: null,
    broadcastReport: null,
    smsReport: null,
    thirdPartyConfig: null,
    facebookPages: null,
    instagramPages: null,
    publishStatus: null,
    commentResponder: null
  });

  // Loading states
  const loadingStates = ref({
    templates: false,
    botDetails: false,
    broadcastReport: false,
    smsReport: false,
    thirdPartyConfig: false,
    facebookPages: false,
    instagramPages: false,
    publishStatus: false,
    commentResponder: false,
    pluginData: false
  });

  // Cache validity flags
  const cacheValid = ref({
    templates: false,
    botDetails: false,
    broadcastReport: false,
    smsReport: false,
    thirdPartyConfig: false,
    facebookPages: false,
    instagramPages: false,
    publishStatus: false,
    commentResponder: false
  });

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

  const saveTelegramSettings = async (settings: {
    accessToken: string;
    botName: string;
    telegramNumber: string;
    telegramChatbotUrl: string;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.saveTelegramSettings(settings);
      
      if (result.success) {
        loadingStates.value.publishStatus = false;
        cache.value.publishStatus = null;
        cacheValid.value.publishStatus = false;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to save Telegram settings';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save Telegram settings';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const saveTwilioSettings = async (settings: {
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioSmsNumber: string;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.saveTwilioSettings(settings);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('Twilio settings saved successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to save Twilio settings';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save Twilio settings';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const getInstagramPages = async () => {
    // Return cached pages if already loaded
    if (cacheValid.value.instagramPages && cache.value.instagramPages) {
      return { success: true, data: cache.value.instagramPages };
    }

    // Prevent multiple simultaneous calls
    if (loadingStates.value.instagramPages) {
      return { success: false, error: 'Instagram pages are already being loaded' };
    }
    
    loadingStates.value.instagramPages = true;
    error.value = null;

    try {
      const result = await publishApi.getInstagramPages();
      
      if (result.success) {
        // Cache the pages
        cache.value.instagramPages = result.data;
        cacheValid.value.instagramPages = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get Instagram pages';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get Instagram pages';
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.instagramPages = false;
    }
  };

  const refreshFbPagePermission = async (instagram?: boolean) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.refreshFbPagePermission(instagram);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to refresh Facebook page permissions';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to refresh Facebook page permissions';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const removeFbPagePermission = async (instagram?: boolean) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.removeFbPagePermission(instagram);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to remove Facebook page permissions';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to remove Facebook page permissions';
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

  const getPublishStatus = async () => {
    // Return cached status if already loaded
    if (cacheValid.value.publishStatus && cache.value.publishStatus) {
      return { success: true, data: cache.value.publishStatus };
    }
    
    // Prevent multiple simultaneous calls
    if (loadingStates.value.publishStatus) {
      return { success: false, error: 'Publish status is already being loaded' };
    }
    
    loadingStates.value.publishStatus = true;
    error.value = null;
    
    try {
      const result = await publishApi.getPublishStatus();
      
      if (result.success) {
        // Cache the publish status
        cache.value.publishStatus = result.data;
        cacheValid.value.publishStatus = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get publish status';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get publish status';
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.publishStatus = false;
    }
  };

  const getThirdPartyConfig = async () => {
    // Return cached config if already loaded
    if (cacheValid.value.thirdPartyConfig && cache.value.thirdPartyConfig) {
      return { success: true, data: cache.value.thirdPartyConfig };
    }
    
    // Prevent multiple simultaneous calls
    if (loadingStates.value.thirdPartyConfig) {
      return { success: false, error: 'Third-party config is already being loaded' };
    }
    
    loadingStates.value.thirdPartyConfig = true;
    error.value = null;
    
    try {
      const result = await publishApi.getThirdPartyConfig();
      
      if (result.success) {
        // Cache the config
        cache.value.thirdPartyConfig = result.data;
        cacheValid.value.thirdPartyConfig = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get third-party config';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get third-party config';
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.thirdPartyConfig = false;
    }
  };

  const getSmsReport = async (page: number = 1) => {
    // Return cached SMS report if already loaded for the same page
    if (cacheValid.value.smsReport && cache.value.smsReport && cache.value.smsReport.page === page) {
      return { success: true, data: cache.value.smsReport.data };
    }
    
    // Prevent multiple simultaneous calls
    if (loadingStates.value.smsReport) {
      return { success: false, error: 'SMS report is already being loaded' };
    }
    
    loadingStates.value.smsReport = true;
    error.value = null;
    
    try {
      const result = await publishApi.getSmsReport(page);
      
      if (result.success) {
        // Cache the SMS report with page info
        cache.value.smsReport = {
          data: result.data,
          page: page
        };
        cacheValid.value.smsReport = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get SMS report';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get SMS report';
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.smsReport = false;
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
        loadingStates.value.publishStatus = false;
        cache.value.publishStatus = null;
        cacheValid.value.publishStatus = false;
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
    console.log('templatesCache', cache.value.templates);
    if (cacheValid.value.templates && cache.value.templates && 
        cache.value.templates.page === page && 
        cache.value.templates.perPage === perPage &&
        cache.value.templates.query === query) {
      return { success: true, data: { status: 'success', templates: cache.value.templates } };
    }
    
    // Prevent multiple simultaneous calls
    if (loadingStates.value.templates) {
      return { success: false, error: 'WhatsApp templates are already being loaded' };
    }
    
    loadingStates.value.templates = true;
    error.value = null;
    
    try {
      const result = await publishApi.fetchWhatsAppTemplates(page, perPage, query);
      
      if (result.success) {
        // Cache the templates with pagination info and query
        cache.value.templates = {
          data: result.data.templates?.data || [],
          page: page,
          perPage: perPage,
          total: result.data.templates?.total || 0,
          to: result.data.templates?.to || 0,
          prev_page_url: result.data.templates?.prev_page_url || null,
          query: query
        };
        cacheValid.value.templates = true;
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
      loadingStates.value.templates = false;
    }
  };

  const fetchSmsTemplates = async (page: number = 1, perPage: number = 20, query?: string) => {
    // Return cached templates if already loaded for the same page, per_page, and query
    console.log('smsTemplatesCache', cache.value.templates);
    if (cacheValid.value.templates && cache.value.templates && 
        cache.value.templates.page === page && 
        cache.value.templates.perPage === perPage &&
        cache.value.templates.query === query) {
      return { success: true, data: { status: 'success', templates: cache.value.templates } };
    }
    
    // Prevent multiple simultaneous calls
    if (loadingStates.value.templates) {
      return { success: false, error: 'SMS templates are already being loaded' };
    }
    
    loadingStates.value.templates = true;
    error.value = null;
    
    try {
      const result = await publishApi.fetchSmsTemplates(page, perPage, query);
      
      if (result.success) {
        // Cache the templates with pagination info and query
        cache.value.templates = {
          data: result.data.templates?.data || [],
          page: page,
          perPage: perPage,
          total: result.data.templates?.total || 0,
          to: result.data.templates?.to || 0,
          prev_page_url: result.data.templates?.prev_page_url || null,
          query: query
        };
        cacheValid.value.templates = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to fetch SMS templates';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch SMS templates';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.templates = false;
    }
  };

  const deleteWhatsAppTemplate = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.deleteWhatsAppTemplate(id);
      
      if (result.success) {
        cache.value.templates = null;
        cacheValid.value.templates = false;
        loadingStates.value.templates = false;
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

  const deleteSmsTemplate = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.deleteSmsTemplate(id);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('SMS template deleted successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to delete SMS template';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete SMS template';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const createSmsTemplate = async (templateData: any) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.createTemplate(templateData, 'sms');
      
      if (result.success) {
        if(result.data.status === 'error'){
          return { success: false, error: result.data.message };
        }
        // Show success toast
        // Clear cache to force refresh
        cacheValid.value.templates = false;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to create SMS template';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create SMS template';
      // Show error toast
      window.$toast.error(error.value);
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

  const getFbPages = async () => {
    // Return cached pages if already loaded
    if (cacheValid.value.facebookPages && cache.value.facebookPages) {
      return { success: true, data: cache.value.facebookPages };
    }
    
    // Prevent multiple simultaneous calls
    if (loadingStates.value.facebookPages) {
      return { success: false, error: 'Facebook pages are already being loaded' };
    }
    
    loadingStates.value.facebookPages = true;
    error.value = null;
    
    try {
      const result = await publishApi.getFacebookPages();
      
      if (result.success) {
        // Cache the pages
        cache.value.facebookPages = result.data;
        cacheValid.value.facebookPages = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get Facebook pages';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get Facebook pages';
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.facebookPages = false;
    }
  };

  const connectionFbPage = async (type: string, pageId: string, pageName: string, accessToken: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.connectionFbPage(type, pageId, pageName, accessToken);
      
      if (result.success) {
        loadingStates.value.publishStatus = false;
        cache.value.publishStatus = null;
        cacheValid.value.publishStatus = false;
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

  const connectionInstaPage = async (type: string, pageId: string, pageName: string, accessToken: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.connectionInstaPage(type, pageId, pageName, accessToken);
      
      if (result.success) {
        loadingStates.value.publishStatus = false;
        cache.value.publishStatus = null;
        cacheValid.value.publishStatus = false;
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

  const getFbCommentResponder = async () => {
    // Return cached comment responder if already loaded
    if (cacheValid.value.commentResponder && cache.value.commentResponder) {
      return { success: true, data: cache.value.commentResponder.data };
    }
    
    // Prevent multiple simultaneous calls
    if (loadingStates.value.commentResponder) {
      return { success: false, error: 'Comment responder is already being loaded' };
    }
    
    loadingStates.value.commentResponder = true;
    error.value = null;
    
    try {
      const result = await publishApi.fetchFbCommentResponder();
      
      if (result.success) {
        // Cache the comment responder
        cache.value.commentResponder = {
          data: result.data
        };
        cacheValid.value.commentResponder = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get Facebook comment responder';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get Facebook comment responder';
      return { success: false, error: error.value };
    } finally {
      loadingStates.value.commentResponder = false;
    }
  };

  const deleteCommentResponder = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.deleteCommentResponder(id);
      
      if (result.success) {
        // Clear cache
        cache.value.commentResponder = null;
        cacheValid.value.commentResponder = false;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to delete Facebook comment responder';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete Facebook comment responder';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const createCommentResponder = async (data: {
    message: string;
    post_id: string;
    keywords: string;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.createCommentResponder(data);
      
      if (result.success) {
        // Clear cache
        cache.value.commentResponder = null;
        cacheValid.value.commentResponder = false;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to create Facebook comment responder';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create Facebook comment responder';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const updateCommentResponder = async (id: string, data: {
    message: string;
    post_id: string;
    keywords: string;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.updateCommentResponder(id, data);
      
      if (result.success) {
        // Clear cache
        cache.value.commentResponder = null;
        cacheValid.value.commentResponder = false;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to update Facebook comment responder';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update Facebook comment responder';
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

  const getSegmentUsers = async (segmentId: string, type: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await publishApi.getSegmentUsers(segmentId, type);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to fetch segment users';
        window.$toast?.error(error.value);
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch segment users';
      window.$toast?.error(error.value);
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


  const clearFbPagesCache = () => {
    cache.value.facebookPages = null;
    cacheValid.value.facebookPages = false;
  };

  const clearInstaPagesCache = () => {
    cache.value.instagramPages = null;
    cacheValid.value.instagramPages = false;
  };

  const clearPublishStatusCache = () => {
    cache.value.publishStatus = null;
    cacheValid.value.publishStatus = false;
  };

  const createTemplate = async (templateData: any, type?: string) => {
    isLoading.value = true;
    error.value = null;

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
    } finally {
      isLoading.value = false;
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
      console.log('Creating WhatsApp broadcast task with payload:', payload);
      const result = await publishApi.createWhatsappBroadcastTask(payload);
      console.log('API result for WhatsApp broadcast task:', result);

      if (result.success) {
        console.log('API call successful, returning success');
        return { success: true, data: result.data };
      } else {
        console.log('API call failed, returning error');
        error.value = result.message || 'Failed to create WhatsApp broadcast task';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      console.error('Exception in createWhatsappBroadcastTask:', err);
      error.value = err.message || 'Failed to create WhatsApp broadcast task';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const cloneSmsTemplate = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.cloneSmsTemplate(id);

      if (result.success) {
        cache.value.templates = null;
        cacheValid.value.templates = false;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to clone SMS template';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to clone SMS template';
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
    // State
    isLoading,
    error,
    cache,
    cacheValid,
    loadingStates,
    
    // Actions
    saveLandingSettings,
    saveTelegramSettings,
    saveTwilioSettings,
    saveWhatsAppSettings,
    saveWebhookSettings,
    refreshFbPagePermission,
    removeFbPagePermission,
    getBotDetails,
    getPublishStatus,
    getThirdPartyConfig,
    getSmsReport,
    fetchWhatsAppTemplates,
    fetchSmsTemplates,
    deleteWhatsAppTemplate,
    deleteSmsTemplate,
    createSmsTemplate,
    getWhatsAppBroadcastReport,
    getFbPages,
    connectionFbPage,
    getFbCommentResponder,
    deleteCommentResponder,
    createCommentResponder,
    updateCommentResponder,
    updateDialog360Profile,
    getSegmentUsers,
    loadDataForPlugins,
    clearFbPagesCache,
    clearPublishStatusCache,
    getInstagramPages,
    createTemplate,
    createWhatsappBroadcastTask,
    connectionInstaPage,
    clearInstaPagesCache,
    connectCatalog,
    getCatalog,
    cloneSmsTemplate,
    sendSmsBroadcast
  };
}); 