<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const logs = ref<{type: string; message: string; timestamp: Date}[]>([]);

// Override console methods to capture logs
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

const captureLog = (type: string) => (...args: any[]) => {
  // Call original console method
  (originalConsole as any)[type](...args);
  
  // Add to our logs
  const message = args.map(arg => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
  
  logs.value.push({
    type,
    message,
    timestamp: new Date()
  });
  
  // Limit logs to last 100 entries
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(-100);
  }
};

onMounted(() => {
  console.log = captureLog('log');
  console.error = captureLog('error');
  console.warn = captureLog('warn');
  console.info = captureLog('info');
});

onUnmounted(() => {
  // Restore original console methods
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
});

const clearLogs = () => {
  logs.value = [];
};
</script>

<template>
  <div class="debug-console">
    <div class="debug-header">
      <h3>Debug Console</h3>
      <button @click="clearLogs" class="clear-button">Clear</button>
    </div>
    
    <div class="log-container scrollbar">
      <div 
        v-for="(log, index) in logs" 
        :key="index" 
        class="log-entry"
        :class="log.type"
      >
        <span class="log-time">{{ log.timestamp.toLocaleTimeString() }}</span>
        <span class="log-type">[{{ log.type }}]</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
      
      <div v-if="logs.length === 0" class="no-logs">
        No logs captured yet
      </div>
    </div>
  </div>
</template>

<style scoped>
.debug-console {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 500px;
  height: 300px;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  border-top-left-radius: var(--radius-md);
  overflow: hidden;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: normal;
}

.clear-button {
  background-color: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
}

.clear-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.log-entry {
  margin-bottom: 4px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-time {
  color: #aaa;
  margin-right: 6px;
}

.log-type {
  margin-right: 6px;
}

.log-entry.log .log-type {
  color: #6c9;
}

.log-entry.error .log-type {
  color: #f66;
}

.log-entry.warn .log-type {
  color: #fd6;
}

.log-entry.info .log-type {
  color: #6cf;
}

.no-logs {
  color: #666;
  font-style: italic;
  text-align: center;
  margin-top: 20px;
}
</style> 