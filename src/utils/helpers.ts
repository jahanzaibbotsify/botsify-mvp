/**
 * Consolidated Helper Utilities
 */

import moment from 'moment-timezone';

// Time and Date Utilities
export const timeUtils = {
  currentTime(): string {
    return moment.utc().format('YYYY-MM-DD HH:mm:ss');
  },

  formatTime(timestamp: string): string {
    return moment.utc(timestamp).fromNow();
  },

  formatDate(date: string | Date, format = 'MMM DD, YYYY'): string {
    return moment(date).format(format);
  }
};

// Platform Utilities
export const platformUtils = {
  getPlatformClass(platform: string = ''): string {
    const platformMap: Record<string, string> = {
      facebook: 'platform-facebook',
      whatsapp: 'platform-whatsapp',
      web: 'platform-web',
      instagram: 'platform-instagram',
      telegram: 'platform-telegram'
    };
    return platformMap[platform.toLowerCase()] || 'platform-default';
  },

  getPlatformIcon(platform: string = ''): string {
    const iconMap: Record<string, string> = {
      facebook: 'pi pi-facebook',
      whatsapp: 'pi pi-whatsapp',
      web: 'pi pi-globe',
      instagram: 'pi pi-instagram',
      telegram: 'pi pi-telegram'
    };
    return iconMap[platform?.toLowerCase()] || 'pi pi-globe';
  }
};

// Validation Utilities
export const validationUtils = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isEmpty(value: string): boolean {
    return !value || value.trim().length === 0;
  }
};

// Legacy exports
export const currentTime = timeUtils.currentTime;
export const formatTime = timeUtils.formatTime;
export const getPlatformClass = platformUtils.getPlatformClass;
export const getPlatformIcon = platformUtils.getPlatformIcon; 