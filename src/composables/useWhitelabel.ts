import { ref, computed, readonly } from 'vue'
import { whitelabelService } from '@/services/whitelabelService'
import type { WhitelabelConfig, WhitelabelPackage } from '@/types/whitelabel'

export function useWhitelabel() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties for easy access
  const config = computed(() => whitelabelService.getConfig())
  const isConfigured = computed(() => whitelabelService.isConfigured())
  const companyName = computed(() => config.value?.company_name || 'Botsify')
  const logo = computed(() => config.value?.logo || null)
  const favicon = computed(() => config.value?.favicon || null)
  const primaryColor = computed(() => config.value?.primary_color || '#6D3ADB')
  const secondaryColor = computed(() => config.value?.secondary_color || '#10B981')
  
  // Packages
  const packages = computed(() => whitelabelService.getPackages())
  const hasPackages = computed(() => whitelabelService.hasPackages())
  
  // Registration control
  const isRegistrationAllowed = computed(() => whitelabelService.isRegistrationAllowed())

  /**
   * Initialize whitelabel configuration
   */
  const initialize = async (): Promise<void> => {
    if (isConfigured.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await whitelabelService.fetchConfig()
      
      if (response.data) {
        whitelabelService.applyConfiguration()
        
        // Also fetch packages if whitelabel is configured
        await fetchPackages()
      } else if (response.error) {
        error.value = response.error
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load whitelabel configuration'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch whitelabel packages
   */
  const fetchPackages = async (userId?: string): Promise<void> => {
    if (!isConfigured.value) return

    try {
      await whitelabelService.fetchPackages(userId)
    } catch (err: any) {
      console.warn('Failed to fetch whitelabel packages:', err.message)
    }
  }

  /**
   * Reset to default configuration
   */
  const reset = (): void => {
    whitelabelService.resetToDefault()
  }

  /**
   * Get logo URL for components
   */
  const getLogoUrl = (): string | null => {
    return document.documentElement.getAttribute('data-whitelabel-logo')
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    config: readonly(config),
    isConfigured: readonly(isConfigured),
    companyName: readonly(companyName),
    logo: readonly(logo),
    favicon: readonly(favicon),
    primaryColor: readonly(primaryColor),
    secondaryColor: readonly(secondaryColor),
    
    // Packages
    packages: readonly(packages),
    hasPackages: readonly(hasPackages),
    
    // Registration control
    isRegistrationAllowed: readonly(isRegistrationAllowed),
    
    // Methods
    initialize,
    fetchPackages,
    reset,
    getLogoUrl
  }
}
