import { useBotStore } from '@/stores/botStore';
import { axiosInstance } from '@/utils/axiosInstance';
import { APP_URL } from '@/utils/config';

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
  async saveLandingSettings(backgroundStyle: 'primary' | 'gradient' | 'secondary' | 'plain-primary' | 'plain-secondary'): Promise<PublishResponse> {
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
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/twilio/save-configuration', {
        sid: settings.twilioAccountSid,
        auth_token: settings.twilioAuthToken,
        number: settings.twilioSmsNumber,
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
   * Get Facebook pages
   */
  async getFacebookPages(): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/get-facebook-page', {
        params: {
          apikey: apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Get Facebook pages response:', response.data);

      return {
        success: true,
        message: 'Facebook pages retrieved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting Facebook pages:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get Facebook pages',
        data: error.response?.data
      };
    }
  }

  /**
   * Get Instagram pages
   */
  async getInstagramPages(): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/get-instagram-page', {
        params: {
          apikey: apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      return {
        success: true,
        message: 'Instagram pages retrieved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting Instagram pages:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get Instagram pages',
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
   * Get publish status
   */
  async getPublishStatus(): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/get-publish-status', {
        params: {
          apikey: apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Get publish status response:', response.data);

      return {
        success: true,
        message: 'Publish status fetched successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting publish status:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get publish status',
        data: error.response?.data
      };
    }
  }

  /**
   * Get third-party configurations
   */
  async getThirdPartyConfig(): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/bot/get-third-party-conf', {
        params: {
          apikey: apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Get third-party config response:', response.data);

      return {
        success: true,
        message: 'Third-party configurations fetched successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting third-party configurations:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get third-party configurations',
        data: error.response?.data
      };
    }
  }

  /**
   * Refresh page permissions
   */
  async refreshFbPagePermission(instagram?: boolean): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/refresh-page-permissions', {
        params: { 
          apikey: apiKey,
          instagram: instagram || false,
          redirect: `${APP_URL}/agent/${apiKey}`
        },
        timeout: 30000
      });
      return { success: true, message: 'Page permissions refreshed successfully', data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || error.message || 'Failed to refresh page permissions', data: error.response?.data };
    }
  }

  async connectionFbPage(type: string, pageId: string, pageName: string, accessToken: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post(`/v1/facebook-connection`, {
        page_id: pageId,
        type,
        page_name: pageName,
        access_token: accessToken,
        apikey: apiKey
      }, {
        timeout: 30000
      });
      return { success: true, message: 'Page reconnected successfully', data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || error.message || 'Failed to reconnect page', data: error.response?.data };
    }
  }

  
  async connectionInstaPage(type: string, pageId: string, page_name: string, accessToken: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post(`/v1/instagram-connection`, {
        page_id: pageId,
        instagram_id: pageId,
        type,
        page_name,
        instagram_username: page_name,
        access_token: accessToken,
        apikey: apiKey
      }, {
        timeout: 30000
      });
      return { success: true, message: 'Instagram page reconnected successfully', data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || error.message || 'Failed to reconnect Instagram page', data: error.response?.data };
    }
  }

  /**
   * Remove page permissions
   */
  async removeFbPagePermission(instagram?: boolean): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/remove-page-permissions', {
        params: {
          apikey: apiKey,
          instagram: instagram || false
        }
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
   * Save WhatsApp settings (unified for both Dialog360 and Meta)
   */
  async saveWhatsAppSettings(settings: {
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
  }): Promise<PublishResponse> {
    try {      
      const {apiKey} = useBotStore();
      // Determine endpoint based on type
      const endpoint = settings.type === '360_dialog' 
        ? '/v1/bot/dialog360/connect'
        : '/v1/cloud-whatsapp-publish';
      
      // Prepare payload based on type
      let payload: any;
      
      if (settings.type === '360_dialog') {
        payload = {
          whatsapp: settings.whatsapp,
          bot_id: settings.bot_id,
          interactive_button: settings.interactive_buttons || false,
          webhook: settings.webhook || '',
          api_key: settings.api_key,
          type: "360_dialog",
          apikey: apiKey
        };
      } else {
        // Meta Cloud
        payload = {
          temporary_token: settings.temporary_token || '',
          whatsapp: settings.whatsapp,
          whatsapp_phone_id: settings.whatsapp_phone_id || '',
          whatsapp_account_id: settings.whatsapp_account_id || '',
          client_id: settings.client_id || '',
          client_secret: settings.client_secret || '',
          is_facebook: false,
          api_key: settings.api_key,
        };
      }

      const response = await axiosInstance.post(endpoint, payload, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log(`Save ${settings.type} settings response:`, response.data);

      return {
        success: true,
        message: `${settings.type === '360_dialog' ? 'Dialog360' : 'Meta Cloud'} settings saved successfully`,
        data: response.data
      };
    } catch (error: any) {
      console.error(`Error saving ${settings.type} settings:`, error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || `Failed to save ${settings.type === '360_dialog' ? 'Dialog360' : 'Meta Cloud'} settings`,
        data: error.response?.data
      };
    }
  }

  /**
   * Fetch WhatsApp templates
   */
  async fetchWhatsAppTemplates(page: number = 1, perPage: number = 20, query?: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const params: any = {
        apikey: apiKey,
        page: page,
        per_page: perPage
      };
      
      // Add search query if provided
      if (query && query.trim()) {
        params.query = query.trim();
      }
      
      const response = await axiosInstance.get('/v1/media-block/fetch', {
        params,
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Fetch WhatsApp templates response:', response.data);

      return {
        success: true,
        message: 'WhatsApp templates fetched successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching WhatsApp templates:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch WhatsApp templates',
        data: error.response?.data
      };
    }
  }

  /**
   * Fetch SMS templates
   */
  async fetchSmsTemplates(page: number = 1, perPage: number = 20, query?: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const params: any = {
        apikey: apiKey,
        page: page,
        per_page: perPage,
        type: 'sms'
      };
      
      // Add search query if provided
      if (query && query.trim()) {
        params.query = query.trim();
      }
      
      const response = await axiosInstance.get('/v1/media-block/fetch', {
        params,
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Fetch SMS templates response:', response.data);

      return {
        success: true,
        message: 'SMS templates fetched successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching SMS templates:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch SMS templates',
        data: error.response?.data
      };
    }
  }


  /**
   * Delete WhatsApp template
   */
  async deleteWhatsAppTemplate(id: number): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/media-block/delete', {
        apikey: apiKey,
        payload: id
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Delete WhatsApp template response:', response.data);

      return {
        success: true,
        message: 'WhatsApp template deleted successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error deleting WhatsApp template:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete WhatsApp template',
        data: error.response?.data
      };
    }
  }

  /**
   * Delete SMS template
   */
  async deleteSmsTemplate(id: number): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.delete(`/v1/template/${id}`, {
        params: {
          apikey: apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Delete SMS template response:', response.data);

      return {
        success: true,
        message: 'SMS template deleted successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error deleting SMS template:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete SMS template',
        data: error.response?.data
      };
    }
  }

  async createTemplate(templateData: any, type: string = ""): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post(`/v1/media-block/create/${type}`, {
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


  async cloneSmsTemplate(id: number): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post(`/v1/template/clone/${id}`, {
        apikey: apiKey,
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Clone template response:', response.data);

      return {
        success: true,
        message: 'Template cloned successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error cloning template:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to clone template',
        data: error.response?.data
      };
    }
  }

  async sendSmsBroadcast(payload: {
    template_id: number;
    user_segment: string;
    users: Array<{ phone_number: string }>;
    send_at?: string | null;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/schedule/task/sms-broadcast/create', {
        params: {
          apikey: apiKey,
          template: payload.template_id,
          user_segment: payload.user_segment,
          users: payload.users,
          send_at: payload.send_at,
          type: 8
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Send SMS broadcast response:', response.data);

      return {
        success: true,
        message: 'SMS broadcast sent successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error sending SMS broadcast:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send SMS broadcast',
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
      const response = await axiosInstance.post('/v1/whatsapp-broadcast-report', {
          apikey: apiKey,
          page: params.page || 1,
          per_page: params.per_page || 20,
          ...(params.query && { query: params.query }),
          ...(params.start_date && { start_date: params.start_date }),
          ...(params.end_date && { end_date: params.end_date })
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

  /**
   * Fetch Facebook comment auto responders
   */
  async fetchFbCommentResponder(): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/bot/growth-tools/aquire-users-from-comments', {
        params: {
          apikey: apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Fetch Facebook comment responder response:', response.data);

      return {
        success: true,
        message: 'Facebook comment responders fetched successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching Facebook comment responders:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch Facebook comment responders',
        data: error.response?.data
      };
    }
  }

  /**
   * Delete comment auto responder
   */
  async deleteCommentResponder(id: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.delete(`/v1/bot/comment-optin/delete/${id}`, {
        params: {
          apikey: apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Delete comment responder response:', response.data);

      return {
        success: true,
        message: 'Comment responder deleted successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error deleting comment responder:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete comment responder',
        data: error.response?.data
      };
    }
  }

  /**
   * Create comment auto responder
   */
  async createCommentResponder(data: {
    message: string;
    post_id: string;
    keywords: string;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/bot/comment-optin/store', {
        apikey: apiKey,
        message: data.message,
        post_id: data.post_id,
        keywords: data.keywords
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Create comment responder response:', response.data);

      return {
        success: true,
        message: 'Comment responder created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating comment responder:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create comment responder',
        data: error.response?.data
      };
    }
  }

  /**
   * Update comment auto responder
   */
  async updateCommentResponder(id: string, data: {
    message: string;
    post_id: string;
    keywords: string;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post(`/v1/bot/comment-optin/update/${id}`, {
        apikey: apiKey,
        message: data.message,
        post_id: data.post_id,
        keywords: data.keywords,
        template_id: id
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Update comment responder response:', response.data);

      return {
        success: true,
        message: 'Comment responder updated successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating comment responder:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update comment responder',
        data: error.response?.data
      };
    }
  }

  /**
   * Load data for plugins (optin templates and posts)
   */
  async loadDataForPlugins(data: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/load-data-for-plugins', {
        apikey: apiKey,
        data
      }, {
        timeout: 30000 // 30 seconds timeout
      });
      console.log('Load data for plugins response:', response.data);
      return { success: true, message: 'Data for plugins loaded successfully', data: response.data };
    } catch (error: any) {
      console.error('Error loading data for plugins:', error);
      return { success: false, message: error.response?.data?.message || error.message || 'Failed to load data for plugins', data: error.response?.data };
    }
  }

  /**
   * Create broadcast task
   */
  async createBroadcastTask(payload: {
    description: string;
    fall_back: boolean;
    response: string;
    tag: string;
    type: number;
    user_segment: string;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      console.log('Making API call to create broadcast task with payload:', payload);
      
      const response = await axiosInstance.post('/v1/schedule/task/broadcast/create', {
        apikey: apiKey,
        ...payload
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Create broadcast task response:', response.data);
      console.log('Response status:', response.status);

      return {
        success: true,
        message: 'Broadcast task created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating broadcast task:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create broadcast task',
        data: error.response?.data
      };
    }
  }

  async createWhatsappBroadcastTask(payload: {
    title: string;
    message: string;
    template: string; // Changed from template_id: number
    user_segment: string;
    users: Array<{ phone_number: string }>;
    template_data?: string | null;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      console.log('Making API call to create WhatsApp broadcast task with payload:', payload);
      
      // Transform the payload to match the expected API format
      const apiPayload = {
        apikey: apiKey,
        type: 8,
        template: payload.template, // Convert template_id to string
        users: payload.users,
        template_data: payload.template_data ? JSON.parse(payload.template_data) : null
      };
      
      const response = await axiosInstance.post('/v1/whatsapp/single-message-send', apiPayload, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Create WhatsApp broadcast task response:', response.data);
      console.log('Response status:', response.status);

      return {
        success: true,
        message: 'WhatsApp broadcast task created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating WhatsApp broadcast task:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create WhatsApp broadcast task',
        data: error.response?.data
      };
    }
  }

  /**
   * Save webhook settings
   */
  async saveWebhookSettings(settings: {
    business_id: string;
    catalog_access_token: string;
    order_webhook?: string;
    catalog_id?: string | null;
  }): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post('/v1/bot/whatsapp/webhook/update', {
        apikey: apiKey,
        ...settings
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Save webhook settings response:', response.data);

      return {
        success: true,
        message: 'Webhook settings saved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error saving webhook settings:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to save webhook settings',
        data: error.response?.data
      };
    }
  }

  /**
   * Connect/disconnect catalog
   */
  async connectCatalog(url: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.post(url, {
        apikey: apiKey
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Connect catalog response:', response.data);

      return {
        success: true,
        message: 'Catalog operation completed successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error connecting catalog:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to connect catalog',
        data: error.response?.data
      };
    }
  }

  /**
   * Get catalog data
   */
  async getCatalog(): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      const response = await axiosInstance.get('/v1/bot/whatsapp/catalogs', {
        params: {
          apikey: apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Get catalog response:', response.data);

      return {
        success: true,
        message: 'Catalog data retrieved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting catalog data:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get catalog data',
        data: error.response?.data
      };
    }
  }

  /**
   * Update WhatsApp Dialog360 profile
   */
  async updateDialog360Profile(profile: string, image?: File): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      
      const formData = new FormData();
      formData.append('profile', profile);
      formData.append('apikey', apiKey);
      
      if (image) {
        formData.append('image', image);
      }

      const response = await axiosInstance.post('/v1/bot/dialog360/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Update Dialog360 profile response:', response.data);

      return {
        success: true,
        message: 'WhatsApp profile updated successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating Dialog360 profile:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update WhatsApp profile',
        data: error.response?.data
      };
    }
  }

  /**
   * Get segment users
   */
  async getSegmentUsers(segmentId: string, type: string): Promise<PublishResponse> {
    try {
      const {apiKey} = useBotStore();
      
      const response = await axiosInstance.get(`/v1/get-segment-users?segment_id=${segmentId}&type=${type}`, {
        params: { apikey: apiKey },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Get segment users response:', response.data);

      return {
        success: true,
        message: 'Segment users fetched successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching segment users:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch segment users',
        data: error.response?.data
      };
    }
  }
}

export const publishApi = PublishApiService.getInstance(); 