import { User } from '@/types';
import { defineStore } from 'pinia';
import { getCurrentApiKey, setApiKey, clearApiKey as clearApiKeyUtil } from '@/utils/apiKeyUtils';


export const useBotStore = defineStore('bot', {
  state: () => ({
    apiKey: getCurrentApiKey(),
    apiKeyConfirmed: false,
    user: null as User | null,
    botId: '',
    botName: '',
  }),
  getters: {
    getApiKey: (state) => state.apiKey,
    isApiKeySet: (state) => state.apiKey.length > 0,
  },
  actions: {
    setBotId(id: string) {
      this.botId = id;
    },
    setApiKey(key: string) {
      this.apiKey = key;
      setApiKey(key);
    },
    setApiKeyConfirmed(confirmed: boolean) {
      this.apiKeyConfirmed = confirmed;
    },
    setUser(user: User) {
      this.user = user;
    },
    setBotName(name: string) {
      this.botName = name;
    },
    clearApiKey() {
      this.apiKey = '';
      clearApiKeyUtil();
    },
    extractApiKeyFromUrl() {
      const pathname = window.location.pathname;
      const segments = pathname.split('/').filter(segment => segment.length > 0);
      
      // For routes like /agent/123, the API key is the second segment
      if (segments.length >= 2 && segments[0] === 'agent') {
        const apiKey = segments[1];
        const currentApiKey = this.apiKey || getCurrentApiKey() || '';
        
        // Only update if the API key is different
        if (apiKey && apiKey !== currentApiKey && apiKey !== 'undefined' && apiKey !== 'null') {
          console.log('🔄 BotStore: URL API key differs from current, updating...', {
            urlApiKey: apiKey,
            currentApiKey
          });
          this.setApiKey(apiKey);
          console.log('✅ BotStore: API key updated from URL:', apiKey);
        } else if (apiKey && (!currentApiKey || currentApiKey === 'undefined' || currentApiKey === 'null')) {
          this.setApiKey(apiKey);
          console.log('🔑 BotStore: API key set from URL:', apiKey);
        }
        return apiKey;
      }
      
      // For other routes, try to find a valid API key pattern
      for (const segment of segments) {
        if (segment.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(segment)) {
          const currentApiKey = this.apiKey || getCurrentApiKey() || '';
          
          // Only update if the API key is different
          if (segment && segment !== currentApiKey && segment !== 'undefined' && segment !== 'null') {
            console.log('🔄 BotStore: URL API key differs from current, updating...', {
              urlApiKey: segment,
              currentApiKey
            });
            this.setApiKey(segment);
            console.log('✅ BotStore: API key updated from URL:', segment);
          } else if (segment && (!currentApiKey || currentApiKey === 'undefined' || currentApiKey === 'null')) {
            this.setApiKey(segment);
            console.log('🔑 BotStore: API key set from URL:', segment);
          }
          return segment;
        }
      }
      
      return '';
    }
  }
})
