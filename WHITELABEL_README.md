# Whitelabel System Documentation

## Overview

The whitelabel system allows the application to dynamically apply custom branding (logo, colors, company name, favicon) and display custom pricing packages based on the current domain. This is achieved by calling the `v1/whitelabel/config` and `v1/whitelabel/packages` API endpoints before the app loads.

## Architecture

### 1. WhitelabelService (`src/services/whitelabelService.ts`)
- **Singleton service** that manages whitelabel configuration and packages
- **API Integration**: Calls `v1/whitelabel/config` and `v1/whitelabel/packages` with current domain
- **DOM Manipulation**: Applies configuration to document (title, favicon, colors)
- **Configuration Storage**: Stores and manages whitelabel settings and packages
- **Package Management**: Fetches and manages custom pricing packages
- **Registration Control**: Controls whether user registration is allowed

### 2. useWhitelabel Composable (`src/composables/useWhitelabel.ts`)
- **Vue 3 Composition API** hook for easy access to whitelabel functionality
- **Reactive State**: Provides reactive access to whitelabel configuration and packages
- **Error Handling**: Manages loading states and error handling
- **Easy Integration**: Simple API for components to use
- **Package Access**: Easy access to whitelabel packages for pricing displays
- **Registration Control**: Easy access to registration permission status

### 3. WhitelabelLogo Component (`src/components/ui/WhitelabelLogo.vue`)
- **Reusable Component**: Displays whitelabel logo with fallback
- **Size Variants**: Small, medium, large sizes
- **Error Handling**: Falls back to default logo if whitelabel logo fails to load
- **Responsive**: Automatically adjusts based on whitelabel configuration

### 4. Utility Functions (`src/utils/whitelabelUtils.ts`)
- **Helper Functions**: Easy access to whitelabel data
- **Type Safety**: TypeScript interfaces for whitelabel configuration
- **Fallback Values**: Default values when whitelabel is not configured

### 5. Types (`src/types/whitelabel.ts`)
- **WhitelabelPackage Interface**: Defines structure of whitelabel packages
- **WhitelabelPackagesResponse Interface**: Defines API response structure
- **WhitelabelConfig Interface**: Defines structure of whitelabel configuration
- **Type Safety**: Ensures proper typing throughout the system

## How It Works

### 1. App Initialization
```typescript
// In main.ts - called before app mounts
const initializeWhitelabel = async () => {
  try {
    await whitelabelService.fetchConfig()
    if (whitelabelService.isConfigured()) {
      whitelabelService.applyConfiguration()
      
      // Also fetch packages if whitelabel is configured
      await whitelabelService.fetchPackages()
    }
  } catch (error) {
    console.warn('Whitelabel initialization failed:', error)
  }
}
```

### 2. API Calls
- **Configuration Endpoint**: `POST v1/whitelabel/config`
  - Payload: `{ domain: "current-domain.com" }`
  - Response: Whitelabel configuration object
- **Packages Endpoint**: `GET v1/whitelabel/packages`
  - Response: Whitelabel packages array

### 3. Configuration Application
- **Document Title**: Updated to include company name
- **Favicon**: Replaced with whitelabel favicon
- **CSS Variables**: Colors applied to CSS custom properties
- **Logo Storage**: Logo URL stored in DOM data attribute
- **Package Integration**: Custom packages available for pricing displays
- **Registration Control**: User registration can be disabled

## Usage Examples

### In Components
```vue
<template>
  <div>
    <WhitelabelLogo size="medium" />
    <h1>Welcome to {{ companyName }}</h1>
    
    <!-- Display whitelabel packages if available -->
    <div v-if="hasPackages">
      <h2>{{ companyName }} Plans</h2>
      <div v-for="pkg in packages" :key="pkg.id">
        <h3>{{ pkg.name }}</h3>
        <p>${{ pkg.price }} - {{ pkg.total_bots }} Agents</p>
      </div>
    </div>
    
    <!-- Only show signup link if registration is allowed -->
    <div v-if="isRegistrationAllowed">
      <router-link to="/auth/signup">Sign up</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWhitelabel } from '@/composables/useWhitelabel'
import WhitelabelLogo from '@/components/ui/WhitelabelLogo.vue'

const { companyName, packages, hasPackages, isRegistrationAllowed } = useWhitelabel()
</script>
```

### In Composables
```typescript
import { useWhitelabel } from '@/composables/useWhitelabel'

export function useMyFeature() {
  const { isConfigured, primaryColor, packages, isRegistrationAllowed } = useWhitelabel()
  
  const customStyle = computed(() => ({
    backgroundColor: isConfigured.value ? primaryColor.value : '#default-color'
  }))
  
  const availablePlans = computed(() => {
    return packages.value || []
  })
  
  const canRegister = computed(() => {
    return isRegistrationAllowed.value
  })
  
  return { customStyle, availablePlans, canRegister }
}
```

