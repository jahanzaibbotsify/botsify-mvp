import { whitelabelService } from '@/services/whitelabelService'

/**
 * Get the current whitelabel logo URL
 */
export function getWhitelabelLogo(): string | null {
  return document.documentElement.getAttribute('data-whitelabel-logo')
}

/**
 * Get the current whitelabel company name
 */
export function getWhitelabelCompanyName(): string {
  const config = whitelabelService.getConfig()
  return config?.company_name || 'Botsify'
}

/**
 * Check if whitelabel is currently configured
 */
export function isWhitelabelConfigured(): boolean {
  return whitelabelService.isConfigured()
}

/**
 * Get the current whitelabel primary color
 */
export function getWhitelabelPrimaryColor(): string {
  const config = whitelabelService.getConfig()
  return config?.primary_color || '#6D3ADB'
}

/**
 * Get the current whitelabel secondary color
 */
export function getWhitelabelSecondaryColor(): string {
  const config = whitelabelService.getConfig()
  return config?.secondary_color || '#10B981'
}

/**
 * Apply whitelabel configuration if available
 */
export function applyWhitelabelIfAvailable(): void {
  if (whitelabelService.isConfigured()) {
    whitelabelService.applyConfiguration()
  }
}
