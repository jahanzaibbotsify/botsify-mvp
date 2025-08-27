<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted, watch} from 'vue'
import {useRouter} from 'vue-router'
import {axiosInstance} from "@/utils/axiosInstance.ts"
import {useBotStore} from "@/stores/botStore.ts";
import UserMenu from "@/components/ui/UserMenu.vue";
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import ModalLayout from '@/components/ui/ModalLayout.vue';
import { createResource } from "@/utils/caching.ts"
import { validateImage } from '@/utils';
import Dropdown from '@/components/ui/Dropdown.vue';
import DropdownItem from '@/components/ui/DropdownItem.vue';

const router = useRouter()

// Reactive state
const searchQuery = ref('')
const selectedAgentId = ref<string | null>(null)
const activeTab = ref<'my-agents' | 'shared-agents'>('my-agents')

// Agent modal state (for both create and edit)
const modalMode = ref<'create' | 'edit'>('edit')
const editingAgent = ref<any | null>(null)
const agentNameValue = ref('')
const agentNameInput = ref<HTMLInputElement | null>(null)
const isSavingAgent = ref(false)

// Modal ref for controlling the modal
const agentModalRef = ref<InstanceType<typeof ModalLayout> | null>(null)

// API state
const isLoadingAgents = ref(false)
const isLoadingMore = ref(false)
const agentsError = ref<string | null>(null)
const agentsData = ref<object[]>([])
const sharedAgentsData = ref<object[]>([])

// Pagination state
const currentPage = ref(1)
const totalPages = ref(1)
const totalAgents = ref(0)
const hasMoreAgents = ref(false)
const agentsPerPage = ref(20);
const listAgentsResponse = ref({
  limit_reached: true
})

// Create cached resource for agents
const agentsResource = createResource(async (page: number = 1, query: string = '', tab: 'my' | 'shared') => {
  const response = await axiosInstance.get('v1/list-agents', {
    params: {
      page: page,
      query: query.trim() || undefined,
      tab: tab
    }
  })
  return response.data
})

/**
 * Fetch agents from API
 * @param page - Page number to fetch (default: 1)
 * @param append - Whether to append to existing data or replace
 * @returns Promise<void>
 */
const getAgents = async (page: number = 1, append: boolean = false): Promise<void> => {
  if (page === 1) {
    isLoadingAgents.value = true
  } else {
    isLoadingMore.value = true
  }
  agentsError.value = null

  try {
    const responseData = await agentsResource.load(
      page, 
      searchQuery.value, 
      activeTab.value === 'my-agents' ? 'my' : 'shared'
    )

    if (responseData && responseData.bots) {
      const botsData = responseData.bots
      listAgentsResponse.value = responseData;
      // Update pagination info
      currentPage.value = botsData.current_page || page
      totalPages.value = botsData.last_page || 1
      totalAgents.value = botsData.total || 0
      agentsPerPage.value = botsData.per_page || 20
      hasMoreAgents.value = currentPage.value < totalPages.value

      if (botsData.data) {
        if (append) {
          // Append to existing data
          agentsData.value = [...agentsData.value, ...botsData.data]
        } else {
          // Replace existing data
          agentsData.value = botsData.data
        }
      }
    }

    if (responseData && responseData.sharedBots) {
      // Add avatar to shared bots
      sharedAgentsData.value = responseData.sharedBots
    }

  } catch (error: any) {
    console.error('Failed to fetch agents:', error)
    agentsError.value = error?.response?.data?.message || 'Failed to load agents. Please try again.'
  } finally {
    isLoadingAgents.value = false
    isLoadingMore.value = false
  }
}

/**
 * Get filtered agents based on current tab
 */
const filteredAgents = computed(() => {
  // Return agents based on current tab
  if (activeTab.value === 'my-agents') {
    return agentsData.value as any
  } else {
    return sharedAgentsData.value as any
  }
})

/**
 * Switch between tabs
 * @param tab - Tab to switch to
 */
