import { useBotStore } from '@/stores/botStore';
import { axiosInstance } from '@/utils/axiosInstance';

export interface PublishResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class PublishApiService {
  private static instance: PublishApiService;

  private constructor() {}

  public static getInstance(): PublishApiService {
    if (!PublishApiService.instance) {
      PublishApiService.instance = new PublishApiService();
    }
    return PublishApiService.instance;
  }

  /**
   * Send developer email
   */
  async sendDeveloperEmail(email: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/webbot/email-code', {
        email,
        apikey: apiKey
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Send developer email response:', response.data);

      return {
        success: true,
        message: 'Email sent successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error sending developer email:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send email',
        data: error.response?.data
      };
    }
  }

  /**
   * Save landing settings
   */
  async saveLandingSettings(backgroundStyle: 'primary' | 'gradient' | 'secondary'): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/bot/settings', {
        key: 'landing-bot-bg-style',
        value: backgroundStyle,
        apikey: apiKey
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Save landing settings response:', response.data);

      return {
        success: true,
        message: 'Settings saved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error saving landing settings:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to save settings',
        data: error.response?.data
      };
    }
  }

  /**
   * Save Telegram settings
   */
  async saveTelegramSettings(settings: {
    accessToken: string;
    botName: string;
    telegramNumber: string;
    telegramChatbotUrl: string;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/bot/telegram/settings', {
        ...settings,
        apikey: apiKey
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Save Telegram settings response:', response.data);

      return {
        success: true,
        message: 'Telegram settings saved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error saving Telegram settings:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to save Telegram settings',
        data: error.response?.data
      };
    }
  }

  /**
   * Refresh page permissions
   */
  async refreshPagePermission(pageId: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/bot/page/refresh-permissions', {
        pageId,
        apikey: apiKey
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Refresh page permissions response:', response.data);

      return {
        success: true,
        message: 'Page permissions refreshed successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error refreshing page permissions:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to refresh page permissions',
        data: error.response?.data
      };
    }
  }

  /**
   * Remove page permissions
   */
  async removePagePermission(pageId: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/bot/page/remove-permissions', {
        pageId,
        apikey: apiKey
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Remove page permissions response:', response.data);

      return {
        success: true,
        message: 'Page permissions removed successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error removing page permissions:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to remove page permissions',
        data: error.response?.data
      };
    }
  }
}

export const publishApi = PublishApiService.getInstance(); 