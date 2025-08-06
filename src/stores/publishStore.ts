import { defineStore } from 'pinia';
import { ref } from 'vue';
import { publishApi } from '@/services/publishApi';

export const usePublishStore = defineStore('publish', () => {
  // State
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const saveLandingSettings = async (backgroundStyle: 'primary' | 'gradient' | 'secondary') => {
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
    twilioSenderId: string;
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

  const refreshPagePermission = async (pageId: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.refreshPagePermission(pageId);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('Page permissions refreshed successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to refresh page permissions';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to refresh page permissions';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const removePagePermission = async (pageId: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.removePagePermission(pageId);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('Page permissions removed successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to remove page permissions';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to remove page permissions';
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
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.getBotDetails();
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get bot details';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get bot details';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const getSmsReport = async (page: number = 1) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.getSmsReport(page);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to get SMS report';
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to get SMS report';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const saveDialog360Settings = async (settings: {
    whatsappNumber: string;
    apiKey: string;
    phoneNumberId: string;
    whatsappBusinessAccountId: string;
  }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.saveDialog360Settings(settings);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('Dialog360 settings saved successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to save Dialog360 settings';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save Dialog360 settings';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
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
        // Show success toast
        if (window.$toast) {
          window.$toast.success('WhatsApp Cloud settings saved successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to save WhatsApp Cloud settings';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save WhatsApp Cloud settings';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const fetchTemplates = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.fetchTemplates();
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to fetch templates';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch templates';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTemplate = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.deleteTemplate(id);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('Template deleted successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to delete template';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete template';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const createTemplate = async (templateData: any) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.createTemplate(templateData);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('Template created successfully!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to create template';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create template';
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
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.getWhatsAppBroadcastReport(params);
      
      if (result.success) {
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
      isLoading.value = false;
    }
  };

  return {
    // State
    isLoading,
    error,
    
    // Actions
    saveLandingSettings,
    saveTelegramSettings,
    saveTwilioSettings,
    saveDialog360Settings,
    saveWhatsAppCloudSettings,
    refreshPagePermission,
    removePagePermission,
    getBotDetails,
    getSmsReport,
    fetchTemplates,
    deleteTemplate,
    createTemplate,
    getWhatsAppBroadcastReport
  };
}); 