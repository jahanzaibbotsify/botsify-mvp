import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BOTSIFY_WEB_URL } from '@/utils/config'

interface WhitelabelData {
  company_name: string
  primary_color: string
  secondary_color: string
  logo: string | null
  favicon: string | null
  domain: string | null
  mask_url: string
}

export const useWhitelabelStore = defineStore('whitelabel', () => {
  const isWhitelabelClient = ref(false)
  const whitelabelData = ref<WhitelabelData | null>(null)

  // Set whitelabel data from API response
  function setWhitelabelData(data: { is_whitelabel_client: boolean; whitelabel: WhitelabelData }) {
    isWhitelabelClient.value = data.is_whitelabel_client
    whitelabelData.value = data.whitelabel

    // Apply whitelabel colors to CSS custom properties
    if (data.is_whitelabel_client && data.whitelabel) {
      applyWhitelabelColors(data.whitelabel)
      applyWhitelabelFavicon(data.whitelabel.favicon)
    }
  }

  // Apply whitelabel colors to CSS variables
  function applyWhitelabelColors(whitelabel: WhitelabelData) {
    const root = document.documentElement
    root.style.setProperty('--color-primary', whitelabel.primary_color)
    root.style.setProperty('--color-primary-hover', adjustColor(whitelabel.primary_color, 20))
    root.style.setProperty('--color-primary-active', adjustColor(whitelabel.primary_color, -20))
    root.style.setProperty('--color-secondary', whitelabel.secondary_color)
  }

  // Apply whitelabel favicon
  function applyWhitelabelFavicon(favicon: string | null) {
    if (favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link')
      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      link.href = favicon
      document.getElementsByTagName('head')[0].appendChild(link)
    }
  }

  // Clear whitelabel data
  function clearWhitelabelData() {
    isWhitelabelClient.value = false
    whitelabelData.value = null
    
    // Reset CSS custom properties to defaults
    const root = document.documentElement
    root.style.setProperty('--color-primary', '#00A3FF')
    root.style.setProperty('--color-primary-hover', '#33B5FF')
    root.style.setProperty('--color-primary-active', '#0082CC')
    root.style.setProperty('--color-secondary', '#10B981')
  }

  // Helper function to adjust color brightness
  function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // Computed properties
  const companyName = computed(() => whitelabelData.value?.company_name || 'Botsify')
  const primaryColor = computed(() => whitelabelData.value?.primary_color || '#00A3FF')
  const secondaryColor = computed(() => whitelabelData.value?.secondary_color || '#10B981')
  const logo = computed(() => whitelabelData.value?.logo || null)
  const favicon = computed(() => whitelabelData.value?.favicon || null)
  const maskUrl = computed(() => whitelabelData.value?.mask_url || '')
  const isWhitelabel = computed(() => whitelabelData.value !== null)
  const partnerPortalUrl = computed(() => `${BOTSIFY_WEB_URL}/partner`)

  return {
    isWhitelabelClient,
    isWhitelabel,
    whitelabelData,
    setWhitelabelData,
    applyWhitelabelColors,
    applyWhitelabelFavicon,
    clearWhitelabelData,
    companyName,
    primaryColor,
    secondaryColor,
    logo,
    favicon,
    maskUrl,
    partnerPortalUrl
  }
}) 