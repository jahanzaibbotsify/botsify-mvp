<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '@/services/adminApi'
import { useImpersonationStore } from '@/stores/impersonationStore'

const router = useRouter()
const allowed = ref<boolean | null>(null)
const impersonationStore = useImpersonationStore()

onMounted(async () => {
  const ok = await adminApi.verifyAccess()
  if (!ok) {
    router.replace({ name: 'NotFound' })
    return
  }
  allowed.value = true
  router.replace({ name: 'admin-users' })
})
</script>

<template>
  <div v-if="allowed === null" class="admin-loading">
    <p>Checking access…</p>
  </div>
  <div v-else class="admin-layout">
    <header class="admin-header">
      <h1>Admin</h1>
      <div v-if="impersonationStore.isImpersonating" class="impersonation-banner">
        <span>Impersonating user #{{ impersonationStore.impersonatedUserId }}</span>
        <button class="primary" @click="() => impersonationStore.stop().then(() => router.replace('/select-agent'))">Stop Impersonate</button>
      </div>
    </header>
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-loading { padding: var(--space-6); }
.admin-header { padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--color-border); }
.admin-content { padding: var(--space-6); }
.impersonation-banner { display: flex; gap: var(--space-3); align-items: center; }
</style>


