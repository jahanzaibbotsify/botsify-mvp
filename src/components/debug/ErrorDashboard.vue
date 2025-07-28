<template>
  <div v-if="showDashboard" class="error-dashboard">
    <div class="dashboard-header">
      <h3>Error Dashboard (Debug)</h3>
      <button @click="toggleDashboard" class="close-btn">×</button>
    </div>
    
    <div class="dashboard-content">
      <!-- Error Metrics -->
      <div class="metrics-section">
        <h4>Error Metrics</h4>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">{{ metrics.totalErrors }}</div>
            <div class="metric-label">Total Errors</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ recentErrorCount }}</div>
            <div class="metric-label">Recent (1h)</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ alerts.length }}</div>
            <div class="metric-label">Alerts</div>
          </div>
        </div>
      </div>

      <!-- Error Summary -->
      <div class="summary-section">
        <h4>Error Summary</h4>
        <pre class="error-summary">{{ errorSummary }}</pre>
      </div>

      <!-- Recent Alerts -->
      <div class="alerts-section">
        <h4>Recent Alerts</h4>
        <div v-if="alerts.length === 0" class="no-alerts">
          No alerts in the last hour
        </div>
        <div v-else class="alerts-list">
          <div 
            v-for="alert in alerts" 
            :key="alert.id" 
            class="alert-item"
            :class="`severity-${alert.severity}`"
          >
            <div class="alert-header">
              <span class="alert-severity">{{ alert.severity.toUpperCase() }}</span>
              <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
            </div>
            <div class="alert-message">{{ alert.message }}</div>
            <div class="alert-component">{{ alert.componentName }}</div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <button @click="clearErrors" class="action-btn">Clear All Errors</button>
        <button @click="exportErrors" class="action-btn">Export Errors</button>
        <button @click="refreshMetrics" class="action-btn">Refresh</button>
      </div>
    </div>
  </div>
  
  <!-- Toggle button -->
  <button 
    v-if="!showDashboard" 
    @click="toggleDashboard" 
    class="dashboard-toggle"
    title="Error Dashboard"
  >
    🚨
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { errorMonitoringService } from '@/services/errorMonitoringService';

const showDashboard = ref(false);
const metrics = ref(errorMonitoringService.getErrorMetrics());
const alerts = ref(errorMonitoringService.getRecentAlerts());
const errorSummary = ref(errorMonitoringService.getErrorSummary());

const recentErrorCount = computed(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return Object.values(metrics.value.errorsByComponent).reduce((a, b) => a + b, 0);
});

function toggleDashboard() {
  showDashboard.value = !showDashboard.value;
  if (showDashboard.value) {
    refreshMetrics();
  }
}

function refreshMetrics() {
  metrics.value = errorMonitoringService.getErrorMetrics();
  alerts.value = errorMonitoringService.getRecentAlerts();
  errorSummary.value = errorMonitoringService.getErrorSummary();
}

function clearErrors() {
  errorMonitoringService.clearAllErrors();
  refreshMetrics();
}

function exportErrors() {
  const errors = errorMonitoringService.exportErrors();
  const dataStr = JSON.stringify(errors, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `errors-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString();
}

// Auto-refresh metrics every 30 seconds when dashboard is open
let refreshInterval: number | null = null;

onMounted(() => {
  // Only show in development
  if (import.meta.env.DEV) {
    console.log('🔍 Error Dashboard available - press Ctrl+Shift+E to toggle');
    
    // Keyboard shortcut to toggle dashboard
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        toggleDashboard();
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // Cleanup function
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown);
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    });
  }
});

// Set up auto-refresh when dashboard is shown
watch(showDashboard, (isShown) => {
  if (isShown) {
    refreshInterval = setInterval(refreshMetrics, 30000); // 30 seconds
  } else if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
});
</script>

<style scoped>
.error-dashboard {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  border-left: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  z-index: 9999;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.875rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
}

.dashboard-header h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.dashboard-content {
  padding: var(--space-3);
}

.metrics-section,
.summary-section,
.alerts-section,
.actions-section {
  margin-bottom: var(--space-4);
}

.metrics-section h4,
.summary-section h4,
.alerts-section h4 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.metric-card {
  background-color: var(--color-bg-tertiary);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  text-align: center;
  border: 1px solid var(--color-border);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.metric-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

.error-summary {
  background-color: var(--color-bg-tertiary);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
}

.alerts-list {
  max-height: 300px;
  overflow-y: auto;
}

.alert-item {
  background-color: var(--color-bg-tertiary);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
  border-left: 4px solid var(--color-border);
}

.alert-item.severity-critical {
  border-left-color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.alert-item.severity-high {
  border-left-color: #f97316;
  background-color: rgba(249, 115, 22, 0.1);
}

.alert-item.severity-medium {
  border-left-color: #eab308;
  background-color: rgba(234, 179, 8, 0.1);
}

.alert-item.severity-low {
  border-left-color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.alert-severity {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.alert-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.alert-message {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.alert-component {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.no-alerts {
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
  padding: var(--space-4);
}

.actions-section {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.action-btn {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.dashboard-toggle {
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-error);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  box-shadow: var(--shadow-lg);
  z-index: 9998;
  transition: all var(--transition-fast);
}

.dashboard-toggle:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-xl);
}

@media (max-width: 768px) {
  .error-dashboard {
    width: 100vw;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 