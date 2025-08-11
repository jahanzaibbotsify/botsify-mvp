import { defineStore } from 'pinia';
import { ref } from 'vue';
import { publishApi } from '@/services/publishApi';

export const usePublishStore = defineStore('publish', () => {
  // State
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Template cache
  const templatesCache = ref<{
    data: any[];
    page: number;
    perPage: number;
    total: number;
    to: number;
    prev_page_url: string | null;
  } | null>(null);
  const templatesLoaded = ref(false);
  const isLoadingTemplates = ref(false);
  
  // Bot details cache
  const botDetailsCache = ref<any>(null);
  const botDetailsLoaded = ref(false);
  const isLoadingBotDetails = ref(false);
  
  // Broadcast report cache
  const broadcastReportCache = ref<any>(null);
  const broadcastReportLoaded = ref(false);
  const isLoadingBroadcastReport = ref(false);
  
  // SMS report cache
  const smsReportCache = ref<any>(null);
  const smsReportLoaded = ref(false);
  const isLoadingSmsReport = ref(false);
  
  // Third-party config cache
  const thirdPartyConfigCache = ref<any>(null);
  const thirdPartyConfigLoaded = ref(false);
  const isLoadingThirdPartyConfig = ref(false);
  
  // Facebook pages cache
  const facebookPagesCache = ref<any>(null);
  const facebookPagesLoaded = ref(false);
  const isLoadingFacebookPages = ref(false);

  // Instagram pages cache
  const instagramPagesCache = ref<any>(null);
  const instagramPagesLoaded = ref(false);
  const isLoadingInstagramPages = ref(false);

  // Publish status cache
  const publishStatusCache = ref<any>(null);
  const publishStatusLoaded = ref(false);
  const isLoadingPublishStatus = ref(false);

  // Comment responder cache
  const commentResponderCache = ref<any>(null);
  const commentResponderLoaded = ref(false);
  const isLoadingCommentResponder = ref(false);

  // Plugin data loading state
  const isLoadingPluginData = ref(false);

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
        // Show success toast
        if (window.$toast) {
          window.$toast.success('Telegram settings saved successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to save Telegram settings';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save Telegram settings';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
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
    if (instagramPagesLoaded.value && instagramPagesCache.value) {
      return { success: true, data: instagramPagesCache.value };
    }

    // Prevent multiple simultaneous calls
    if (isLoadingInstagramPages.value) {
      return { success: false, error: 'Instagram pages are already being loaded' };
    }
    
    isLoadingInstagramPages.value = true;
    error.value = null;

    try {
      const result = await publishApi.getInstagramPages();
      
      if (result.success) {
        // Cache the pages
        instagramPagesCache.value = result.data;
        instagramPagesLoaded.value = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get Instagram pages';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get Instagram pages';
      return { success: false, error: error.value };
    } finally {
      isLoadingInstagramPages.value = false;
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
    if (botDetailsLoaded.value && botDetailsCache.value) {
      return { success: true, data: botDetailsCache.value };
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingBotDetails.value) {
      return { success: false, error: 'Bot details are already being loaded' };
    }
    
    isLoadingBotDetails.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.getBotDetails();
      
      if (result.success) {
        // Cache the bot details
        botDetailsCache.value = result.data;
        botDetailsLoaded.value = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get bot details';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get bot details';
      return { success: false, error: error.value };
    } finally {
      isLoadingBotDetails.value = false;
    }
  };

  const getPublishStatus = async () => {
    // Return cached status if already loaded
    if (publishStatusLoaded.value && publishStatusCache.value) {
      return { success: true, data: publishStatusCache.value };
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingPublishStatus.value) {
      return { success: false, error: 'Publish status is already being loaded' };
    }
    
    isLoadingPublishStatus.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.getPublishStatus();
      
      if (result.success) {
        // Cache the publish status
        publishStatusCache.value = result.data;
        publishStatusLoaded.value = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get publish status';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get publish status';
      return { success: false, error: error.value };
    } finally {
      isLoadingPublishStatus.value = false;
    }
  };

  const getThirdPartyConfig = async () => {
    // Return cached config if already loaded
    if (thirdPartyConfigLoaded.value && thirdPartyConfigCache.value) {
      return { success: true, data: thirdPartyConfigCache.value };
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingThirdPartyConfig.value) {
      return { success: false, error: 'Third-party config is already being loaded' };
    }
    
    isLoadingThirdPartyConfig.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.getThirdPartyConfig();
      
      if (result.success) {
        // Cache the config
        thirdPartyConfigCache.value = result.data;
        thirdPartyConfigLoaded.value = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get third-party config';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get third-party config';
      return { success: false, error: error.value };
    } finally {
      isLoadingThirdPartyConfig.value = false;
    }
  };

  const getSmsReport = async (page: number = 1) => {
    // Return cached SMS report if already loaded for the same page
    if (smsReportLoaded.value && smsReportCache.value && smsReportCache.value.page === page) {
      return { success: true, data: smsReportCache.value.data };
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingSmsReport.value) {
      return { success: false, error: 'SMS report is already being loaded' };
    }
    
    isLoadingSmsReport.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.getSmsReport(page);
      
      if (result.success) {
        // Cache the SMS report with page info
        smsReportCache.value = {
          data: result.data,
          page: page
        };
        smsReportLoaded.value = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get SMS report';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get SMS report';
      return { success: false, error: error.value };
    } finally {
      isLoadingSmsReport.value = false;
    }
  };

  const saveDialog360Settings = async (settings: {
    whatsapp: string;
    dialog360ApiKey: string;
    bot_id: string;
    interactive_button: string;
    webhook: string;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.saveDialog360Settings(settings);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to save Dialog360 settings';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save Dialog360 settings';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const saveWhatsAppCloudSettings = async (settings: {
    temporaryToken: string;
    phoneNumber: string;
    phoneNumberId: string;
    whatsappBusinessAccountId: string;
    clientId: string;
    clientSecret: string;
    isFacebook?: boolean;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.saveWhatsAppCloudSettings(settings);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to save WhatsApp Cloud settings';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save WhatsApp Cloud settings';
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
        botDetailsCache.value = null;
        botDetailsLoaded.value = false;
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

  const fetchWhatsAppTemplates = async (page: number = 1, perPage: number = 20) => {
    // Return cached templates if already loaded for the same page and per_page
    console.log('templatesCache', templatesCache);
    if (templatesLoaded.value && templatesCache.value && templatesCache.value.page === page && templatesCache.value.perPage === perPage) {
      return { success: true, data: { status: 'success', templates: templatesCache.value } };
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingTemplates.value) {
      return { success: false, error: 'WhatsApp templates are already being loaded' };
    }
    
    isLoadingTemplates.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.fetchWhatsAppTemplates(page, perPage);
      
      if (result.success) {
        // Cache the templates with pagination info
        templatesCache.value = {
          data: result.data.templates?.data || [],
          page: page,
          perPage: perPage,
          total: result.data.templates?.total || 0,
          to: result.data.templates?.to || 0,
          prev_page_url: result.data.templates?.prev_page_url || null
        };
        templatesLoaded.value = true;
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
      isLoadingTemplates.value = false;
    }
  };

  const deleteWhatsAppTemplate = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.deleteWhatsAppTemplate(id);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('WhatsApp template deleted successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to delete WhatsApp template';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete WhatsApp template';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
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
        // Show success toast
        if (window.$toast) {
          window.$toast.success('SMS template created successfully!');
        }
        // Clear cache to force refresh
        templatesLoaded.value = false;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to create SMS template';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create SMS template';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
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
    if (broadcastReportLoaded.value && broadcastReportCache.value && broadcastReportCache.value.key === cacheKey) {
      return { success: true, data: broadcastReportCache.value.data };
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingBroadcastReport.value) {
      return { success: false, error: 'Broadcast report is already being loaded' };
    }
    
    isLoadingBroadcastReport.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.getWhatsAppBroadcastReport(params);
      
      if (result.success) {
        // Cache the broadcast report with params key
        broadcastReportCache.value = {
          data: result.data,
          key: cacheKey
        };
        broadcastReportLoaded.value = true;
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
      isLoadingBroadcastReport.value = false;
    }
  };

  const getFbPages = async () => {
    // Return cached pages if already loaded
    if (facebookPagesLoaded.value && facebookPagesCache.value) {
      return { success: true, data: facebookPagesCache.value };
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingFacebookPages.value) {
      return { success: false, error: 'Facebook pages are already being loaded' };
    }
    
    isLoadingFacebookPages.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.getFacebookPages();
      
      if (result.success) {
        // Cache the pages
        facebookPagesCache.value = result.data;
        facebookPagesLoaded.value = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get Facebook pages';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get Facebook pages';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      isLoadingFacebookPages.value = false;
    }
  };

  const connectionFbPage = async (type: string, pageId: string, pageName: string, accessToken: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.connectionFbPage(type, pageId, pageName, accessToken);
      
      if (result.success) {
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
    if (commentResponderLoaded.value && commentResponderCache.value) {
      return { success: true, data: commentResponderCache.value.data };
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingCommentResponder.value) {
      return { success: false, error: 'Comment responder is already being loaded' };
    }
    
    isLoadingCommentResponder.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.fetchFbCommentResponder();
      
      if (result.success) {
        // Cache the comment responder
        commentResponderCache.value = {
          data: result.data
        };
        commentResponderLoaded.value = true;
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get Facebook comment responder';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get Facebook comment responder';
      return { success: false, error: error.value };
    } finally {
      isLoadingCommentResponder.value = false;
    }
  };

  const deleteCommentResponder = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.deleteCommentResponder(id);
      
      if (result.success) {
        // Clear cache
        commentResponderCache.value = null;
        commentResponderLoaded.value = false;
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
        commentResponderCache.value = null;
        commentResponderLoaded.value = false;
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
        commentResponderCache.value = null;
        commentResponderLoaded.value = false;
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

  const loadDataForPlugins = async (data: string) => {
    isLoadingPluginData.value = true;
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
      isLoadingPluginData.value = false;
    }
  };

  // SMS Templates
  // Removed getSmsTemplates method - use loadDataForPlugins directly


  const clearFbPagesCache = () => {
    facebookPagesCache.value = null;
    facebookPagesLoaded.value = false;
  };

  const clearInstaPagesCache = () => {
    instagramPagesCache.value = null;
    instagramPagesLoaded.value = false;
  };

  const clearPublishStatusCache = () => {
    publishStatusCache.value = null;
    publishStatusLoaded.value = false;
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
    template_id: number;
    user_segment: string;
    users: Array<{ phone_number: string }>;
    send_at?: string | null;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      console.log('Creating SMS broadcast task with payload:', payload);
      const result = await publishApi.createWhatsappBroadcastTask(payload);
      console.log('API result for SMS broadcast task:', result);

      if (result.success) {
        console.log('API call successful, returning success');
        return { success: true, data: result.data };
      } else {
        console.log('API call failed, returning error');
        error.value = result.message || 'Failed to create SMS broadcast task';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      console.error('Exception in createWhatsappBroadcastTask:', err);
      error.value = err.message || 'Failed to create SMS broadcast task';
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

  const updateSmsTemplate = async (id: number, data: any) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.updateSmsTemplate(id, data);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to edit SMS template';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to edit SMS template';
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
    templatesCache,
    templatesLoaded,
    isLoadingTemplates,
    botDetailsCache,
    botDetailsLoaded,
    isLoadingBotDetails,
    broadcastReportCache,
    broadcastReportLoaded,
    isLoadingBroadcastReport,
    smsReportCache,
    smsReportLoaded,
    isLoadingSmsReport,
    thirdPartyConfigCache,
    thirdPartyConfigLoaded,
    isLoadingThirdPartyConfig,
    facebookPagesCache,
    facebookPagesLoaded,
    isLoadingFacebookPages,
    publishStatusCache,
    publishStatusLoaded,
    isLoadingPublishStatus,
    commentResponderCache,
    commentResponderLoaded,
    isLoadingCommentResponder,
    instagramPagesCache,
    instagramPagesLoaded,
    isLoadingInstagramPages,
    isLoadingPluginData,
    
    // Actions
    saveLandingSettings,
    saveTelegramSettings,
    saveTwilioSettings,
    saveDialog360Settings,
    saveWhatsAppCloudSettings,
    saveWebhookSettings,
    refreshFbPagePermission,
    removeFbPagePermission,
    getBotDetails,
    getPublishStatus,
    getThirdPartyConfig,
    getSmsReport,
    fetchWhatsAppTemplates,
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
    updateSmsTemplate,
    sendSmsBroadcast
  };
}); 