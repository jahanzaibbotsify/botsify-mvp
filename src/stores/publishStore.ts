import { defineStore } from 'pinia';
import { ref } from 'vue';
import { publishApi } from '@/services/publishApi';

export const usePublishStore = defineStore('publish', () => {
  // State
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const sendDeveloperEmail = async (email: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await publishApi.sendDeveloperEmail(email);
      
      if (result.success) {
        // Show success toast
        if (window.$toast) {
          window.$toast.success('Email sent successfully to developer!');
        }
        return { success: true, data: result.data };
      } else {
        error.value = result.message || 'Failed to send email';
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value);
        }
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to send email';
      // Show error toast
      if (window.$toast) {
        window.$toast.error(error.value);
      }
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

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

  return {
    // State
    isLoading,
    error,
    
    // Actions
    sendDeveloperEmail,
    saveLandingSettings,
    saveTelegramSettings,
    refreshPagePermission,
    removePagePermission
  };
}); 