<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Determine if brand panel should be shown
const showBrandPanel = computed(() => {
  return !['pricing', 'agent-selection'].includes(route.name as string)
})

// Determine content based on current route
const pageContent = computed(() => {
  switch (route.name) {
    case 'login':
      return {
        title: 'Welcome back!',
        subtitle: 'Continue your AI journey',
        description: 'Sign in to access your AI agents and manage your conversations.',
        icon: 'pi-sign-in'
      }
    case 'signup':
      return {
        title: 'Start your AI journey',
        subtitle: 'Create powerful AI agents',
        description: 'Join thousands of users building amazing AI-powered experiences.',
        icon: 'pi-user-plus'
      }
    case 'pricing':
      return {
        title: 'Choose your plan',
        subtitle: 'Scale your AI capabilities',
        description: 'Select the perfect plan for your needs and unlock advanced features.',
        icon: 'pi-credit-card'
      }
    case 'agent-selection':
      return {
        title: 'Pick your agent',
        subtitle: 'Start with the right assistant',
        description: 'Choose from our collection of specialized AI agents to get started.',
        icon: 'pi-users'
      }
    default:
      return {
        title: 'Welcome to Botsify',
        subtitle: 'AI-powered conversations',
        description: 'Build, deploy, and manage intelligent AI agents with ease.',
        icon: 'pi-comments'
      }
  }
})
</script>

<template>
  <div class="auth-layout" :class="{ 'no-brand-panel': !showBrandPanel }">
    <!-- Left Panel - Branding & Content -->
    <div v-if="showBrandPanel" class="auth-brand-panel">
      <div class="auth-brand-content">
        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo-container">
                    <img 
          src="/logo.png" 
          alt="Botsify" 
          class="logo-image"
        />
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <div class="content-text">
            <h1 class="main-title">{{ pageContent.title }}</h1>
            <p class="main-subtitle">{{ pageContent.subtitle }}</p>
            <p class="main-description">{{ pageContent.description }}</p>
          </div>
        </div>

        <!-- Feature Highlights -->
        <div class="feature-highlights">
          <div class="feature-item">
            <i class="pi pi-shield"></i>
            <span>Secure & Private</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-bolt"></i>
            <span>Lightning Fast</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-heart"></i>
            <span>Easy to Use</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="brand-footer">
          <p>&copy; 2025 Botsify. All rights reserved.</p>
          <div class="footer-links">
            <a href="https://botsify.com/terms-and-conditions" class="footer-link" target="_blank">Terms & conditions</a>
            <span class="footer-separator">•</span>
            <a href="https://botsify.com/privacy-policy" class="footer-link" target="_blank">Privacy policy</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Form Content -->
    <div class="auth-form-panel">
      <div class="auth-form-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.auth-layout.no-brand-panel {
  justify-content: center;
}

.auth-layout.no-brand-panel .auth-form-panel {
  flex: none;
  max-width: 1200px;
  width: 100%;
}

/* Left Brand Panel */
.auth-brand-panel {
  flex: 1;
  position: relative;
  display: flex;
  align-items: start;
  justify-content: center;
  color: white;
  overflow: hidden;
}

.auth-brand-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 180deg,
    #ff0080,
    #7928ca,
    #2afadf,
    #7928ca,
    #ff0080
  );
  filter: blur(60px);
  opacity: 0.6;
  z-index: 0;
}

.auth-brand-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#ffffff20 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.18;
  z-index: 1;
  mix-blend-mode: color-dodge;
  pointer-events: none;
}

.auth-brand-panel > * {
  position: relative;
  z-index: 2;
}

.auth-brand-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-5);
  max-width: 480px;
  width: 100%;
  z-index: 2;
  position: relative;
  gap: var(--space-7);
}

/* Logo Section */
.logo-section {
  width: 100%;
}

.logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}

.logo-image {
  height: 40px;
  width: auto;
  background: transparent;
  object-fit: contain;
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  width: 100%;
}

.content-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.content-text {
  text-align: center;
}

.main-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #384348;
  margin-bottom: var(--space-3);
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.main-subtitle {
  font-size: 1.125rem;
  font-weight: 500;
  color: #2e66f4;
  margin-bottom: var(--space-3);
}

.main-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

/* Feature Highlights */
.feature-highlights {
  display: flex;
  gap: var(--space-6);
  margin-top: var(--space-4);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.feature-item i {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Footer */
.brand-footer {
  margin-top: auto;
  width: 100%;
}

.brand-footer p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 var(--space-2) 0;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.footer-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.75rem;
  transition: color var(--transition-normal);
}

.footer-link:hover {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
}

.footer-separator {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
}

/* Right Form Panel */
.auth-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-bg-primary);
}

.auth-form-container {
  width: 100%;
  max-width: 480px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.08),
    0 20px 48px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--color-border);
  overflow: hidden;
  position: relative;
}

.auth-form-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .auth-brand-content {
    padding: var(--space-6);
    gap: var(--space-6);
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .main-subtitle {
    font-size: 1rem;
  }
  
  .content-icon {
    width: 64px;
    height: 64px;
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .auth-layout {
    flex-direction: column;
  }
  
  .auth-brand-panel {
    flex: none;
    min-height: 40vh;
    order: 1;
  }
  
  .auth-form-panel {
    flex: none;
    order: 2;
    padding: var(--space-4);
  }
  
  .auth-brand-content {
    padding: var(--space-4);
    gap: var(--space-4);
    max-width: 100%;
  }
  
  .main-title {
    font-size: 1.75rem;
  }
  
  .main-subtitle {
    font-size: 0.875rem;
  }
  
  .main-description {
    font-size: 0.875rem;
  }
  
  .content-icon {
    width: 56px;
    height: 56px;
    font-size: 1.25rem;
  }
  
  .feature-highlights {
    gap: var(--space-4);
    margin-top: var(--space-2);
  }
  
  .feature-item {
    font-size: 0.8rem;
  }
  
  .feature-item i {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
  
  .auth-form-container {
    max-width: 100%;
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.08),
      0 8px 24px rgba(0, 0, 0, 0.04);
  }
}

@media (max-width: 640px) {
  .auth-brand-panel {
    min-height: 35vh;
  }
  
  .feature-highlights {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .feature-item {
    flex-direction: row;
    gap: var(--space-3);
  }
  
  .logo-image {
    height: 32px;
  }
  
  .auth-layout.no-brand-panel .auth-form-panel {
    max-width: 100%;
    padding: var(--space-4);
  }
}

@media (max-width: 480px) {
  .auth-brand-content {
    padding: var(--space-3);
    gap: var(--space-3);
  }
  
  .auth-form-panel {
    padding: var(--space-3);
  }
  
  .main-title {
    font-size: 1.5rem;
  }
  
  .content-icon {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
  
  .logo-container {
    padding: var(--space-3);
  }
}

/* Dark theme support */
[data-theme="dark"] .auth-form-container {
  background: var(--color-bg-secondary);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 20px 48px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .auth-form-panel {
  background-color: var(--color-bg-primary);
}

[data-theme="dark"] .auth-brand-panel {
  background: linear-gradient(145deg, #1E3A8A 0%, #1E40AF 100%);
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .auth-brand-panel {
    background: var(--color-primary);
  }
  
  .auth-brand-panel::before {
    display: none;
  }
  
  .logo-container,
  .content-icon,
  .feature-item i {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .auth-form-container::before {
    animation: none;
  }
}

/* Print styles */
@media print {
  .auth-brand-panel {
    display: none;
  }
  
  .auth-layout {
    flex-direction: column;
  }
  
  .auth-form-panel {
    flex: none;
  }
}
</style> 