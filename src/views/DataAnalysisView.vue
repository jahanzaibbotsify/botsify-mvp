<script setup lang="ts">
import {ref, computed} from 'vue'
import { useDataAnalysisStore } from '@/stores/dataAnalysisStore'
import DataTable from '@/components/data-analysis/DataTable.vue'
import ComingSoon from '@/components/data-analysis/ComingSoon.vue'
import DataAnalysisFilters from '@/components/data-analysis/DataAnalysisFilters.vue'
import StatsCards from '@/components/data-analysis/StatsCards.vue'
import {axiosInstance} from "@/utils/axiosInstance";
import {getCurrentApiKey} from "@/utils/apiKeyUtils";

const dataAnalysisStore = useDataAnalysisStore()

const prompt = ref('');
const responseData = ref<any>(null);
const currentApiPath = ref<string>('');
const currentApiMethod = ref<string>('POST');

/** Whether there is a payload to render */
const hasResults = computed(() => !!(responseData.value && (responseData.value.data || responseData.value.previewType)))

/** UI mode switches from server response */
const isTablePreview = computed(() => responseData.value?.previewType === 'table')
const isUnsupportedPreview = computed(() => responseData.value?.previewType && !isTablePreview.value && !isErrorPreview.value)
const isErrorPreview = computed(() => responseData.value?.previewType === 'error' || responseData.value?.error === true)

const tableData = computed(() => {
  if (!isTablePreview.value || !responseData.value?.data) return []
  return Array.isArray(responseData.value.data) ? responseData.value.data : []
})

const tableColumns = computed(() => (isTablePreview.value && tableData.value.length > 0)
  ? dataAnalysisStore.generateColumns(tableData.value)
  : [])

/**
 * Send the user prompt to the analytics AI endpoint.
 * Saves `apiPath` and `apiMethod` for follow‑up filter calls.
 */
const handleAnalyze = async () => {
  if (!prompt.value.trim()) return;

  try {
    dataAnalysisStore.loading = true;
    responseData.value = null; // Clear previous results
    
    const response = await axiosInstance.post('/v1/analytics-ai-response', { 
      apikey: getCurrentApiKey(), 
      input_text: prompt.value 
    })
    
    // Check if AI returned an error message
    if (response.data.data && typeof response.data.data === 'string' && 
        response.data.data.includes('Sorry, I ran into an issue processing that')) {
      // Handle AI processing error
      responseData.value = {
        error: true,
        message: response.data.data,
        previewType: 'error'
      };
      return;
    }
    
    responseData.value = response.data.data;
    
    // Store API path and method for future filter calls
    currentApiPath.value = responseData.value?.apiPath || '';
    currentApiMethod.value = responseData.value?.apiMethod || 'GET';
    
    // If it's a table preview, generate columns
    if (responseData.value?.previewType === 'table' && responseData.value?.data) {
      dataAnalysisStore.setTableData(responseData.value.data)
    }
    
  } catch (error) {
    console.log(error)
    responseData.value = {
      error: true,
      message: 'Network error occurred. Please try again.',
      previewType: 'error'
    };
  } finally {
    dataAnalysisStore.loading = false;
  }
}

/**
 * Called when any filter changes in the child filter component.
 * Uses remembered `apiPath`/`apiMethod` to fetch new rows.
 */
const handleFilterChange = async (updatedFilters: Record<string, any>) => {
  if (!currentApiPath.value) return;
  
  try {
    dataAnalysisStore.loading = true;
    
    const requestData = {
      apikey: getCurrentApiKey(),
      ...updatedFilters
    };
    
    // For GET requests, append filters as query parameters
    const params = new URLSearchParams();
    Object.entries(requestData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'dateRange' && typeof value === 'object' && value !== null) {
          // Send dateRange as a nested object in query params
          params.append('dateRange', JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const response = await axiosInstance.get(`${currentApiPath.value}?${params.toString()}`);
    if (response.data) {
      responseData.value = {
        ...responseData.value,
        data: Array.isArray(response.data) ? response.data : [response.data],
        filtersData: updatedFilters
      };
      
      // Update columns if it's a table preview
      if (responseData.value?.previewType === 'table' && responseData.value?.data) {
        dataAnalysisStore.setTableData(responseData.value.data)
      }
    }
    
  } catch (error) {
    console.error('Error updating filters:', error);
    // Optionally show error to user
  } finally {
    dataAnalysisStore.loading = false;
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleAnalyze()
  }
}

const clearResults = () => {
  responseData.value = null
  prompt.value = ''
  currentApiPath.value = ''
  currentApiMethod.value = 'POST'
  dataAnalysisStore.clearData()
}

const refreshResults = () => {
  if (responseData.value) {
    handleAnalyze()
  }
}

// Suggestion prompts
const suggestions = [
  "Show total chatbot users, incoming, and outgoing messages for the last 30 days",
  "List top 10 most common messages from users this month",
  "Compare engagement across platforms (Web, WhatsApp, Messenger) for the last 14 days."
];

/** Append canned suggestion to the prompt */
const sendSuggestion = (suggestion: string) => {
  if (prompt.value.trim()) {
    prompt.value = suggestion
  } else {
    prompt.value = suggestion
  }
}

// Stats are now loaded by `StatsCards` itself
</script>

<template>
  <div class="data-analysis-view">
    <div class="page-header">
      <div class="header-content">
        <p>Analytics</p>
      </div>
    </div>

    <div class="analysis-content mt-5">
      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Input Section -->
        <div class="input-section">
          <!-- Stats Section -->
          <div class="stats-section">
            <StatsCards />
          </div>
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
                <svg v-if="!dataAnalysisStore.loading" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                     stroke-linejoin="round">
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
          <!-- Filters Section - Only show for table previews -->
          <div v-if="isTablePreview && (hasResults || dataAnalysisStore.loading)" class="filters-section">
            <DataAnalysisFilters
              :available-filters="responseData?.filters || []"
              :filter-data="responseData?.filtersData || {}"
              @filter-changed="handleFilterChange"
            />
          </div>

          <!-- AI Processing Error Display -->
          <div v-if="isErrorPreview" class="ai-error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <div>
              <h4>AI Processing Issue</h4>
              <p>{{ responseData?.message || 'The AI encountered an issue processing your request.' }}</p>
              <div class="error-actions">
                <button class="retry-btn primary" @click="handleAnalyze">Try Again</button>
                <button class="retry-btn secondary" @click="clearResults">Start Over</button>
              </div>
            </div>
          </div>

          <!-- Store Error Display -->
          <div v-if="dataAnalysisStore.hasError" class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

          <!-- Loading State -->
          <div v-if="dataAnalysisStore.loading" class="loading-state">
            <div class="loading-spinner-large"></div>
            <p>Analyzing your data...</p>
          </div>

          <!-- Table Preview -->
          <div v-else-if="isTablePreview && tableData.length > 0" class="table-wrapper">
            <DataTable
                :data="tableData"
                :columns="tableColumns"
                :loading="dataAnalysisStore.loading"
            />
          </div>

          <!-- Unsupported Preview Type -->
          <ComingSoon
              v-else-if="isUnsupportedPreview"
              :preview-type="responseData?.previewType || 'Unknown'"
              :data-structure="JSON.stringify(responseData?.data || {}).substring(0, 100) + '...'"
          />

          <!-- No Data State -->
          <div v-else-if="hasResults && !dataAnalysisStore.loading" class="no-data-state">
            <div class="no-data-icon">📊</div>
            <h3>No Data Found</h3>
            <p>Your query didn't return any results. Try adjusting your search criteria.</p>
          </div>
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
  padding: var(--space-5) var(--space-4);
  background-color: var(--color-bg-primary);
}

.filters-section {
  margin: 0 auto var(--space-4);
  max-width: 900px;
  width: 100%;
}

.main-content {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  max-width: 1200px;
}

/* Input Section - dedicated layout for Data Analysis */
.input-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0;
  background-color: var(--color-bg-primary);
  margin-bottom: var(--space-6);
}

