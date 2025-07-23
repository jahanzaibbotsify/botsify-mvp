import { defineStore } from 'pinia';


export const useApiKeyStore = defineStore('apiKey', {
  state: () => ({
    apiKey: '',
    userId: ''
  }),
  actions: {
    setApiKey(key: string) {
      this.apiKey = key;
    },
    setUserId(id: string) {
      this.userId = id;
    }
  }
})
