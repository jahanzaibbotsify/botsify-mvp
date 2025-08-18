import { defineStore } from 'pinia';
import { publishApi } from '@/services/publishApi';
import { createResource } from '@/utils/caching';
import type { 
  WhatsAppSettings,
} from '@/types';

export const usePublishStore = defineStore('publish', () => {
  const publishStatus = createResource(() => publishApi.getPublishStatus());
  const smsSegmentUsers = createResource(() => publishApi.getSegmentUsers('-1', 'sms'));
  const whatsappSegmentUsers = createResource(() => publishApi.getSegmentUsers('-1', 'whatsapp'));
  const whatsappConfig = createResource(() => publishApi.getWhatsappConfig());

  const facebookPages = createResource(() => publishApi.getFacebookPages());
  const instagramPages = createResource(() => publishApi.getInstagramPages());
  const commentResponder = createResource(() => publishApi.fetchFbCommentResponder(1));
  
  const thirdPartyConfig = createResource(() => publishApi.getThirdPartyConfig());
  const smsTemplates = createResource(
    (page = 1, perPage = 20, query?: string) =>
      publishApi.fetchSmsTemplates(page, perPage, query)
  );
  const smsReport = createResource(
    (page = 1, perPage = 20, query?: string, startDate?: string, endDate?: string) =>
      publishApi.fetchSmsReport(page, perPage, query, startDate, endDate)
  );

  // Whatsapp
  const whatsappReport = createResource(
    (page = 1, perPage = 20, query?: string, startDate?: string, endDate?: string) =>
      publishApi.getWhatsAppBroadcastReport({page, per_page: perPage, query, start_date: startDate, end_date: endDate})
  );

  const whatsappTemplates = createResource(
    (page = 1, perPage = 20, query?: string) =>
      publishApi.fetchWhatsAppTemplates(page, perPage, query)
  );

  const whatsappCatalog = createResource(() => publishApi.getCatalog());



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


  const saveWhatsAppSettings = async (settings: WhatsAppSettings) => {
    try {
      const result = await publishApi.saveWhatsAppSettings(settings);
      
      if (result.success) {
        publishStatus.invalidate();
        whatsappConfig.invalidate();
        
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || `Failed to save ${settings.type === '360_dialog' ? 'Dialog360' : 'Meta Cloud'} settings` };
      }
    } catch (err: any) {
      return { success: false, error: err.message || `Failed to save ${settings.type === '360_dialog' ? 'Dialog360' : 'Meta Cloud'} settings` };
    }
  };

  // SMS Templates

  const resetStore = () => {
    smsTemplates.clear();
    whatsappTemplates.clear();
    whatsappSegmentUsers.clear();
    whatsappConfig.clear();
    whatsappReport.clear();
    whatsappCatalog.clear();
    smsSegmentUsers.clear();
    smsReport.clear();
    publishStatus.clear();
    facebookPages.clear();
    instagramPages.clear();
    commentResponder.clear();
    thirdPartyConfig.clear();
  };

  const createTemplate = async (templateData: any, type?: string) => {
    try {
      const result = await publishApi.createTemplate(templateData, type);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Failed to create WhatsApp template' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create WhatsApp template' };
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
    try {
      const result = await publishApi.createWhatsappBroadcastTask(payload);

      if (result.success) {
        whatsappReport.invalidate();
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Failed to create WhatsApp broadcast task' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create WhatsApp broadcast task' };
    }
  };

  const sendSmsBroadcast = async (payload: {
    template_id: number;
    user_segment: string;
    users: Array<{ phone_number: string }>;
    send_at?: string | null;
  }) => {
    try {
      const result = await publishApi.sendSmsBroadcast(payload);
      if (result.success) {
        smsReport.invalidate();
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Failed to send SMS broadcast' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send SMS broadcast' };
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

    // whatsapp
    whatsappSegmentUsers,
    whatsappConfig,
    whatsappTemplates,
    whatsappReport,
    whatsappCatalog,

    
    // Actions
    saveWhatsAppSettings,
    createWhatsappBroadcastTask,
    resetStore
  };
}); 