const switchTab = (tab: 'my-agents' | 'shared-agents') => {
  activeTab.value = tab
  // Reset search when switching tabs
  searchQuery.value = ''

  // Reset pagination when switching to my-agents tab
  if (tab === 'my-agents') {
    currentPage.value = 1
    hasMoreAgents.value = false
    // Reload agents with new tab parameter
    getAgents(1, false)
  }
}

/**
 * Debounced search function
 */
let searchTimeout: NodeJS.Timeout | null = null
const performSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    // if (activeTab.value === 'my-agents') {
      currentPage.value = 1
      hasMoreAgents.value = false
      getAgents(1, false)
    // }
  }, 500) // 500ms debounce
}

// Watch for search query changes
watch(searchQuery, () => {
  performSearch()
})

// Watch for tab changes
watch(activeTab, () => {
  if (activeTab.value === 'my-agents') {
    currentPage.value = 1
    hasMoreAgents.value = false
    getAgents(1, false)
  }
})



/**
 * Edit agent name
 * @param agent - Agent to edit
 */
const editAgentName = (agent: any) => {
  modalMode.value = 'edit'
  editingAgent.value = agent
  agentNameValue.value = agent.name || 'Unnamed Agent'
  agentModalRef.value?.openModal()
}

/**
 * Clone agent
 * @param agent - Agent to clone
 */
const cloneAgent = async (agent: any) => {
  try {
    const response = await axiosInstance.get(`v1/clone-agent/${agent.id}`)

    if (response.data && response.data.status === true) {
      // Show the message from API response
      const message = response.data.message || 'Agent cloned successfully!'
      window.$toast?.success(message)
      
      agentsResource.invalidate();
      // Refresh the agents list to show the new cloned agent
      await getAgents(1, false)
    } else {
      window.$toast?.error(response.data?.message || 'Failed to clone agent. Please try again.')
    }
  } catch (error: any) {
    console.error('Failed to clone agent:', error)
    window.$toast?.error(error?.response?.data?.message || 'Failed to clone agent. Please try again.')
  }
}

/**
 * Delete agent
 * @param agent - Agent to delete
 */
const deleteAgent = (agent: any) => {
  window.$confirm({
    text: `Are you sure you want to delete "${agent.name || 'Unnamed Agent'}"?`,
  }, async () => {
    try {
      const response = await axiosInstance.delete(`v1/delete-agent/${agent.id}`)

      if (response.data && response.data.status) {
        window.$toast?.success('Agent deleted successfully!')
        agentsData.value = agentsData.value.filter((a: any) => {
          return a.id.toString() !== agent.id.toString()
        })

        if (totalAgents.value > 0) {
          totalAgents.value--
        }
        
        // Invalidate cache after deletion
        agentsResource.invalidate()
        getAgents(1, false)
        // No need to call getAgents() - we already updated local state
      } else {
        window.$toast?.error(response.data?.message || 'Failed to delete agent. Please try again.')
      }
    } catch (error: any) {
      console.error('Failed to delete agent:', error)
      window.$toast?.error(error?.response?.data?.message || 'Failed to delete agent. Please try again.')
    }
  })
}

/**
 * Copy agent payload (bot ID)
 * @param agent - Agent to copy payload for
 */
const copyPayload = async (agent: any) => {
  try {
    await navigator.clipboard.writeText(agent.apikey)
    window.$toast?.success('Payload copied to clipboard!')
  } catch (error) {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = agent.apikey
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      window.$toast?.success('Payload copied to clipboard!')
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      window.$toast?.error('Failed to copy Payload. Please try again.')
    }
  }
}

/**
 * Create new agent
 */
const createAgent = () => {
  modalMode.value = 'create'
  editingAgent.value = null
  agentNameValue.value = ''
  agentModalRef.value?.openModal()
}

/**
 * Close agent modal
 */
const closeAgentModal = () => {
  // Reset local state
  agentModalRef.value?.closeModal()
}

/**
 * Save agent (create or edit)
 */
