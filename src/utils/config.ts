const url = window.location.pathname
export const BOTSIFY_BASE_URL = import.meta.env.VITE_BOTSIFY_BASE_URL || 'https://botsify.com/api';
export const BOTSIFY_AUTH_TOKEN = import.meta.env.VITE_BOTSIFY_AUTH_TOKEN || '';
export const BOTSIFY_APIKEY = url.split('/chat/')[1]
// export const BOTSIFY_APIKEY = "H9MzZn62ZISSYhzzABbNfPs6tfL1QPLv8wFK06o1"

// export const BOTSIFY_APIKEY = (): string => {
//   const pathMatch = window.location.pathname.match(/\/agent\/([^/]+)/);
//   return pathMatch ? pathMatch[1] : '';
// }