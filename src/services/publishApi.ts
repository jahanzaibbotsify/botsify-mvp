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
      const response = await axiosInstance.post('/v1/save-telegram-conf', {
        access_token: settings.accessToken,
        bot_name: settings.botName,
        telegram_number: settings.telegramNumber,
        telegram_url: settings.telegramChatbotUrl,
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
   * Save Twilio settings
   */
  async saveTwilioSettings(settings: {
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioSmsNumber: string;
    twilioSenderId: string;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/twilio/save-configuration', {
        twilio_account_sid: settings.twilioAccountSid,
        twilio_auth_token: settings.twilioAuthToken,
        twilio_sms_number: settings.twilioSmsNumber,
        twilio_sender_id: settings.twilioSenderId,
        apikey: apiKey
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Save Twilio settings response:', response.data);

      return {
        success: true,
        message: 'Twilio settings saved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error saving Twilio settings:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to save Twilio settings',
        data: error.response?.data
      };
    }
  }

  /**
   * Get SMS report
   */
  async getSmsReport(page: number = 1): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/bot/sms/report', {
        params: {
          apikey: apiKey,
          page: page
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Get SMS report response:', response.data);

      return {
        success: true,
        message: 'SMS report retrieved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting SMS report:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get SMS report',
        data: error.response?.data
      };
    }
  }

  /**
   * Get bot details
   */
  async getBotDetails(): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/get-bot-details', {
        params: {
          apikey: apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Get bot details response:', response.data);

      return {
        success: true,
        message: 'Bot details retrieved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting bot details:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get bot details',
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