const saveAgent = async () => {
  const trimmedName = agentNameValue.value.trim()

  if (!trimmedName || trimmedName.length < 2) {
    window.$toast?.error('Agent name must be at least 2 characters long.')
    return
  }

  isSavingAgent.value = true

  try {
    if (modalMode.value === 'edit' && editingAgent.value) {
      // Check if name has actually changed
      if (trimmedName === editingAgent.value.name) {
        closeAgentModal()
        return
      }

      // Call API to update bot name
      const response = await axiosInstance.post('v1/update-bot-name', {
        bot_name: trimmedName,
        bot_id: editingAgent.value.id
      });

      if (response.data && response.data.status === 'success') {
        // Update the agent name in the store
        editingAgent.value.name = trimmedName;

        // Show success message
        window.$toast?.success('Agent name updated successfully!')

        // Invalidate cache after update
        agentsResource.invalidate()
        closeAgentModal()
      } else {
        window.$toast?.error(response.data?.message || 'Failed to update agent name. Please try again.')
      }
    } else if (modalMode.value === 'create') {
      const response = await axiosInstance.post('v1/create-bot', {
        bot_name: trimmedName
      });
      const responseData = response.data;
      if (responseData && responseData.bot_id) {
        window.$toast?.success('Agent created successfully!');
        await selectBot({
          token: responseData.bot_token,
          apikey: responseData.bot_api_key
        })

        // Invalidate cache after creation
        agentsResource.invalidate()
        // Refresh the agents list to show the new agent
        await getAgents(1, false)

        closeAgentModal()
      } else {
        window.$toast?.error(response.data?.message || 'Failed to create agent. Please try again.')
      }
    }
  } catch (error: any) {
    console.error('Failed to save agent:', error)
    const errorMessage = modalMode.value === 'create' 
      ? 'Failed to create agent. Please try again.'
      : 'Failed to update agent name. Please try again.'
    window.$toast?.error(error?.response?.data?.message || errorMessage)
  } finally {
    isSavingAgent.value = false
  }
}

/**
 * Load more agents (pagination) - optimized for speed
 */
const loadMoreAgents = async () => {
  if (isLoadingMore.value || !hasMoreAgents.value) return

  const nextPage = currentPage.value + 1
  isLoadingMore.value = true

  try {
    const responseData = await agentsResource.load(
      nextPage, 
      searchQuery.value, 
      activeTab.value === 'my-agents' ? 'my' : 'shared'
    )

    if (responseData && responseData.bots && responseData.bots.data) {
      const botsData = responseData.bots

      // Update pagination info
      currentPage.value = botsData.current_page || nextPage
      totalPages.value = botsData.last_page || 1
      totalAgents.value = botsData.total || 0
      agentsPerPage.value = botsData.per_page || 20
      hasMoreAgents.value = currentPage.value < totalPages.value

      // Append to existing data
      agentsData.value = [...agentsData.value, ...botsData.data]
    }

  } catch (error: any) {
    console.error('Failed to load more agents:', error)
    window.$toast?.error('Failed to load more agents. Please try again.')
  } finally {
    isLoadingMore.value = false
  }
}



/**
 * Select bot and redirect
 * @param agent - Agent to select
 */
const selectBot = async (agent: any) => {
  try {
    const response = await axiosInstance.get(`v1/bot/select/${agent.token}`)
    if (response.data && response.data.bot) {
      useBotStore().setApiKey(agent.apikey)
      router.push(`/agent/${agent.apikey}`)
    } else {
      window.$toast?.error(response.data?.message || 'Failed to select agent. Please try again.')
    }
  } catch (error: any) {
    window.$toast?.error(error?.response?.data?.message || 'Failed to select agent. Please try again.')
  }
}

// Publish status helpers
const hasAnyPublish = (status?: any): boolean => {
  if (!status) return false
  return Object.values(status).some(Boolean)
}

