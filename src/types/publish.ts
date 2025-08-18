// Facebook Page Types
export interface FacebookPage {
  id: string;
  name: string;
  connected_page_bot?: string | null;
  access_token?: string | null;
  category?: string;
  profile_picture_url?: string | null;
}

// Facebook Page for Template (processed data)
export interface FacebookPageForTemplate {
  id: string;
  name: string;
  is_bot_page: boolean;
  status: 'connected' | 'disconnected';
  botName: string | null;
  accessToken: string | null;
  category?: string;
  profile_picture_url?: string | null;
}

export interface FacebookPageData {
  data: FacebookPage[];
}

export interface FacebookPagesResponse {
  data: {
    pagesData: FacebookPageData;
  };
}

// Instagram Page Types
export interface InstagramPage {
  id: string;
  name: string;
  username: string;
  followers_count: number;
  follows_count: number;
  connected_page_bot?: string | null;
  access_token?: string | null;
  instagram_business_account: string | null;
  profile_picture_url?: string | null;
}

// Bot Details Types
export interface BotDetails {
  id: string;
  name: string;
  status: string;
  type: string;
  settings?: Record<string, any>;
}

// Publish Status Types
export interface PublishStatus {
  status: string;
  message?: string;
  data?: Record<string, any>;
}

// Third Party Config Types
export interface ThirdPartyConfig {
  telegramConf: {
    access_token: string;
    bot_name: string;
    telegram_number: string;
    telegram_url: string;
  };
  twilioConf: {
    sid: string;
    auth_token: string;
    number: string;
    sender_id: string;
  };
}


// SMS Template Types
export interface SmsTemplate {
  id: number;
  name: string;
  text: string;
  content?: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  template_buttons?: SmsTemplateButton[];
  buttons?: SmsTemplateButton[];
  image_url?: string;
  attachment_link?: string;
}

export interface SmsTemplateButton {
  id?: number;
  api: number;
  error: boolean;
  payload: string;
  response: string;
  signature_hash: string;
  btn_slug?: string;
  title: string;
  type: 'postback' | 'url' | 'phone_number';
  url: string;
  isEditing?: boolean;
}




// Broadcast Report Types
export interface BroadcastReport {
  id: string;
  title: string;
  message: string;
  status: string;
  sent_count: number;
  total_count: number;
  created_at: string;
  sent_at?: string;
}

// SMS Report Types
export interface SmsReport {
  id: string;
  phone_number: string;
  message: string;
  status: string;
  sent_at: string;
  delivered_at?: string;
}

// Comment Responder Types
export interface CommentResponder {
  id: number;
  message: string;
  post_id: number;
  keywords: string;
  status: string;
  optin_json: string;
  created_at: string;
  updated_at: string;
}
// Landing Settings Types
export type BackgroundStyle = 'primary' | 'gradient' | 'secondary' | 'plain-primary' | 'plain-secondary';

// Telegram Settings Types
export interface TelegramSettings {
  accessToken: string;
  botName: string;
  telegramNumber: string;
  telegramChatbotUrl: string;
}

// Twilio Settings Types
export interface TwilioSettings {
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioSmsNumber: string;
  twilioSenderId: string;
}

// WhatsApp Settings Types
export interface WhatsAppSettings {
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
}

// Webhook Settings Types
export interface WebhookSettings {
  business_id: string;
  catalog_access_token: string;
  order_webhook?: string;
  catalog_id?: string | null;
}

// Catalog Types
export interface Catalog {
  id: string;
  name: string;
  url: string;
  status: string;
  connected_at: string;
}

// Segment Users Types
export interface SegmentUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  segment_id: string;
  created_at: string;
}

export interface SegmentUsersResponse {
  data: SegmentUser[];
  total: number;
}

// Broadcast Task Types
export interface BroadcastTask {
  title: string;
  message: string;
  template: string;
  user_segment: string;
  users: Array<{ phone_number: string }>;
  template_data?: string | null;
}

// SMS Broadcast Types
export interface SmsBroadcast {
  template_id: number;
  user_segment: string;
  users: Array<{ phone_number: string }>;
  send_at?: string | null;
}

export interface SmsReportData  {
  id: number;
  message: string;
  number: string;
  failure_reason: string;
  sent_time: string;
  failed: number;
  delivered: number;
  sent: number;
}

// Types
export interface PaginationData {
  page: number;
  perPage: number;
  total: number;
  to: number;
  prev_page_url: string | null;
}
