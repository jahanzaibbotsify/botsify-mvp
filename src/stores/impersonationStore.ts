import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { impersonationApi } from '@/services/impersonationApi'

export const useImpersonationStore = defineStore('impersonation', () => {
  const impersonatedUserId = ref<number | null>(null)
  const isImpersonating = computed(() => impersonatedUserId.value !== null)

  async function start(userId: number) {
    const res = await impersonationApi.start(userId)
    if (res.status) {
      impersonatedUserId.value = res.impersonated_user_id
    }
    return res
  }

  async function stop() {
    const res = await impersonationApi.stop()
    if (res.status) {
      impersonatedUserId.value = null
    }
    return res
  }

  return { impersonatedUserId, isImpersonating, start, stop }
})


