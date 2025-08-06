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

  /**
   * Save Dialog360 settings
   */
  async saveDialog360Settings(settings: {
    whatsappNumber: string;
    apiKey: string;
    phoneNumberId: string;
    whatsappBusinessAccountId: string;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/bot/dialog360/connect', {
        whatsapp_number: settings.whatsappNumber,
        api_key: settings.apiKey,
        phone_number_id: settings.phoneNumberId,
        whatsapp_business_account_id: settings.whatsappBusinessAccountId,
        apikey: apiKey
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Save Dialog360 settings response:', response.data);

      return {
        success: true,
        message: 'Dialog360 settings saved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error saving Dialog360 settings:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to save Dialog360 settings',
        data: error.response?.data
      };
    }
  }

  /**
   * Save WhatsApp Cloud settings
   */
  async saveWhatsAppCloudSettings(settings: {
    temporaryToken: string;
    phoneNumber: string;
    phoneNumberId: string;
    whatsappBusinessAccountId: string;
    clientId: string;
    clientSecret: string;
    isFacebook?: boolean;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/cloud-whatsapp-publish', {
        temporary_token: settings.temporaryToken,
        whatsapp: settings.phoneNumber,
        whatsapp_phone_id: settings.phoneNumberId,
        whatsapp_account_id: settings.whatsappBusinessAccountId,
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
        is_facebook: settings.isFacebook || false,
        apikey: apiKey
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Save WhatsApp Cloud settings response:', response.data);

      return {
        success: true,
        message: 'WhatsApp Cloud settings saved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error saving WhatsApp Cloud settings:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to save WhatsApp Cloud settings',
        data: error.response?.data
      };
    }
  }

  /**
   * Fetch templates
   */
  async fetchTemplates(): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/media-block/fetch', {
        params: {
          apikey: apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Fetch templates response:', response.data);

      return {
        success: true,
        message: 'Templates fetched successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching templates:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch templates',
        data: error.response?.data
      };
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: number): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/media-block/delete', {
        apikey: apiKey,
        id: id
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Delete template response:', response.data);

      return {
        success: true,
        message: 'Template deleted successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error deleting template:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete template',
        data: error.response?.data
      };
    }
  }

  async createTemplate(templateData: any): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/media-block/create', {
        apikey: apiKey,
        ...templateData
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Create template response:', response.data);

      return {
        success: true,
        message: 'Template created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating template:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create template',
        data: error.response?.data
      };
    }
  }

  /**
   * Get WhatsApp broadcast report
   */
  async getWhatsAppBroadcastReport(params: {
    page?: number;
    per_page?: number;
    query?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/whatsapp-broadcast-report', {
        params: {
          apikey: apiKey,
          page: params.page || 1,
          per_page: params.per_page || 20,
          ...(params.query && { query: params.query }),
          ...(params.start_date && { start_date: params.start_date }),
          ...(params.end_date && { end_date: params.end_date })
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Get WhatsApp broadcast report response:', response.data);

      return {
        success: true,
        message: 'WhatsApp broadcast report retrieved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting WhatsApp broadcast report:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get WhatsApp broadcast report',
        data: error.response?.data
      };
    }
  }
}

export const publishApi = PublishApiService.getInstance(); 