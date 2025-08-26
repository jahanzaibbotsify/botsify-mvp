import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { whitelabelService } from '@/services/whitelabelService'
import type { WhitelabelConfig, WhitelabelPackage } from '@/types/whitelabel'

export const useWhitelabelStore = defineStore('whitelabel', () => {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Local reactive mirrors of service data for reactivity
  const config = ref<WhitelabelConfig | null>(null)
  const packages = ref<WhitelabelPackage[]>([])

  // Hydrate initial state from service if already initialized elsewhere (e.g., main.ts)
  config.value = whitelabelService.getConfig()
  packages.value = whitelabelService.getPackages()
  isInitialized.value = whitelabelService.isConfigured()

  // Getters
  const isConfigured = computed(() => isInitialized.value && config.value !== null)
  const companyName = computed(() => config.value?.company_name || 'Botsify')
  const logo = computed(() => config.value?.logo || null)
  const favicon = computed(() => config.value?.favicon || null)
  const primaryColor = computed(() => config.value?.primary_color)
  const secondaryColor = computed(() => config.value?.secondary_color)
  const hasPackages = computed(() => packages.value.length > 0)
  // For UI logic, treat presence of packages as enough to show pricing
  const shouldShowWhitelabelPlans = computed(() => hasPackages.value)
  const isRegistrationAllowed = computed(() => config.value?.show_whitelabel_register !== false)
  const isPortalEnabled = computed(() => config.value?.is_whitelabel === 1)
  const isRunningOnBotsifyWeb = computed(() => whitelabelService.isRunningOnBotsifyWeb())
  const whitelabelId = computed(() => {
    const storedId = localStorage.getItem('whitelabelId')
    return storedId ? parseInt(storedId, 10) : null
  })

  // Actions
  const initialize = async (): Promise<void> => {
    if (isInitialized.value) return
    isLoading.value = true
    error.value = null
    try {
      const response = await whitelabelService.fetchConfig()
      if (response.data) {
        config.value = response.data
        isInitialized.value = true
        whitelabelService.applyConfiguration()
      } else if (response.error) {
        error.value = response.error
      } else {
        // No data and no error - likely skipped due to APP_URL
        // Set as initialized to prevent repeated calls
        isInitialized.value = true
        console.log('Whitelabel initialization skipped - running on APP_URL')
      }
    } catch (err: any) {
      error.value = err?.message || 'Failed to load whitelabel configuration'
    } finally {
      isLoading.value = false
    }
  }

  const fetchPackages = async (userId?: string): Promise<void> => {
    try {
      const { data } = await whitelabelService.fetchPackages(userId)
      if (data) {
        packages.value = data
      } else {
        // No data - likely skipped due to APP_URL
        console.log('Whitelabel packages fetch skipped - running on APP_URL')
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch whitelabel packages:', err?.message)
    }
  }

  const reset = (): void => {
    whitelabelService.resetToDefault()
    isInitialized.value = false
    config.value = null
    packages.value = []
    error.value = null
  }

  const getLogoUrl = (): string | null => {
    return document.documentElement.getAttribute('data-whitelabel-logo')
  }

  return {
    // State
    isLoading,
    error,
    isInitialized,
    config,
    packages,

    // Getters
    isConfigured,
    companyName,
    logo,
    favicon,
    primaryColor,
    secondaryColor,
    hasPackages,
    shouldShowWhitelabelPlans,
    isRegistrationAllowed,
    isPortalEnabled,
    isRunningOnBotsifyWeb,
    whitelabelId,

    // Actions
    initialize,
    fetchPackages,
    reset,
    getLogoUrl,
  }
})


