import { User } from '@/types'
import { defineStore } from 'pinia'
import { apiKeyManager } from '@/utils/api'

export const useBotStore = defineStore('bot', {
  state: () => ({
    apiKey: apiKeyManager.getCurrent(),
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
      this.botId = id
    },
    setApiKey(key: string) {
      this.apiKey = key
      apiKeyManager.set(key)
    },
    setApiKeyConfirmed(confirmed: boolean) {
      this.apiKeyConfirmed = confirmed
    },
    setUser(user: User) {
      this.user = user
    },
    setBotName(name: string) {
      this.botName = name
    },
    clearApiKey() {
      this.apiKey = ''
      apiKeyManager.clear()
    },
    extractApiKeyFromUrl() {
      return apiKeyManager.extractFromUrl()
    }
  }
})
