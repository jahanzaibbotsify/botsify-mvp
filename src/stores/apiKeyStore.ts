import { defineStore } from 'pinia';


export const useApiKeyStore = defineStore('apiKey', {
  state: () => ({
    apiKey: localStorage.getItem('bot_api_key') ?? '',
    apiKeyConfirmed: false,
    userId: ''
  }),
  actions: {
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
