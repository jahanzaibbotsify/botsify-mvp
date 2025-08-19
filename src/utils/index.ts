import { useWhitelabelStore } from '@/stores/whitelabelStore';
import moment from 'moment-timezone';
import { BOTSIFY_WEB_URL } from './config';
import { ref } from 'vue';

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

  export const validateImage = (url?: string, fallback = "/images/elementor-placeholder-image.png") => {
    const result = ref(fallback);
  
    if (!url) {
      result.value = fallback;
      return result;
    }
  
    const img = new Image();
    img.onload = () => (result.value = url);
    img.onerror = () => (result.value = fallback);
    img.src = url;
  
    return result;
  }
  