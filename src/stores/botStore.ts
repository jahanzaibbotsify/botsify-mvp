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
  }
})
