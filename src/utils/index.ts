import moment from 'moment-timezone';

export const currentTime = () => {
  return moment.utc().format('YYYY-MM-DD HH:mm:ss');
};

export const formatTime = (timestamp: string) => {
  // Parse the timestamp in UTC and return relative time from now (also in UTC)
  return moment.utc(timestamp).fromNow(); // e.g. "2 hours ago"
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