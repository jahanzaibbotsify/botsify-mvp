<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDataAnalysisStore } from '@/stores/dataAnalysisStore'

const dataAnalysisStore = useDataAnalysisStore()
const testResults = ref<string[]>([])
const isRunning = ref(false)

const runTest = async (prompt: string, filters: Record<string, any> = {}) => {
  const startTime = Date.now()
  testResults.value.push(`🚀 Testing: "${prompt}"`)
  
  try {
    await dataAnalysisStore.analyzeData(prompt, filters)
    const duration = Date.now() - startTime
    
    if (dataAnalysisStore.hasData) {
      testResults.value.push(`✅ Success: ${dataAnalysisStore.data.length} records in ${duration}ms`)
      testResults.value.push(`📊 Columns: ${dataAnalysisStore.columns.map(c => c.label).join(', ')}`)
    } else {
      testResults.value.push(`❌ No data returned`)
    }
  } catch (error: any) {
    testResults.value.push(`❌ Error: ${error.message}`)
  }
  
  testResults.value.push('---')
}

const runAllTests = async () => {
  if (isRunning.value) return
  
  isRunning.value = true
  testResults.value = ['🧪 Starting Data Analysis Tests...', '']
  
  try {
    // Test 1: Users
    await runTest('Show me all active users', { status: 'active', platform: 'all' })
    
    // Test 2: Conversations  
    await runTest('Get conversation analytics with high satisfaction', { status: 'all' })
    
    // Test 3: Agents
    await runTest('List agents with good performance', { platform: 'all' })
    
    // Test 4: Analytics
    await runTest('Show me analytics overview and metrics', {})
    
    testResults.value.push('🎉 All tests completed!')
    
  } catch (error: any) {
    testResults.value.push(`💥 Test runner error: ${error.message}`)
  } finally {
    isRunning.value = false
  }
}

onMounted(() => {
  // Initialize filters
  const filters: Record<string, any> = {}
  dataAnalysisStore.availableFilters.forEach(filter => {
    if (filter.defaultValue !== undefined) {
      filters[filter.id] = filter.defaultValue
    }
  })
})
</script>

<template>
  <div class="test-page">
    <div class="test-header">
      <h1>🧪 Data Analysis System Tests</h1>
      <p>Testing the complete flow: Prompt → LLM → Tool → API → Table</p>
    </div>
    
    <div class="test-controls">
      <button 
        class="test-btn primary" 
        @click="runAllTests" 
        :disabled="isRunning"
      >
        {{ isRunning ? 'Running Tests...' : 'Run All Tests' }}
      </button>
      
      <button 
        class="test-btn secondary" 
        @click="testResults = []"
        :disabled="isRunning"
      >
        Clear Results
      </button>
    </div>
    
    <div class="test-results">
      <h3>Test Results:</h3>
      <div class="results-output">
        <div v-for="(result, index) in testResults" :key="index" class="result-line">
          {{ result }}
        </div>
      </div>
    </div>
    
    <div v-if="dataAnalysisStore.hasData" class="current-data">
      <h3>Current Data ({{ dataAnalysisStore.data.length }} records):</h3>
      <div class="data-preview">
        <div class="columns">
          <strong>Columns:</strong> {{ dataAnalysisStore.columns.map(c => c.label).join(', ') }}
        </div>
        <div class="sample-data">
          <strong>Sample Record:</strong>
          <pre>{{ JSON.stringify(dataAnalysisStore.data[0], null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);
  font-family: var(--font-family);
}

.test-header {
  text-align: center;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.test-header h1 {
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.test-header p {
  color: var(--color-text-secondary);
  margin: 0;
}

.test-controls {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  justify-content: center;
}

.test-btn {
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.test-btn.primary {
  background-color: var(--color-primary);
  color: white;
}

.test-btn.primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.test-btn.secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.test-btn.secondary:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-results {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  border: 1px solid var(--color-border);
}

.test-results h3 {
  margin-top: 0;
  color: var(--color-text-primary);
}

.results-output {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.result-line {
  margin-bottom: var(--space-1);
  color: var(--color-text-primary);
}

.current-data {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
}

.current-data h3 {
  margin-top: 0;
  color: var(--color-text-primary);
}

.data-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.columns {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.sample-data {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.sample-data pre {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  overflow-x: auto;
  font-size: 0.75rem;
  margin-top: var(--space-2);
}

@media (max-width: 768px) {
  .test-page {
    padding: var(--space-2);
  }
  
  .test-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .test-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>