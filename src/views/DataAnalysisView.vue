<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDataAnalysisStore } from '@/stores/dataAnalysisStore'
import DataTable from '@/components/data-analysis/DataTable.vue'
import DataAnalysisFilters from '@/components/data-analysis/DataAnalysisFilters.vue'

const dataAnalysisStore = useDataAnalysisStore()

// Local state
const prompt = ref('')

// Computed
const hasResults = computed(() => dataAnalysisStore.hasData)

// No filters needed anymore

// Methods
const handleAnalyze = async () => {
  if (!prompt.value.trim()) return
  
  await dataAnalysisStore.analyzeData(prompt.value)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleAnalyze()
  }
}

// Removed filter handling functions

const clearResults = () => {
  dataAnalysisStore.clearData()
  prompt.value = ''
}

const refreshResults = () => {
  dataAnalysisStore.refreshData()
}

// Removed filter collapse function

// Suggestion prompts
const suggestions = [
  'Show me all active users from the last 30 days',
  'Get conversation analytics with high satisfaction rates',
  'List agents with response time under 2 seconds',
  'Find users who have not engaged in the last week',
  'Show performance metrics for sales agents',
  'Get user engagement data by country'
]

const sendSuggestion = (suggestion: string) => {
  // Append suggestion to existing text with proper spacing
  if (prompt.value.trim()) {
    prompt.value += ' ' + suggestion
  } else {
    prompt.value = suggestion
  }
  // Don't auto-send, let user review and send manually
}

// No initialization needed anymore
</script>