### Direct Service Usage
```typescript
import { whitelabelService } from '@/services/whitelabelService'

// Check if configured
if (whitelabelService.isConfigured()) {
  const config = whitelabelService.getConfig()
  console.log('Company:', config.company_name)
  
  // Get packages
  const packages = whitelabelService.getPackages()
  console.log('Available packages:', packages)
  
  // Check registration permission
  const canRegister = whitelabelService.isRegistrationAllowed()
  console.log('Registration allowed:', canRegister)
}

// Apply configuration manually
whitelabelService.applyConfiguration()
```

## Configuration Objects

### Whitelabel Configuration
```typescript
interface WhitelabelConfig {
  company_name: string        // Company name for branding
  mask_url: string           // Domain mask URL
  logo: string               // Logo image URL
  favicon: string            // Favicon image URL
  primary_color: string      // Primary brand color (hex)
  secondary_color: string    // Secondary brand color (hex)
  admin_email: string | null // Admin contact email
  stripe_account_id: string  // Stripe account ID
  facebook: string | null    // Facebook page URL
  show_whitelabel_register: boolean // Whether to allow user registration
}
```

### Whitelabel Package
```typescript
interface WhitelabelPackage {
  id: number                 // Package ID
  name: string              // Package name
  price: string             // Package price
  type: 'monthly' | 'yearly' // Billing cycle
  package_type: 'free' | 'paid' | 'trial' // Package type
  total_bots: string        // Number of AI agents
  total_users: string       // Number of users
  active: number            // Active status
  is_trial: number          // Trial flag
  trial_days: string        // Trial duration
  whitelabel_id: number     // Whitelabel ID
  currency: string          // Currency code
  collect_payment_info: number // Payment collection flag
  stripe_product_id: string // Stripe product ID
  stripe_price_id: string   // Stripe price ID
  paddle_plan_id: string    // Paddle plan ID
  subscribers_count: number // Number of subscribers
}
```

## CSS Variables Applied

When whitelabel is configured, these CSS custom properties are automatically set:

```css
:root {
  --color-primary: #whitelabel-primary-color;
  --color-primary-hover: #whitelabel-primary-color + 20;
  --color-primary-active: #whitelabel-primary-color - 20;
  --color-secondary: #whitelabel-secondary-color;
  --color-accent: #whitelabel-secondary-color;
}
```

## Fallback Behavior

- **No API Response**: App continues with default branding and plans
- **API Error**: App continues with default branding and plans (logged as warning)
- **Missing Logo**: Falls back to default logo
- **Missing Colors**: Uses default color scheme
- **Missing Packages**: Uses default Botsify pricing plans
- **Network Issues**: App loads normally with default branding and plans
- **Registration Disabled**: Signup links hidden and signup page access blocked

## Best Practices

### 1. Always Use Fallbacks
```typescript
const companyName = computed(() => 
  whitelabelService.getConfig()?.company_name || 'Default Company'
)

const availablePlans = computed(() => 
  whitelabelService.getPackages() || defaultPlans
)

const canRegister = computed(() => 
  whitelabelService.isRegistrationAllowed()
)
```

### 2. Check Configuration Status
```typescript
const { isConfigured, hasPackages, isRegistrationAllowed } = useWhitelabel()

if (isConfigured.value) {
  if (hasPackages.value) {
    // Use whitelabel packages
    displayWhitelabelPlans()
  } else {
    // Use default plans
    displayDefaultPlans()
  }
  
  if (!isRegistrationAllowed.value) {
    // Hide registration UI
    hideRegistrationElements()
  }
} else {
  // Use default behavior
  displayDefaultPlans()
  showRegistrationElements()
}
```

### 3. Handle Loading States
```typescript
const { isLoading, error } = useWhitelabel()

if (isLoading.value) {
  return <LoadingSpinner />
}

if (error.value) {
  console.warn('Whitelabel error:', error.value)
}
```

### 4. Use Components When Possible
```vue
<!-- Good: Uses component with built-in fallbacks -->
<WhitelabelLogo size="medium" />

<!-- Avoid: Manual logo handling -->
<img :src="getLogoUrl() || '/default-logo.png'" />
```

### 5. Package Integration
```typescript
// Convert whitelabel packages to your app's format
const convertPackage = (pkg: WhitelabelPackage) => {
  return {
    id: pkg.id.toString(),
    name: pkg.name,
    price: parseFloat(pkg.price),
    features: [
      `${pkg.total_bots} AI Agents`,
      `${pkg.total_users} Users`
    ]
  }
}
```