const getPublishedChannels = (agent: any) => {
  const ps = agent?.publish_status || {}
  const channels = [
    { key: 'whatsapp',   label: 'WhatsApp',  icon: 'pi pi-whatsapp',  active: !!ps.whatsapp },
    { key: 'telegram',   label: 'Telegram',  icon: 'pi pi-send',      active: !!ps.telegram },
    { key: 'facebook',   label: 'Facebook',  icon: 'pi pi-facebook',  active: !!ps.facebook },
    { key: 'instagram',  label: 'Instagram', icon: 'pi pi-instagram', active: !!ps.instagram },
    { key: 'twilio',     label: 'Twilio',    icon: 'pi pi-phone',     active: !!ps.twilio }
  ]
  return channels.filter(c => c.active)
}


onMounted(() => {
  // Fetch agents on component mount
  getAgents()
})

onUnmounted(() => {
  // Clean up search timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<template>
  <div class="agent-selection-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-header">
        <div class="header-container">
          <div class="header-left">
            <img src="/images/logos/botsify-logo.webp" alt="Botsify" class="header-logo">
          </div>
          <div class="header-right">
            <UserMenu/>
          </div>
        </div>
      </div>
      
      <div class="hero-content">
        <h1 class="hero-title">Choose Your AI Agent</h1>
        <p class="hero-subtitle">
          Select from our curated collection of specialized AI agents, each designed for specific tasks and industries
        </p>
      </div>
    </div>

    <!-- Tabs and Search Section -->
    <div class="tabs-search-section">
      <div class="tabs-search-container">
        <!-- Left: Agent Tabs -->
        <div class="tab-switcher">
          <button
              @click="switchTab('my-agents')"
              class="tab-button"
              :class="{ active: activeTab === 'my-agents' }"
          >
            <i class="pi pi-user"></i>
            <span>My Agents</span>
            <span class="tab-count">{{ totalAgents || agentsData.length }}</span>
          </button>
          <button
              @click="switchTab('shared-agents')"
              class="tab-button"
              :class="{ active: activeTab === 'shared-agents' }"
          >
            <i class="pi pi-globe"></i>
            <span>Shared Agents</span>
            <span class="tab-count">{{ sharedAgentsData.length }}</span>
          </button>
        </div>


        <!-- Right: Search Bar -->
        <div class="search-wrapper">
          <Input
            v-model="searchQuery"
            placeholder="Search agents by name"
            searchable
            class="search-input"
          />
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="agentsError" class="error-alert">
      <div class="error-content">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ agentsError }}</span>
      </div>
    </div>

    <!-- Agents Grid -->
    <div class="agents-section">
      <div class="agents-container">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              {{ activeTab === 'my-agents' ? 'My Agents' : 'Shared Agents' }}
              <span class="results-count">
                ({{ activeTab === 'my-agents' ? (totalAgents || filteredAgents.length) : filteredAgents.length }} available)
              </span>
            </h2>
          </div>

          <!-- Create Agent Button - Always show but disable when limit reached -->
          <div v-if="activeTab === 'my-agents'" class="create-agent-wrapper">
            <div class="create-agent-section">
              <div 
                class="create-agent-tooltip"
                :class="{ 'disabled-tooltip': listAgentsResponse?.limit_reached }"
              >
                <Button 
                  @click="createAgent" 
                  :disabled="listAgentsResponse?.limit_reached"
                  icon="pi pi-plus"
                  variant="primary"
                >
                  Create Agent
                </Button>
                <div v-if="listAgentsResponse?.limit_reached" class="tooltip">
                  Agent Limit Reached — Upgrade your plan to create more agents
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingAgents" class="loading-state">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Loading agents...</p>
          </div>
        </div>

        <!-- No Results State -->
        <div v-else-if="filteredAgents.length === 0" class="no-results">
          <div class="no-results-icon">
            <i v-if="activeTab === 'my-agents'" class="pi pi-plus"></i>
            <i v-else class="pi pi-globe"></i>
          </div>
          <h3 v-if="searchQuery">No agents found</h3>
          <h3 v-else-if="isLoadingAgents">Loading agents...</h3>
          <h3 v-else-if="activeTab === 'shared-agents'">No shared agents</h3>
          <h3 v-else>No agents available</h3>
          <p v-if="searchQuery">Try adjusting your search to find more agents</p>
          <p v-else-if="isLoadingAgents">Please wait while we load your agents</p>
          <p v-else-if="activeTab === 'shared-agents'">There are no shared agents available at the moment.</p>
          <p v-else>Get started by adding your first agent</p>

          <Button v-if="searchQuery" @click="searchQuery = ''" icon="pi pi-refresh" variant="secondary">
            Reset Search
          </Button>
          <div 
            v-else-if="!isLoadingAgents && activeTab === 'my-agents'"
            class="create-agent-tooltip"
            :class="{ 'disabled-tooltip': listAgentsResponse?.limit_reached }"
          >
            <Button 
              @click="createAgent" 
              :disabled="listAgentsResponse?.limit_reached"
              icon="pi pi-plus"
              variant="primary"
            >
              Create Agent
            </Button>
            <div v-if="listAgentsResponse?.limit_reached" class="tooltip">
              Agent Limit Reached — Upgrade your plan to create more agents
            </div>
          </div>
        </div>

        <!-- Agents Grid -->
        <div v-else class="agents-grid">
          <div
              v-for="(agent, index) in filteredAgents"
              :key="agent.id"
              class="agent-selection-card"
              :class="{
              premium: agent.isPremium,
              popular: agent.isPopular,
              selected: selectedAgentId === agent.id,
              loading: isLoadingAgents && selectedAgentId === agent.id
            }"
              :style="{ '--card-delay': index * 0.02 + 's' }"
          >
            <!-- Agent Card -->
            <div class="agent-selection-card-content">
              <!-- Agent Menu (Top Right Corner) -->
              <div class="agent-menu" v-if="activeTab === 'my-agents'">
                                 <Dropdown position="bottom-right">
                  <template #trigger>
                    <button class="menu-trigger">
                      <i class="pi pi-ellipsis-v"></i>
                    </button>
                  </template>

                  <template #content>
                    <!-- My Agents Menu -->
                    <DropdownItem @click="editAgentName(agent)">
                      <template #icon>
                        <i class="pi pi-pencil"></i>
                      </template>
                      <span>Edit Name</span>
                    </DropdownItem>
                    <DropdownItem @click="cloneAgent(agent)" v-if="!listAgentsResponse?.limit_reached">
                      <template #icon>
                        <i class="pi pi-copy"></i>
                      </template>
                      <span>Clone</span>
                    </DropdownItem>
                    <DropdownItem @click="deleteAgent(agent)" variant="danger">
                      <template #icon>
                        <i class="pi pi-trash"></i>
                      </template>
                      <span>Delete</span>
                    </DropdownItem>
                    <DropdownItem @click="copyPayload(agent)">
                      <template #icon>
                        <i class="pi pi-clipboard"></i>
                      </template>
                      <span>Copy API Key</span>
                    </DropdownItem>
                  </template>
                </Dropdown>
              </div>

              <!-- Agent Info Column -->
              <div class="agent-info-column">
                <!-- Agent Avatar -->
                <div class="agent-avatar-section">
                  <img :src="validateImage(agent.logo, '/icons/img.png')" :alt="agent.name" class="agent-avatar" @click="selectBot(agent)"
                       style="cursor:pointer; user-select: none"/>
                </div>

                <!-- Agent Details -->
                <div class="agent-details">
                  <div class="agent-header">
                    <h3 class="agent-title" @click="selectBot(agent)" style="cursor:pointer">
                      {{ agent.name || 'Unnamed Agent' }}
                    </h3>
                  </div>
                <!-- Published Channels Badges -->
                <div v-if="hasAnyPublish(agent.publish_status)" class="published-badges">
                  <span class="published-badge" v-for="ch in getPublishedChannels(agent)" :key="ch.key">
                    <i :class="ch.icon"></i>
