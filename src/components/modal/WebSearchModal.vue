<script setup lang="ts">
import { ref, reactive } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'
import { botsifyApi } from '@/services/botsifyApi'
import { useChatStore } from '@/stores/chatStore'

interface Props {
  chatId: string
}

const props = defineProps<Props>()
const chatStore = useChatStore()

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)
const loadingData = ref(false)
const webSearchResults = reactive<any[]>([])
const webSearchLoading = ref(false)
const webSearchDeleteLoading = ref(false)
const webSearchDeleteAllLoading = ref(false)
const webSearchSelectedUrlId = ref('0')

// Web search refs
const webSearchUrl = ref('')
const showWebSearchConfig = ref(false)
const webSearchConfig = ref({
  location: {
    country: '',
    region: '',
    city: '',
    timezone: ''
  },
  searchContextSize: 'medium'
})

const openModal = async () => {
  modalRef.value?.openModal()
  if (webSearchResults.length === 0) {
    loadingData.value = true
    await loadWebSearchData()
    loadingData.value = false
  }
}

// Load existing Web Search data for this bot assistant
const loadWebSearchData = async () => {
  try {
    console.log('Loading existing Web Search data for bot assistant:', props.chatId)
    const response = await botsifyApi.getWebSearch()
    
    if (response.success) {
      console.log('web search result:', response.data)
      webSearchResults.push(...response.data)
    } else {
      console.log('No existing Web Search data found or failed to load:', response.message)
    }
  } catch (error: any) {
    console.error('Error loading Web Search data:', error)
  }
}

const connectWebSearch = async () => {
  if (!webSearchUrl.value.trim()) {
    window.$toast.error('Please enter a website URL')
    return
  }

  try {
    webSearchLoading.value = true
    console.log('Creating Web Search for bot assistant:', props.chatId)
    console.log('Web Search URL:', webSearchUrl.value)
    console.log('Web Search configuration:', webSearchConfig.value)
    
    const response = await botsifyApi.createWebSearch(webSearchUrl.value.trim(), JSON.stringify(webSearchConfig.value))
    
    if (response.success) {
      console.log('Web Search created successfully:', response.data)
      
      webSearchResults.push({
        id: response.data.id,
        url: webSearchUrl.value
      })

      // Add success message to chat
      const successMessage = `✅ Web Search connected successfully for: ${webSearchUrl.value}`
      await chatStore.addMessage(props.chatId, successMessage, 'assistant')

      closeModal()
    } else {
      console.error('Failed to create Web Search:', response.message)
      window.$toast.error('Failed to create Web Search: ' + response.message)
    }
  } catch (error: any) {
    console.error('Error creating Web Search:', error)
    window.$toast.error('Error creating Web Search: ' + error.message)
  } finally {
    webSearchLoading.value = false
  }
}

// Delete Web Search entry
const deleteWebSearchEntry = (webSearchId: string, webSearchUrl: string) => {
  window.$confirm({
    text: 'Are you sure you want to delete this Web Search?',
  }, async() => {
    try {
      webSearchDeleteLoading.value = true
      webSearchSelectedUrlId.value = webSearchId
      console.log('Deleting Web Search entry:', webSearchId, '-', webSearchUrl)
      
      const response = await botsifyApi.deleteAllWebSearch([webSearchId])
      if (response.success) {
        console.log('Web Search entry deleted successfully')
        const index = webSearchResults.findIndex(item => item.id === webSearchId)
        if (index !== -1) {
          webSearchResults.splice(index, 1)
        }
        // Add success message to chat
        const successMessage = `✅ Web Search for ${webSearchUrl} removed successfully`
        await chatStore.addMessage(props.chatId, successMessage, 'assistant')

        closeModal()
      } else {
        console.error('Failed to delete Web Search entry:', response.message)
        window.$toast.error('Failed to delete Web Search entry: ' + response.message)
      }
    } catch (error: any) {
      console.error('Error deleting Web Search entry:', error)
      window.$toast.error('Error deleting Web Search entry: ' + error.message)
    } finally {
      webSearchDeleteLoading.value = false
    }
  })
}

// Delete all Web Search entries
const deleteWebSearchAllEntry = () => {
  window.$confirm({
    text: 'Are you sure you want to delete all Web Search?',
  }, async() => {
    const ids = webSearchResults.map(item=>item.id)
    try {
      webSearchDeleteAllLoading.value = true
      const response = await botsifyApi.deleteAllWebSearch(ids)
      
      if (response.success) {
        console.log('Web Search entry deleted successfully')
        webSearchResults.splice(0, webSearchResults.length)
        // Add success message to chat
        const successMessage = `✅ All Web Search removed successfully`
        await chatStore.addMessage(props.chatId, successMessage, 'assistant')

        closeModal()
      } else {
        console.error('Failed to delete Web Search entry:', response.message)
        window.$toast.error('Failed to delete Web Search entry: ' + response.message)
      }
    } catch (error: any) {
      console.error('Error deleting Web Search entry:', error)
      window.$toast.error('Error deleting Web Search entry: ' + error.message)
    } finally {
      webSearchDeleteAllLoading.value = false
    }
  })
}

