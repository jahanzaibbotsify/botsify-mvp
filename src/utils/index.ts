import { useWhitelabelStore } from '@/stores/whitelabelStore';
import moment from 'moment-timezone';
import { BOTSIFY_WEB_URL } from './config';

export const currentTime = () => {
  return moment.utc().format('YYYY-MM-DD HH:mm:ss');
};

export const formatTime = (timestamp: string) => {
  // Parse the timestamp in UTC and return relative time from now (also in UTC)
  return moment.utc(timestamp).fromNow(); // e.g. "2 hours ago"
};

export const formatDate = (timestamp: string | Date) => {
  // Format to a fixed date in UTC, ignoring time
  return moment.utc(timestamp).format('MMM DD YYYY'); // e.g. "2025-08-13"
};

export const formatDateTime = (timestamp: string | Date) => {
  return moment(timestamp).format("MMM DD YYYY HH:mm:ss"); // e.g. "2025-08-13 17:00:00"
};

export const getPlatformClass = (platform: string = '') => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return 'platform-facebook'
      case 'whatsapp':
        return 'platform-whatsapp'
      case 'web':
        return 'platform-web'
      case 'instagram':
        return 'platform-instagram'
      case 'telegram':
        return 'platform-telegram'
      default:
        return 'platform-default'
    }
  }
  
  export const getPlatformIcon = (platform: string = '') => {
    switch (platform?.toLowerCase()) {
      case 'facebook':
        return 'pi pi-facebook'
      case 'whatsapp':
        return 'pi pi-whatsapp'
      case 'web':
        return 'pi pi-globe'
      case 'instagram':
        return 'pi pi-instagram'
      case 'telegram':
        return 'pi pi-telegram'
      default:
        return 'pi pi-globe'
    }
  }

  export const getWebUrl = () => {
    const whitelabelStore = useWhitelabelStore();
    if (whitelabelStore.isWhitelabelClient && whitelabelStore.maskUrl) {
      return whitelabelStore.maskUrl;
    }
    return BOTSIFY_WEB_URL;
  }

  export const validateImage = (
    url?: string,
    fallback = "/images/elementor-placeholder-image.png",
    onValidated?: (finalUrl: string) => void
  ): string => {
    if (!url || typeof url !== "string") return fallback;
    const trimmed = url.trim();
    if (!trimmed) return fallback;
  
    // Quick extension check
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
    if (!allowedExtensions.some((ext) => trimmed.toLowerCase().endsWith(ext))) {
      return fallback;
    }
  
    // Async check
    const img = new Image();
    img.onload = () => onValidated?.(trimmed);
    img.onerror = () => onValidated?.(fallback);
    img.src = trimmed;
  
    return fallback; // immediate safe value
  };
  