<!--                    <span class="badge-text">{{ ch.label }}</span>-->
                  </span>
                </div>
                  <p class="agent-users" v-if="activeTab === 'my-agents'">{{ agent.users_count }} users</p>
                </div>
                
                <!-- Status Badge - Moved to bottom -->
                <div class="status-badge-container">
                  <div class="status-badge-agent" :class="{ 'active': agent.active === 1, 'inactive': agent.active === 0 || !agent.active }">
                    <i class="pi" :class="agent.active === 1 ? 'pi-check-circle' : 'pi-times-circle'"></i>
                    <span>{{ agent.active === 1 ? 'Active' : 'Inactive' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="activeTab === 'my-agents' && hasMoreAgents && !isLoadingAgents" class="load-more-section">
          <Button
              @click="loadMoreAgents"
              :loading="isLoadingMore"
              :disabled="isLoadingMore"
              variant="primary"
              icon="pi pi-plus"
          >
            {{ isLoadingMore ? 'Loading more agents...' : `Load More (${totalAgents - agentsData.length} remaining)` }}
          </Button>
        </div>

        <!-- Pagination Info -->
        <div v-if="activeTab === 'my-agents' && totalAgents > 0" class="pagination-info">
          <p class="pagination-text">
            Showing {{ agentsData.length }} of {{ totalAgents }} agents
            <span v-if="totalPages > 1">(Page {{ currentPage }} of {{ totalPages }})</span>
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Agent Modal (Create/Edit) -->
  <ModalLayout
    ref="agentModalRef"
    :title="modalMode === 'create' ? 'Create New Agent' : 'Edit Agent Name'"
    max-width="480px"
    @close="closeAgentModal"
  >
    <div class="form-group">
      <Input
        label="Agent Name"
        id="agentName"
        v-model="agentNameValue"
        type="text"
        :placeholder="modalMode === 'create' ? 'Enter a name for your new agent' : 'Enter a descriptive name for your agent'"
        @keyup.enter="saveAgent"
        maxlength="50"
        autocomplete="off"
        spellcheck="false"
        ref="agentNameInput"
      />
      <div class="char-count" :class="{ 'text-warning': agentNameValue.length > 40 }">
        {{ agentNameValue.length }}/50
      </div>
    </div>

    <div class="agent-action-buttons">
      <Button @click="closeAgentModal" variant="secondary" class="w-full">
        Cancel
      </Button>
      <Button
        @click="saveAgent"
        class="w-full"
        :disabled="!agentNameValue.trim() || agentNameValue.trim().length < 2 || isSavingAgent"
        variant="primary"
        :loading="isSavingAgent"
      >
        {{ modalMode === 'create' ? 'Create Agent' : 'Save Changes' }}
      </Button>
    </div>
  </ModalLayout>
</template>

<style scoped>
.app-container {
  overflow: scroll !important;
}

/* Global Styles */
.agent-selection-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0;
  scroll-behavior: smooth;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 0 var(--space-6) var(--space-7) var(--space-6);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
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

.hero-section::after {
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

.hero-section > * {
  position: relative;
  z-index: 2;
}

.hero-header {
  position: relative;
  z-index: 2;
}

.header-container {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
  transition: filter var(--transition-normal);
  display: block;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--space-4);
  line-height: 1.1;
  color: #384348;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin: 0;
  color: #fff;
}

/* Tabs and Search Section */
.tabs-search-section {
  padding: var(--space-6);
  background: white;
  border-bottom: 1px solid var(--color-border);
}

.tabs-search-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.tab-switcher {
  display: flex;
  justify-content: flex-start;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-1);
  border: 1px solid var(--color-border);
  max-width: 500px;
  margin: 0;
  flex-shrink: 0;
}

/* Create Agent Button */
.create-agent-wrapper {
  flex-shrink: 0;
}

.create-agent-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-end;
}