const closeModal = () => {
  modalRef.value?.closeModal()
  webSearchUrl.value = ''
  showWebSearchConfig.value = false
}

// Expose the open method to parent
defineExpose({ openModal })
</script>

<template>
  <ModalLayout 
    ref="modalRef"
    title="Web Search"
    max-width="600px"
  >
    <div class="web-search-content">
      <div class="search-description">
        <p>Enter a website URL to connect and search web content.</p>
      </div>
      
      <div class="url-input-section">
        <label for="website-url">Website URL</label>
        <div class="input-group">
          <input 
            id="website-url"
            v-model="webSearchUrl" 
            type="url" 
            placeholder="https://example.com"
            class="url-input"
            @keydown.enter="connectWebSearch"
          />
          <button 
            class="connect-button primary" 
            @click="connectWebSearch"
            :disabled="webSearchLoading || !webSearchUrl.trim()"
          >
            <span v-if="webSearchLoading" class="loading-spinner"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            {{ webSearchLoading ? 'Connecting...' : 'Connect' }}
          </button>
        </div>
      </div>

      <!-- Web Search Results -->
      <div v-if="webSearchResults.length" class="search-results">
        <div class="websites-connected-header">
          <h3>Websites Connected</h3>
          <button 
            class="delete-button" 
            @click="deleteWebSearchAllEntry()"
            title="Delete all web search entries"
          >
            <span v-if="webSearchDeleteAllLoading" class="loading-spinner"></span>
            <i class="pi pi-trash" v-else></i>
          </button>
        </div>
        <template v-for="webSearchResult of webSearchResults">
          <div class="website-info">
            <div class="website-item">
              <div class="website-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <div class="website-details">
                <div class="website-url">{{ webSearchResult.url }}</div>
                <div class="website-title">{{ 'Website' }}</div>
                <div class="website-status">{{'Connected' }}</div>
              </div>
              <button 
                class="delete-button" 
                @click="deleteWebSearchEntry(webSearchResult.id, webSearchResult.url)"
                title="Delete this web search entry"
              >
                <span v-if="webSearchDeleteLoading && webSearchSelectedUrlId == webSearchResult.id" class="loading-spinner"></span>
                <i class="pi pi-trash" v-else></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </ModalLayout>
</template>

<style scoped>
.web-search-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-description {
  text-align: center;
  color: var(--color-text-secondary);
}

.search-description p {
  margin: 0;
  line-height: 1.5;
}

.url-input-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.url-input-section label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.input-group {
  display: flex;
  gap: var(--space-2);
}

.url-input {
  flex: 1;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.url-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 163, 255, 0.1);
}

.url-input::placeholder {
  color: var(--color-text-tertiary);
}

.connect-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 120px;
  justify-content: center;
}

.connect-button:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 163, 255, 0.3);
}

.connect-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.search-results {
  margin-top: var(--space-4);
}

.search-results h3 {
  margin: 0 0 var(--space-3);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.website-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: 5px;
}

.website-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.website-item:hover {
  border-color: rgba(0, 163, 255, 0.3);
  background: rgba(0, 163, 255, 0.05);
}

.website-item:hover .delete-button {
  opacity: 1;
}

.website-icon {
  color: var(--color-text-secondary);
}

.website-details {
  flex: 1;
  min-width: 0;
}

.website-url {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
  word-break: break-all;
}

.website-title {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.website-status {
  font-size: 0.75rem;
  color: var(--color-success);
  font-weight: 500;
}

.websites-connected-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

/* Delete button styles */
.delete-button {
  background: transparent;
  border: none;
  padding: var(--space-2);
  color: var(--color-text-danger);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  opacity: 0.7;
}

.delete-button:hover {
  color: var(--color-error);
  background: var(--color-bg-secondary);
}

.delete-button:active {
  transform: scale(0.95);
}

.delete-button:focus {
  outline: none;
  box-shadow: none;
}

/* Mobile styles */
@media (max-width: 767px) {
  .input-group {
    flex-direction: column;
    gap: var(--space-3);
  }

  .connect-button {
    min-width: 100%;
  }
}
</style> 