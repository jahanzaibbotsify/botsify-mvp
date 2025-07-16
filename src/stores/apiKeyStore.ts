import { defineStore } from 'pinia';


import { useChatStore } from './chatStore';



export const useApiKeyStore = defineStore('apiKey', {
  state: () => ({
    apiKey: ''
  }),
  actions: {
    setApiKey(key: string) {
      this.apiKey = key;
      const chatStore= useChatStore();
      chatStore.loadFromStorage();
    }
  }
})