/* Limit Status Badge */
.limit-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: 0.75rem;
  font-weight: 500;
  max-width: 280px;
}

.limit-badge i {
  font-size: 0.875rem;
  color: var(--color-error);
}

.limit-info {
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  font-weight: 400;
  opacity: 0.8;
}



.tab-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  justify-content: center;
}

.tab-button:hover {
  color: var(--color-text-primary);
}

.tab-button.active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 4px rgba(68, 115, 246, 0.3);
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.tab-button.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* Search Wrapper */
.search-wrapper {
  flex: 1;
  max-width: 400px;
  min-width: 280px;
}

.search-input {
  width: 100%;
}


/* Error Alert */
.error-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin: var(--space-6);
  text-align: center;
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-error);
  font-weight: 500;
}

/* Agents Section */
.agents-section {
  background: white;
  padding: var(--space-6);
}

.agents-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.section-title-wrapper {
  flex: 1;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.results-count {
  color: var(--color-text-secondary);
  font-weight: 400;
  font-size: 1rem;
  margin-left: var(--space-2);
  white-space: nowrap;
}


/* Load More Section */
.load-more-section {
  text-align: center;
  padding: var(--space-6);
  margin-top: var(--space-4);
}


/* Pagination Info */
.pagination-info {
  text-align: center;
  padding: var(--space-4);
  margin-top: var(--space-2);
}

.pagination-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.pagination-text span {
  color: var(--color-text-tertiary);
  font-size: 0.8rem;
}

/* No Results */
.no-results {
  text-align: center;
  padding: var(--space-8);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.no-results-icon {
  width: 80px;
  height: 80px;
  background: var(--color-bg-tertiary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  font-size: 2rem;
  color: var(--color-text-tertiary);
}

.no-results h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.no-results p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

/* No Results Limit Info */
.no-results-limit-info {
  margin-top: var(--space-3);
  display: flex;
  justify-content: center;
}

.no-results-limit-info .limit-badge {
  max-width: 320px;
  text-align: center;
}

/* Tooltip wrapper */
.create-agent-tooltip {
  display: inline-flex;
  position: relative;
  align-items: center;
}

/* Custom tooltip styling */
.create-agent-tooltip .tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  background: rgba(239, 68, 68, 0.1); /* subtle red background */
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
  opacity: 0;
  transform: translateY(4px);
  pointer-events: none;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  z-index: 1000;
}

.create-agent-tooltip .tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 12px;
  border-width: 6px;
  border-style: solid;
  border-color: rgba(239, 68, 68, 0.1) transparent transparent transparent;
}

.create-agent-tooltip:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
}

