import { User } from '@/types';
import { defineStore } from 'pinia';
import { getCurrentApiKey, setApiKey, clearApiKey as clearApiKeyUtil } from '@/utils/apiKeyUtils';


export const useBotStore = defineStore('bot', {
  state: () => ({
    apiKey: getCurrentApiKey(),
    user: null as User | null,
    botId: '',
    botName: '',
    isLoading: true,
  }),
  getters: {
    getApiKey: (state) => state.apiKey,
    isApiKeySet: (state) => state.apiKey.length > 0,
  },
  actions: {
    setIsLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },
    setBotId(id: string) {
      this.botId = id;
    },
    setApiKey(key: string) {
      this.apiKey = key;
      this.isLoading = true;
      setApiKey(key);
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
  }
})
