import { defineStore } from 'pinia';


export const useBotStore = defineStore('bot', {
  state: () => ({
    apiKey: localStorage.getItem('bot_api_key') ?? '',
    apiKeyConfirmed: false,
    userId: '',
    botId: '',
  }),
  actions: {
    setBotId(id: string) {
      this.botId = id;
    },
    setApiKey(key: string) {
      this.apiKey = key;
    },
    setApiKeyConfirmed(confirmed: boolean) {
      this.apiKeyConfirmed = confirmed;
    },
    setUserId(id: string) {
      this.userId = id;
    }
  }
})
