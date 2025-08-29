<template>
  <div class="test-agent-view"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { APP_URL, BOTSIFY_WEB_URL } from '@/utils/config'
import { useWhitelabelStore } from '@/stores/whitelabelStore'

let intervalId: number | undefined

const route = useRoute()

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Avoid loading twice
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://widget.osam.one/dist/css/app.css'
    document.head.appendChild(css)

    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load widget script'))
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  const apiKeyParam = route.params.apikey as string | undefined
  const host = BOTSIFY_WEB_URL
  if (!apiKeyParam) return

  // Initialize whitelabel header (title, favicon) when not running on APP_URL
  try {
    if (window.location.origin !== APP_URL) {
      const whitelabelStore = useWhitelabelStore()
      await whitelabelStore.initialize()
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Whitelabel initialization failed:', (e as any)?.message || e)
  }

  try {
    await loadScript('https://widget.osam.one/dist/js/app.js')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return
  }

  let attempts = 0
  intervalId = window.setInterval(() => {
    // @ts-ignore third-party global
    if (typeof window.bcw_widget !== 'undefined') {
      if (intervalId) window.clearInterval(intervalId)
      const botParams = {
        bot_api: apiKeyParam,
        landing: true,
        host
      }
      // @ts-ignore third-party global
      window.bcw_widget.init('show', botParams)
    }
    attempts += 1
    if (attempts === 20 && intervalId) {
      // eslint-disable-next-line no-console
      console.log('complete 20 times')
      window.clearInterval(intervalId)
    }
  }, 300)
})

onBeforeUnmount(() => {
  if (intervalId) {
    window.clearInterval(intervalId)
  }
  // Do not remove the script tag if other pages may reuse it
})
</script>

<style scoped>
.test-agent-view {
  min-height: 100vh;
}

/* widget style */
:global(#bcw-chatbot-menu) { margin-right: 300px !important; }
:global(.widget-div-active) { padding: 0 300px; }
:global(.bg-white.chatHeight) {
  margin-top: 0.5% !important;
  height: 96vh !important;
  border: 2px solid var(--color-border);
}
:global(.bcw5611 .rounded-tr-none) {
  border-top-right-radius: 18px !important;
  border-top-left-radius: 18px !important;
}
:global(div#bcw5611_ID) { border-radius: 0 !important; }
</style>