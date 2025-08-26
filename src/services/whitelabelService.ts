import { axiosInstance } from '@/utils/axiosInstance'
import { BOTSIFY_WEB_URL } from '@/utils/config'
import type { WhitelabelPackage, WhitelabelConfig } from '@/types/whitelabel'

export interface WhitelabelResponse {
  data: WhitelabelConfig | null
  error: string | null
}

class WhitelabelService {
  private config: WhitelabelConfig | null = null
  private packages: WhitelabelPackage[] = []
  private isInitialized = false
  private whitelabelId: number | null = null

  /**
   * Get the current domain for the whitelabel API call
   */
  private getCurrentDomain(): string {
    return window.location.hostname
  }

  /**
   * Check if current URL matches BOTSIFY_WEB_URL
   */
  private isBotsifyWebUrl(): boolean {
    const currentUrl = window.location.origin
    return currentUrl === BOTSIFY_WEB_URL
  }

  /**
   * Public method to check if current URL matches BOTSIFY_WEB_URL
   */
  isRunningOnBotsifyWeb(): boolean {
    return this.isBotsifyWebUrl()
  }

  /**
   * Fetch whitelabel configuration from API
   */
  async fetchConfig(): Promise<WhitelabelResponse> {
    // Skip API call if current URL matches BOTSIFY_WEB_URL
    if (this.isBotsifyWebUrl()) {
      console.log('Skipping whitelabel config API call - running on BOTSIFY_WEB_URL')
      return { data: null, error: null }
    }

    try {
      const domain = this.getCurrentDomain()
      const response = await axiosInstance.post('v1/whitelabel/config', { domain })
      
      if (response.data) {
        this.config = response.data
        this.whitelabelId = response.data.id
        this.isInitialized = true
        
        // Store whitelabel ID in localStorage for axios interceptors to use
        if (this.whitelabelId) {
          localStorage.setItem('whitelabelId', this.whitelabelId.toString())
        }
        
        return { data: this.config, error: null }
      }
      
      return { data: null, error: 'No configuration data received' }
    } catch (error: any) {
      console.warn('Whitelabel configuration not available:', error.message)
      return { data: null, error: error.message }
    }
  }

  /**
   * Fetch whitelabel packages from API
   */
  async fetchPackages(userId?: string): Promise<{ data: WhitelabelPackage[] | null; error: string | null }> {
    // Skip API call if current URL matches BOTSIFY_WEB_URL
    if (this.isBotsifyWebUrl()) {
      console.log('Skipping whitelabel packages API call - running on BOTSIFY_WEB_URL')
      return { data: null, error: null }
    }

    try {
      let url = 'v1/whitelabel-packages'
      if (userId) {
        url += `/${userId}`
      }
      
      const response = await axiosInstance.get(url)
      
      // Handle both array and nested object responses
      let packagesData = null
      if (response.data?.packages) {
        // If packages are nested under a 'packages' key
        packagesData = Array.isArray(response.data.packages) ? response.data.packages : [response.data.packages]
      } else if (Array.isArray(response.data)) {
        // If response is directly an array
        packagesData = response.data
      }
      
      if (packagesData && packagesData.length > 0) {
        this.packages = packagesData
        return { data: this.packages, error: null }
      }
      
      return { data: null, error: 'No packages data received' }
    } catch (error: any) {
      console.warn('Whitelabel packages not available:', error.message)
      return { data: null, error: error.message }
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): WhitelabelConfig | null {
    return this.config
  }

  /**
   * Get the current packages
   */
  getPackages(): WhitelabelPackage[] {
    return this.packages
  }

  /**
   * Check if whitelabel is configured
   */
  isConfigured(): boolean {
    return this.isInitialized && this.config !== null
  }

  /**
   * Check if packages are available
   */
  hasPackages(): boolean {
    return this.packages.length > 0
  }

  /**
   * Check if portal button should be enabled
   */
  isPortalEnabled(): boolean {
    return this.config?.is_whitelabel === 1
  }

  /**
   * Check if registration is allowed
   */
  isRegistrationAllowed(): boolean {
    return this.config?.show_whitelabel_register !== false
  }

  /**
   * Apply whitelabel configuration to the DOM
   */
  applyConfiguration(): void {
    if (!this.config) return

    // Apply company name to document title
    if (this.config.company_name) {
      document.title = `${this.config.company_name} Agent`
    }

    // Apply favicon
    if (this.config.favicon) {
      this.applyFavicon(this.config.favicon)
    }

    // Apply logo
    if (this.config.logo) {
      this.applyLogo(this.config.logo)
    }

    // Apply colors to CSS custom properties
    if (this.config.primary_color && this.config.secondary_color) {
      this.applyColors(this.config.primary_color, this.config.secondary_color)
    }
    
  }

  /**
   * Apply favicon to the document
   */
  private applyFavicon(faviconUrl: string): void {
    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll("link[rel*='icon']")
    existingFavicons.forEach(link => link.remove())

    // Create new favicon link
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/x-icon'
    link.href = faviconUrl
    document.head.appendChild(link)
  }

  /**
   * Apply logo to the document (for use in components)
   */
  private applyLogo(logoUrl: string): void {
    // Store logo URL in a data attribute for components to access
    document.documentElement.setAttribute('data-whitelabel-logo', logoUrl)
  }

  /**
   * Apply colors to CSS custom properties
   */
  private applyColors(primaryColor: string, secondaryColor: string): void {
    const root = document.documentElement
    
    // Apply primary colors
    root.style.setProperty('--color-primary', primaryColor)
    root.style.setProperty('--color-primary-hover', this.adjustColor(primaryColor, 20))
    root.style.setProperty('--color-primary-active', this.adjustColor(primaryColor, -20))
    
    // Apply secondary colors
    root.style.setProperty('--color-secondary', secondaryColor)
    root.style.setProperty('--color-accent', secondaryColor)
  }

  /**
   * Helper function to adjust color brightness
   */
  private adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  /**
   * Reset to default configuration
   */
  resetToDefault(): void {
    this.config = null
    this.packages = []
    this.isInitialized = false
    this.whitelabelId = null
    
    // Remove whitelabel ID from localStorage
    localStorage.removeItem('whitelabelId')
    
    // Reset document title
    document.title = 'Botsify Agent'
    
    // Reset favicon
    this.applyFavicon('/favicon.png')
    
    // Remove logo data attribute
    document.documentElement.removeAttribute('data-whitelabel-logo')
    
    // Reset colors to default
    const root = document.documentElement
    root.style.removeProperty('--color-primary')
    root.style.removeProperty('--color-primary-hover')
    root.style.removeProperty('--color-primary-active')
    root.style.removeProperty('--color-secondary')
    root.style.removeProperty('--color-accent')
  }
}

// Export singleton instance
export const whitelabelService = new WhitelabelService()
