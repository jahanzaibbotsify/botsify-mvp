import { defineStore } from 'pinia'

export const useApiKeyStore = defineStore('apiKey', {
  state: () => ({
    apiKey: ''
  }),
  actions: {
    setApiKey(key: string) {
      this.apiKey = key
    }
  }
})