.input-section > * {
  width: 100%;
  max-width: 900px;
}

.stats-section {
  width: 100%;
  max-width: 900px;
  margin: 0 auto var(--space-5);
}

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
  line-height: 1.2;
}

.centered-heading p {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

.input-area {
  display: flex;
  width: 100%;
  flex-direction: column;
  background-color: var(--color-bg-secondary);
  border-radius: 24px;
  border: 1px solid var(--color-border);
  padding: var(--space-3);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

[data-theme="dark"] .input-area {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
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
  background-color: var(--color-primary);
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
  background-color: var(--color-primary-hover);
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

.results-section {
  width: 100%;
  margin-bottom: var(--space-4);
}

/* Constrain inner table to match message box width */
.results-section :deep(.table-section) {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

/* Wrapper for extra safety */
.table-wrapper {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
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

/* AI Error Message */
.ai-error-message {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-error);
  margin-bottom: var(--space-4);
}

.ai-error-message h4 {
  margin: 0 0 var(--space-1) 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.ai-error-message p {
  margin: 0 0 var(--space-3) 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: var(--space-2);
}

.retry-btn.primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.retry-btn.primary:hover {
  background-color: var(--color-primary-hover);
}

.retry-btn.secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.retry-btn.secondary:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

/* Loading State - exact copy from ChatView */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  text-align: center;
  color: var(--color-text-secondary);
}

.loading-spinner-large {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(18, 17, 17, 0.3);
  border-top: 6px solid #222020;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* No Data State - exact copy from ChatView */
.no-data-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  text-align: center;
  color: var(--color-text-secondary);
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
}

.no-data-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.no-data-state p {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* Mobile responsiveness - exact copy from ChatView */
@media (max-width: 767px) {
  .analysis-content {
    padding: var(--space-3);
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

  .input-section > * {
    max-width: 100%;
  }

  .stats-section {
    max-width: 100%;
  }

  /* Match filters width to message box on mobile */
  .filters-section {
    max-width: 100%;
  }
  /* Match table width to message box on mobile */
  .results-section :deep(.table-section) {
    max-width: 100%;
  }
  .table-wrapper {
    max-width: 100%;
  }
}

/* Tablet and small laptop range: 768px–1023px */
@media (max-width: 1023px) and (min-width: 768px) {
  /* Ensure datatable matches message box width and is centered */
  .results-section :deep(.table-section) {
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
  }
}

/* Medium desktop responsiveness */
@media (max-width: 1280px) {
  .page-header {
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .main-content {
    padding: 0 var(--space-2);
  }
}

@media (max-width: 1280px) and (min-width: 1024px) {
  .main-content {
    max-width: 1024px;
  }

  .input-section > * {
    max-width: 760px;
  }

  .stats-section {
    max-width: 760px;
  }

  /* Match filters width to message box at this breakpoint */
  .filters-section {
    max-width: 760px;
  }
  /* Match table width to message box at this breakpoint */
  .results-section :deep(.table-section) {
    max-width: 760px;
  }
  .table-wrapper {
    max-width: 760px;
  }

  .centered-heading h1 {
    font-size: 1.5rem;
  }

  .suggestion-btn {
    font-size: 0.75rem;
    padding: var(--space-1) var(--space-2);
  }
}

/* Small mobile devices */
@media (max-width: 480px) {
  .analysis-content {
    padding: var(--space-2);
  }
}
</style>