/* Agents Grid */
.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-6);
}

/* CSS Reset for AgentSelectionView to prevent conflicts */
.agent-selection-view * {
  box-sizing: border-box !important;
}

/* Override any conflicting styles from other views */
.agent-selection-view .agent-selection-card {
  position: relative !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  bottom: auto !important;
  transform: none !important;
}

.agent-selection-view .status-badge-container {
  position: static !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  bottom: auto !important;
  transform: none !important;
}

/* Agent Cards */
.agents-grid .agent-selection-card {
  background: white !important;
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-lg) !important;
  overflow: visible !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
  animation: slideUp 0.3s ease-out !important;
  animation-delay: var(--card-delay) !important;
  animation-fill-mode: both !important;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.agent-selection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.agent-selection-card-content {
  position: relative;
  padding: var(--space-5);
  min-height: 180px;
  display: flex;
  flex-direction: column;
}

/* Agent Info Column */
.agent-info-column {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  text-align: left !important;
  gap: var(--space-3) !important;
  width: 100% !important;
  flex: 1 !important;
  min-height: 0 !important;
}

/* Status Badge Container - Positioned at bottom */
.status-badge-container {
  margin-top: auto !important;
  padding-top: var(--space-3) !important;
  flex-shrink: 0 !important;
}

/* Agent Avatar Section */
.agent-avatar-section {
  flex-shrink: 0;
}

.agent-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
}

/* Agent Details */
.agent-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  width: 100%;
}

.agent-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
  flex-wrap: wrap;
}

.agent-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
}

.status-badge-agent {
  display: flex !important;
  align-items: center !important;
  gap: var(--space-1) !important;
  padding: 4px 10px !important;
  border-radius: var(--radius-full) !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}