### 6. Registration Control
```typescript
// Always check registration permission before showing signup UI
const { isRegistrationAllowed } = useWhitelabel()

// In template
<div v-if="isRegistrationAllowed">
  <router-link to="/auth/signup">Sign up</router-link>
</div>

// In router guards
if (to.name === 'signup' && !whitelabelService.isRegistrationAllowed()) {
  return next({ path: '/auth/login' })
}
```

## Troubleshooting

### Common Issues

1. **Logo Not Loading**
   - Check if whitelabel API returned logo URL
   - Verify image URL is accessible
   - Check browser console for CORS errors

2. **Colors Not Applied**
   - Verify CSS variables are set in DOM
   - Check if whitelabel service applied configuration
   - Ensure CSS is using custom properties

3. **Packages Not Loading**
   - Check if whitelabel configuration was successful
   - Verify packages API endpoint is accessible
   - Check network connectivity

4. **API Call Failing**
   - Check network connectivity
   - Verify API endpoint is correct
   - Check if domain is valid

5. **Registration Still Showing When Disabled**
   - Check if whitelabel configuration loaded properly
   - Verify `show_whitelabel_register` field in API response
   - Check if components are using the `isRegistrationAllowed` computed property

### Debug Information

```typescript
import { whitelabelService } from '@/services/whitelabelService'

// Check current configuration
console.log('Config:', whitelabelService.getConfig())
console.log('Is Configured:', whitelabelService.isConfigured())

// Check packages
console.log('Packages:', whitelabelService.getPackages())
console.log('Has Packages:', whitelabelService.hasPackages())

// Check registration permission
console.log('Registration Allowed:', whitelabelService.isRegistrationAllowed())

// Check DOM attributes
console.log('Logo URL:', document.documentElement.getAttribute('data-whitelabel-logo'))
console.log('CSS Variables:', getComputedStyle(document.documentElement).getPropertyValue('--color-primary'))
```

## Migration from Old System

The new system is designed to be backward compatible. Existing code using the old whitelabel store will continue to work, but it's recommended to migrate to the new composable:

```typescript
// Old way
import { useWhitelabelStore } from '@/stores/whitelabelStore'
const store = useWhitelabelStore()
const companyName = store.companyName

// New way
import { useWhitelabel } from '@/composables/useWhitelabel'
const { companyName, packages, hasPackages, isRegistrationAllowed } = useWhitelabel()
```

## Performance Considerations

- **Early Initialization**: Whitelabel is loaded before app mounts
- **Caching**: Configuration and packages are stored in memory after first load
- **Lazy Loading**: Components only access whitelabel data when needed
- **Error Boundaries**: Failures don't block app functionality
- **Package Optimization**: Packages are fetched once and reused
- **Registration Check**: Registration permission is checked once and cached

## Package Integration Examples

### Pricing View Integration
```vue
<template>
  <div class="pricing-view">
    <!-- Dynamic title based on whitelabel -->
    <h1>{{ isConfigured ? `${companyName} Plans` : 'Choose Your Plan' }}</h1>
    
    <!-- Show whitelabel packages or default plans -->
    <div v-if="isConfigured && hasPackages" class="whitelabel-packages">
      <div v-for="pkg in packages" :key="pkg.id" class="package-card">
        <h3>{{ pkg.name }}</h3>
        <p class="price">${{ pkg.price }}</p>
        <p>{{ pkg.total_bots }} AI Agents</p>
        <p>{{ pkg.total_users }} Users</p>
      </div>
    </div>
    
    <!-- Fallback to default plans -->
    <div v-else class="default-plans">
      <!-- Default Botsify plans -->
    </div>
  </div>
</template>
```

### Store Integration
```typescript
// In your pricing store
export const usePricingStore = defineStore('pricing', () => {
  const { isConfigured, packages: whitelabelPackages } = useWhitelabel()
  
  const availablePlans = computed(() => {
    if (isConfigured.value && whitelabelPackages.value.length > 0) {
      return whitelabelPackages.value.map(convertWhitelabelPackage)
    }
    return defaultPlans
  })
  
  return { availablePlans }
})
```

### Registration Control Integration
```typescript
// In your auth store or component
export const useAuthFeatures = () => {
  const { isRegistrationAllowed } = useWhitelabel()
  
  const showSignupLink = computed(() => isRegistrationAllowed.value)
  const canAccessSignupPage = computed(() => isRegistrationAllowed.value)
  
  return { showSignupLink, canAccessSignupPage }
}
```
