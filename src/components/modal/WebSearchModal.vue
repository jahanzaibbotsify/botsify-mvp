<script setup lang="ts">
import { ref, reactive } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'
import { botsifyApi } from '@/services/botsifyApi'
import { useChatStore } from '@/stores/chatStore'
import { createResource } from "@/utils/caching.ts"
import Input from '../ui/Input.vue'
import Button from '../ui/Button.vue'

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
const webSearchConfig = ref({
  location: {
    country: '',
    region: '',
    city: '',
    timezone: ''
  },
  searchContextSize: 'medium'
})

// Create cached resource for web search data
const webSearchResource = createResource(async () => {
  const response = await botsifyApi.getWebSearch()
  return response
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
    const response = await webSearchResource.load()
    
    if (response.success) {
      webSearchResults.push(...response.data)
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
    const response = await botsifyApi.createWebSearch(webSearchUrl.value.trim(), JSON.stringify(webSearchConfig.value))
    
    if (response.success) {
      console.log('Web Search created successfully:', response.data)
      
      webSearchResults.push({
        id: response.data.id,
        url: webSearchUrl.value
      })

      // Invalidate cache after adding new web search
      webSearchResource.invalidate()

      // Add success message to chat
      const successMessage = `✅ Web Search connected successfully for: ${webSearchUrl.value}`
      await chatStore.addMessage(props.chatId, successMessage, 'assistant')
    } else {
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
      const response = await botsifyApi.deleteAllWebSearch([webSearchId])
      if (response.success) {
        const index = webSearchResults.findIndex(item => item.id === webSearchId)
        if (index !== -1) {
          webSearchResults.splice(index, 1)
        }
        
        // Invalidate cache after deletion
        webSearchResource.invalidate()
        
        // Add success message to chat
        const successMessage = `✅ Web Search for ${webSearchUrl} removed successfully`
        await chatStore.addMessage(props.chatId, successMessage, 'assistant')
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
        webSearchResults.splice(0, webSearchResults.length)
        
        // Invalidate cache after deletion
        webSearchResource.invalidate()
        
        // Add success message to chat
        const successMessage = `✅ All Web Search removed successfully`
        await chatStore.addMessage(props.chatId, successMessage, 'assistant')
      } else {
        window.$toast.error('Failed to delete Web Search entry: ' + response.message)
      }
    } catch (error: any) {
      window.$toast.error('Error deleting Web Search entry: ' + error.message)
    } finally {
      webSearchDeleteAllLoading.value = false
    }
  })
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
          <Input 
            id="website-url"
            v-model="webSearchUrl" 
            type="url" 
            class="url-input"
            placeholder="https://example.com"
          />
          <Button 
            variant="primary"
            icon="pi pi-paperclip"
            @click="connectWebSearch"
            :disabled="webSearchLoading || !webSearchUrl.trim()"
            :loading="webSearchLoading"
          >
            {{ webSearchLoading ? 'Connecting...' : 'Connect' }}
          </Button>
        </div>
      </div>

      <!-- Web Search Results -->
      <div v-if="webSearchResults.length" class="search-results">
        <div class="websites-connected-header">
          <h3>Websites Connected</h3>
          <Button 
            variant="error-outline"
            icon="pi pi-trash"
            iconOnly
            size="small"
            @click="deleteWebSearchAllEntry()"
            title="Delete all web search entries"
            :loading="webSearchDeleteAllLoading"
            :disabled="webSearchDeleteAllLoading"
          />
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
              <Button 
                variant="error-outline"
                icon="pi pi-trash"
                iconOnly
                size="small"
                @click="deleteWebSearchEntry(webSearchResult.id, webSearchResult.url)"
                title="Delete this web search entry"
                :loading="webSearchDeleteLoading && webSearchSelectedUrlId == webSearchResult.id"
                :disabled="webSearchDeleteLoading && webSearchSelectedUrlId == webSearchResult.id"
              />
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

.input-group .url-input {
  flex: 1;
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