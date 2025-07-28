<template>
  <div v-if="error" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">
        {{ error.message || 'An unexpected error occurred. Please try refreshing the page.' }}
      </p>
      <div class="error-actions">
        <button @click="retry" class="retry-button">
          Try Again
        </button>
        <button @click="goHome" class="home-button">
          Go to Home
        </button>
        <button @click="reportError" class="report-button">
          Report Issue
        </button>
      </div>
      <details v-if="showDetails" class="error-details">
        <summary>Technical Details</summary>
        <pre class="error-stack">{{ error.stack }}</pre>
        <div class="error-info">
          <p><strong>Component:</strong> {{ errorInfo.componentName }}</p>
          <p><strong>Time:</strong> {{ errorInfo.timestamp }}</p>
          <p><strong>URL:</strong> {{ errorInfo.url }}</p>
        </div>
      </details>
      <button @click="toggleDetails" class="details-toggle">
        {{ showDetails ? 'Hide' : 'Show' }} Technical Details
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/modules';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentName?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

const props = defineProps<{
  fallback?: (error: Error, errorInfo: ErrorInfo) => void;
}>();

const emit = defineEmits<{
  error: [error: Error, errorInfo: ErrorInfo];
}>();

const router = useRouter();
const userStore = useUserStore();

const error = ref<Error | null>(null);
const errorInfo = ref<ErrorInfo>({
  message: '',
  componentName: '',
  timestamp: '',
  url: '',
  userAgent: ''
});
const showDetails = ref(false);
const errorTime = ref('');
const currentUrl = ref('');

onErrorCaptured((err: Error, instance, info) => {
  console.error('Error Boundary caught error:', err, info);
  
  error.value = err;
  errorInfo.value = {
    message: err.message,
    stack: err.stack,
    componentName: instance?.$options?.name || 'Unknown Component',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  errorTime.value = new Date().toISOString();
  currentUrl.value = window.location.href;

  // Emit error event for parent components
  emit('error', err, errorInfo.value);

  // Call fallback function if provided
  if (props.fallback) {
    props.fallback(err, errorInfo.value);
  }

  // Log error for monitoring
  logError(err, errorInfo.value);

  return false; // Prevent error from propagating
});

function retry() {
  error.value = null;
  errorInfo.value = { message: '', componentName: '', timestamp: '', url: '', userAgent: '' };
  window.location.reload();
}

function goHome() {
  error.value = null;
  router.push('/');
}

function reportError() {
  const errorReport = {
    message: error.value?.message,
    stack: error.value?.stack,
    componentName: errorInfo.value.componentName,
    time: errorTime.value,
    url: currentUrl.value,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };

  // In a real application, you would send this to your error reporting service
  console.log('Error Report:', errorReport);
  
  // For now, we'll just show an alert
  alert('Error report logged. Thank you for your feedback.');
}

function toggleDetails() {
  showDetails.value = !showDetails.value;
}

function logError(err: Error, info: ErrorInfo) {
  // Log to console for development
  console.error('Application Error:', {
    error: err,
    info,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  });

  // In production, you would send this to your error monitoring service
  // Example: Sentry, LogRocket, etc.
}

onMounted(() => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    error.value = new Error(event.reason?.message || 'Unhandled promise rejection');
    event.preventDefault();
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (!error.value) {
      error.value = event.error || new Error('Unknown error occurred');
    }
  });
});
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-4);
  background-color: var(--color-bg-primary);
}

.error-container {
  max-width: 600px;
  padding: var(--space-6);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.error-icon {
  color: var(--color-error);
  margin-bottom: var(--space-4);
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.error-message {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-5);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.retry-button,
.home-button,
.report-button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-normal);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  cursor: pointer;
}

.retry-button {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.retry-button:hover {
  background-color: var(--color-primary-hover);
}

.home-button:hover,
.report-button:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.error-details {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.error-details summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.error-stack {
  background-color: var(--color-bg-primary);
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  overflow-x: auto;
  white-space: pre-wrap;
  margin-bottom: var(--space-3);
}

.error-info {
  text-align: left;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.error-info p {
  margin-bottom: var(--space-1);
}

.details-toggle {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: var(--space-2);
}

.details-toggle:hover {
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-container {
    padding: var(--space-4);
  }
}
</style> 