.status-badge-agent.active {
  background-color: rgba(46, 204, 113, 0.1) !important;
  color: #27ae60 !important;
  border: 1px solid rgba(46, 204, 113, 0.2) !important;
}

.status-badge-agent.inactive {
  background-color: rgba(231, 76, 60, 0.1) !important;
  color: #e74c3c !important;
  border: 1px solid rgba(231, 76, 60, 0.2) !important;
}

.status-badge-agent i {
  font-size: 0.8rem;
}

.agent-users {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  padding-bottom: 5px;
}

/* Published badges */
.published-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 4px 0 6px;
}

.published-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 6px;
  border-radius: var(--radius-full);
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
  font-size: 0.75rem;
  font-weight: 600;
}

.published-badge i {
  font-size: 0.8rem;
}

.agent-role {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  background: var(--color-bg-tertiary);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  margin: 0;
}

/* Agent Menu */
.agent-menu {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
}

.menu-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.menu-trigger:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* Agent Body */
.agent-body {
  padding: var(--space-5);
}

.agent-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-4);
  font-size: 0.875rem;
}

.capabilities {
  margin-bottom: var(--space-4);
}

.capabilities h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.capabilities-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.capabilities-list li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.capabilities-list i {
  color: var(--color-success);
  font-size: 0.7rem;
  width: 12px;
}

.more-capabilities {
  font-style: italic;
  color: var(--color-text-tertiary);
}

.agent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.tag {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 500;
}

.more-tags {
  background: var(--color-primary);
  color: white;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 500;
}

/* Agent Actions */
.agent-actions {
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: var(--space-3);
}

.details-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.details-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.select-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-height: 40px;
}

.select-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.select-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
/* Bottom CTA */
.bottom-cta {
  background: white;
  padding: var(--space-8) var(--space-6);
  text-align: center;
  border-top: 1px solid var(--color-border);
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.cta-content p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}

.skip-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-text-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.skip-button:hover {
  background: var(--color-text-secondary);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Form Group */
.form-group {
  margin-bottom: 0;
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-top: var(--space-2);
  transition: color var(--transition-normal);
}

.char-count.text-warning {
  color: var(--color-warning);
  font-weight: 500;
}

/* Utility Classes */
.w-full {
  width: 100%;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .tabs-search-section,
  .agents-section,
  .bottom-cta {
    padding: var(--space-4);
  }

  .tabs-search-container {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .tab-switcher {
    max-width: 100%;
  }

  .tab-button {
    padding: var(--space-2) var(--space-3);
    font-size: 0.8rem;
  }

  .search-wrapper {
    max-width: 100%;
    min-width: auto;
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .section-title-wrapper {
    width: 100%;
    margin-bottom: var(--space-2);
  }

  .section-title {
    white-space: normal;
    text-align: left;
    overflow: visible;
    text-overflow: initial;
  }

  .create-agent-wrapper {
    width: 100%;
  }

  .search-input {
    font-size: 1rem; /* Better for mobile */
  }

  /* Status badge responsive adjustments for tablets */
  .agent-header {
    flex-direction: row;
    align-items: center;
    gap: var(--space-2);
  }

  .status-badge {
    font-size: 0.7rem;
    padding: 3px 8px;
  }

  .agents-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }


}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-6) var(--space-4);
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .agent-header {
    padding: var(--space-4);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .agent-body {
    padding: var(--space-4);
  }

  .agent-actions {
    padding: var(--space-3) var(--space-4);
  }

  /* Status badge responsive adjustments for small mobile */
  .status-badge {
    align-self: flex-start;
    font-size: 0.7rem;
    padding: 3px 8px;
  }
}

/* Dark theme support */
[data-theme="dark"] .agent-selection-view {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

[data-theme="dark"] .tabs-search-section,
[data-theme="dark"] .agents-section,
[data-theme="dark"] .bottom-cta {
  background: var(--color-bg-secondary);
}

[data-theme="dark"] .agent-selection-card {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}



[data-theme="dark"] .no-results {
  background: var(--color-bg-tertiary);
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style> 