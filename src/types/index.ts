/**
 * Types Index
 * Central export file for all TypeScript types
 */

// Export API types
export * from './api'

// Export user types
export * from './user'

// Export chat types
export * from './chat'

// Export conversation types
export * from './conversation'

// Export MCP types
export * from './mcp'

// Export Firebase types
export * from './firebase'

// Core application types
export interface User {
  id: string
  name: string
  avatar?: string
  email: string
  subs?: {
    id: string
    status: string
    stripe_plan: string
  }
}

export interface PricingTier {
  id: string
  name: string
  price: number
  features: string[]
  isPopular?: boolean
}