<template>
  <div class="data-analysis-view">
    <div class="page-header">
      <div class="header-content">
        <p>Use AI to analyze your Botsify data with intelligent filters and natural language queries.</p>
      </div>
      
      <div v-if="hasResults" class="header-actions">
        <button class="action-btn" @click="refreshResults" :disabled="dataAnalysisStore.loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
          Refresh
        </button>
        
        <button class="action-btn secondary" @click="clearResults">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Clear
        </button>
      </div>
    </div>

    <div class="analysis-content mt-5">
      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Centered Input for New Analysis -->
        <div class="centered-message-input">
          <div class="centered-heading">
            <h1>What would you like to analyze?</h1>
            <p>Use natural language to query your Botsify data. Apply filters to refine your analysis.</p>
          </div>
          
          <div class="input-area">
            <textarea
              v-model="prompt"
              @keydown="handleKeydown"
              placeholder="Ask about your data... (e.g., 'Show me active users from last month')"
              rows="1"
              class="message-textarea"
            ></textarea>
            
            <div class="input-actions">
              <div class="left-actions"></div>
              <button 
                class="send-button" 
                @click="handleAnalyze"
                :disabled="!prompt.trim() || dataAnalysisStore.loading"
              >
                <svg v-if="!dataAnalysisStore.loading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                <div v-else class="loading-spinner"></div>
              </button>
            </div>
          </div>

          <div class="suggestion-buttons">
            <button 
              v-for="suggestion in suggestions" 
              :key="suggestion" 
              class="suggestion-btn" 
              @click="sendSuggestion(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- Results Section -->
        <div v-if="hasResults || dataAnalysisStore.loading" class="results-section">
          <!-- Current Query Display -->
          <div v-if="dataAnalysisStore.currentRequest" class="current-query">
            <div class="query-info">
              <span class="query-label">Query:</span>
              <span class="query-text">{{ dataAnalysisStore.currentRequest.prompt }}</span>
            </div>
          </div>
        <!-- Filters Section - Positioned between query and results -->
        <div v-if="hasResults || dataAnalysisStore.loading" class="filters-section">
          <DataAnalysisFilters />
        </div>
          <!-- Error Display -->
          <div v-if="dataAnalysisStore.hasError" class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <div>
              <h4>Analysis Failed</h4>
              <p>{{ dataAnalysisStore.error }}</p>
              <button class="retry-btn" @click="refreshResults">Try Again</button>
            </div>
          </div>

          <!-- Data Table -->
          <DataTable
            :data="dataAnalysisStore.data"
            :columns="dataAnalysisStore.columns"
            :loading="dataAnalysisStore.loading"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-analysis-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.page-header {
  background-color: var(--color-bg-secondary);
  padding: var(--space-4) var(--space-4) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content h1 {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.header-content p {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-btn:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.action-btn.secondary {
  color: var(--color-text-secondary);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.analysis-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
  background-color: var(--color-bg-primary);
  margin: 0 var(--space-4);
  padding-left: 150px;
  padding-right: 150px;
  padding-top: 50px;
}

.filters-section {
  margin-bottom: var(--space-4);
}

.main-content {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

/* Centered Message Input - exact copy from ChatView */
.centered-message-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  width: 100%;
  padding: 0;
  background-color: var(--color-bg-primary);
}

.centered-message-input > * {
  width: 100%;
  max-width: 100%;
}

/* Centered heading styles - exact copy from ChatView */
.centered-heading {
  width: 100%;
  text-align: center;
  margin-bottom: var(--space-6);
}

.centered-heading h1 {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  font-family: var(--font-family);
  line-height: 1.2;
}

.centered-heading p {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

/* Input area - exact copy from MessageInput */
.input-area {
  display: flex;
  width: 100%;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid #d1d5db;
  padding: var(--space-3);
  transition: all var(--transition-normal);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .input-area {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.input-area:focus-within {
  border-color: #9ca3af;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .input-area:focus-within {
  border-color: var(--color-border);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.message-textarea {
  border: none;
  background: transparent;
  resize: none;
  padding: 0 0 var(--space-2) 0;
  max-height: 200px;
  min-height: 24px;
  line-height: 1.5;
  font-size: 16px;
  color: var(--color-text-primary);
  font-family: var(--font-family);
  width: 100%;
}

.message-textarea::placeholder {
  color: #9ca3af;
}

[data-theme="dark"] .message-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.message-textarea:focus {
  outline: none;
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-1);
}

.left-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* Send button - exact copy from MessageInput */
.send-button {
  color: #ffffff;
  background-color: #10a37f;
  border-radius: var(--radius-full);
  width: 40px;
  height: 40px;
  transition: all var(--transition-normal);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:hover:not(:disabled) {
  background-color: #0d8b6b;
  transform: scale(1.05);
}

.send-button:disabled {
  color: #9ca3af;
  background-color: #f3f4f6;
  cursor: not-allowed;
  transform: none;
}

[data-theme="dark"] .send-button:disabled {
  color: var(--color-text-tertiary);
  background-color: var(--color-bg-tertiary);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Suggestion buttons - exact copy from ChatView */
.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  margin-top: var(--space-4);
}

.suggestion-btn {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: 0.80rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.suggestion-btn:hover {
  border-color: var(--color-text-tertiary);
}

/* Bottom Message Input Container - exact copy from ChatView */
.message-input-container {
  padding: var(--space-4);
  background-color: var(--color-bg-primary);
  position: sticky;
  bottom: 0;
  z-index: var(--z-sticky);
}

.results-section {
  width: 100%;
  margin-bottom: var(--space-4);
}

.current-query {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-4);
  border-left: 4px solid var(--color-primary);
}

.query-info {
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
}

.query-label {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.query-text {
  color: var(--color-text-primary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.error-message {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-error);
  margin-bottom: var(--space-4);
}

.error-message h4 {
  margin: 0 0 var(--space-1) 0;
  font-size: 1rem;
}

.error-message p {
  margin: 0 0 var(--space-2) 0;
  font-size: 0.875rem;
}

.retry-btn {
  padding: var(--space-1) var(--space-2);
  font-size: 0.75rem;
  background-color: var(--color-error);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
}

/* Mobile responsiveness - exact copy from ChatView */
@media (max-width: 767px) {
  .analysis-content {
    padding: var(--space-3) var(--space-2);
    margin: 0 var(--space-2);
    padding-left: var(--space-2);
    padding-right: var(--space-2);
  }
  
  .message-input-container {
    margin: 0 var(--space-2) var(--space-2);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
    padding: var(--space-3) var(--space-3) var(--space-2);
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
}

/* Small mobile devices */
@media (max-width: 480px) {
  .analysis-content {
    padding: var(--space-2) var(--space-1);
  }
}
</style>