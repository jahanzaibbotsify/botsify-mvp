import { defineStore } from 'pinia';


import { useChatStore } from './chatStore';



export const useApiKeyStore = defineStore('apiKey', {
  state: () => ({
    apiKey: '',
    userId: ''
  }),
  actions: {
    setApiKey(key: string) {
      this.apiKey = key;
      const chatStore= useChatStore();
      chatStore.loadFromStorage();
    },
    setUserId(id: string) {
      this.userId = id;
    }
  }
})
