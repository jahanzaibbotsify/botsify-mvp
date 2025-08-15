<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted, nextTick, watch} from 'vue'
import {useRouter} from 'vue-router'
import {axiosInstance} from "@/utils/axiosInstance.ts"
import {useBotStore} from "@/stores/botStore.ts";
import UserMenu from "@/components/auth/UserMenu.vue";
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';

const router = useRouter()

// Reactive state
const searchQuery = ref('')
const selectedAgentId = ref<string | null>(null)
const activeTab = ref<'my-agents' | 'shared-agents'>('my-agents')
const activeMenuId = ref<string | null>(null)

// Agent modal state (for both create and edit)
const showAgentModal = ref(false)
const modalMode = ref<'create' | 'edit'>('edit')
const editingAgent = ref<any | null>(null)
const agentNameValue = ref('')
const agentNameInput = ref<HTMLInputElement | null>(null)
const isSavingAgent = ref(false)

// API state
const isLoadingAgents = ref(false)
const isLoadingMore = ref(false)
const agentsError = ref<string | null>(null)
const agentsData = ref<object[]>([])
const sharedAgentsData = ref<object[]>([])
const botUsers = ref<Record<string, number>>({})

// Pagination state
const currentPage = ref(1)
const totalPages = ref(1)
const totalAgents = ref(0)
const hasMoreAgents = ref(false)
const agentsPerPage = ref(20);
const listAgentsResponse = ref({
  limit_reached: true
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
    const response = await axiosInstance.get('v1/list-agents', {
      params: {
        page: page,
        query: searchQuery.value.trim() || undefined,
        tab: activeTab.value === 'my-agents' ? 'my' : 'shared'
      }
    })

    if (response.data && response.data.bots) {
      const botsData = response.data.bots
      listAgentsResponse.value = response.data;
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

    if (response.data && response.data.sharedBots) {
      // Add avatar to shared bots
      sharedAgentsData.value = response.data.sharedBots
    }

    // Store bot_users data
    if (response.data && response.data.bot_users) {
      botUsers.value = response.data.bot_users
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
    if (activeTab.value === 'my-agents') {
      currentPage.value = 1
      hasMoreAgents.value = false
      getAgents(1, false)
    }
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
 * Toggle agent menu dropdown
 * @param agentId - Agent ID to toggle menu for
 */
const toggleAgentMenu = (agentId: string) => {
  activeMenuId.value = activeMenuId.value === agentId ? null : agentId
}

/**
 * Edit agent name
 * @param agent - Agent to edit
 */
const editAgentName = (agent: any) => {
  modalMode.value = 'edit'
  editingAgent.value = agent
  agentNameValue.value = agent.name || 'Unnamed Agent'
  showAgentModal.value = true
  activeMenuId.value = null

  // Add keyboard event listener
  document.addEventListener('keydown', handleModalKeydown)

  // Focus the input after modal opens
  nextTick(() => {
    if (agentNameInput.value) {
      agentNameInput.value.focus()
      agentNameInput.value.select()
    }
  })
}

/**
 * Clone agent
 * @param agent - Agent to clone
 */
const cloneAgent = async (agent: any) => {
  activeMenuId.value = null

  try {
    const response = await axiosInstance.get(`v1/clone-agent/${agent.id}`)

    if (response.data && response.data.status === true) {
      // Show the message from API response
      const message = response.data.message || 'Agent cloned successfully!'
      window.$toast?.success(message)

      // Log the cloned bot details
      if (response.data.bot) {
        console.log('Cloned bot details:', response.data.bot)
      }

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
  activeMenuId.value = null

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
        getAgents()
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
  activeMenuId.value = null
  try {
    await navigator.clipboard.writeText(agent.id.toString())
    window.$toast?.success('Payload copied to clipboard!')
  } catch (error: any) {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = agent.id.toString()
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
 * Export agent data
 * @param agent - Agent to export data for
 */
const exportData = (agent: any) => {
  activeMenuId.value = null

  window.$confirm({
    text: 'Please Confirm\nYour Bot Data will be exported and then will be sent you via email.',
    cancelButtonText: 'No',
    confirmButtonText: 'Yes'
  }, async () => {
    try {
      const response = await axiosInstance.get(`v1/agent-export/${agent.token}`)

      if (response.data && response.data.status === 'success') {
        window.$toast?.success('Bot data export initiated! Check your email for the export.')
      } else {
        window.$toast?.error(response.data?.message || 'Failed to export bot data. Please try again.')
      }
    } catch (error: any) {
      console.error('Failed to export bot data:', error)
      window.$toast?.error(error?.response?.data?.message || 'Failed to export bot data. Please try again.')
    }
  })
}

/**
 * Create new agent
 */
const createAgent = () => {
  modalMode.value = 'create'
  editingAgent.value = null
  agentNameValue.value = ''
  showAgentModal.value = true
  activeMenuId.value = null

  // Add keyboard event listener
  document.addEventListener('keydown', handleModalKeydown)

  // Focus the input after modal opens
  nextTick(() => {
    if (agentNameInput.value) {
      agentNameInput.value.focus()
    }
  })
}

/**
 * Close agent modal
 */
const closeAgentModal = () => {
  showAgentModal.value = false
  editingAgent.value = null
  agentNameValue.value = ''
  modalMode.value = 'edit'
  // Remove keyboard event listener
  document.removeEventListener('keydown', handleModalKeydown)
}

/**
 * Handle keyboard events in modal
 * @param event - Keyboard event
 */
const handleModalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeAgentModal()
  }
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
    const response = await axiosInstance.get('v1/list-agents', {
      params: {
        page: nextPage,
        query: searchQuery.value.trim() || undefined,
        client: true,
        tab: activeTab.value === 'my-agents' ? 'my' : 'shared'
      }
    })

    if (response.data && response.data.bots && response.data.bots.data) {
      const botsData = response.data.bots

      // Update pagination info
      currentPage.value = botsData.current_page || nextPage
      totalPages.value = botsData.last_page || 1
      totalAgents.value = botsData.total || 0
      agentsPerPage.value = botsData.per_page || 20
      hasMoreAgents.value = currentPage.value < totalPages.value

      // Append to existing data
      agentsData.value = [...agentsData.value, ...botsData.data]
    }

    // Update bot_users if available
    if (response.data && response.data.bot_users) {
      botUsers.value = {...botUsers.value, ...response.data.bot_users}
    }

  } catch (error: any) {
    console.error('Failed to load more agents:', error)
    window.$toast?.error('Failed to load more agents. Please try again.')
  } finally {
    isLoadingMore.value = false
  }
}

/**
 * Handle clicks outside dropdown to close it
 * @param event - Click event
 */
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.agent-menu')) {
    activeMenuId.value = null
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

  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleModalKeydown)

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
          <div class="search-input-container">
            <i class="pi pi-search search-icon"></i>
            <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search agents by name, capability, or use case..."
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
              <i class="pi pi-times"></i>
            </button>
          </div>
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
            <div class="loading-spinner-large"></div>
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

          <button v-if="searchQuery" @click="searchQuery = ''" class="reset-filters-btn">
            <i class="pi pi-refresh"></i>
            <span>Reset Search</span>
          </button>
          <div 
            v-else-if="!isLoadingAgents && activeTab === 'my-agents'"
            class="create-agent-tooltip"
            :class="{ 'disabled-tooltip': listAgentsResponse?.limit_reached }"
          >
            <button 
              @click="createAgent" 
              class="add-agent-btn"
              :class="{ 'disabled': listAgentsResponse?.limit_reached }"
              :disabled="listAgentsResponse?.limit_reached"
            >
              <i class="pi pi-plus"></i>
              <span>Create Agent</span>
            </button>
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
                <button @click="toggleAgentMenu(agent.id)" class="menu-trigger">
                  <i class="pi pi-ellipsis-v"></i>
                </button>

                <div v-if="activeMenuId === agent.id" class="menu-dropdown" @click.stop>
                  <!-- My Agents Menu -->
                  <button @click="editAgentName(agent)" class="menu-item">
                    <i class="pi pi-pencil"></i>
                    <span>Edit Name</span>
                  </button>
                  <button @click="cloneAgent(agent)" class="menu-item">
                    <i class="pi pi-copy"></i>
                    <span>Clone</span>
                  </button>
                  <button @click="deleteAgent(agent)" class="menu-item delete">
                    <i class="pi pi-trash"></i>
                    <span>Delete</span>
                  </button>
                  <button @click="copyPayload(agent)" class="menu-item">
                    <i class="pi pi-clipboard"></i>
                    <span>Copy Payload</span>
                  </button>
                  <button @click="exportData(agent)" class="menu-item">
                    <i class="pi pi-download"></i>
                    <span>Export Data</span>
                  </button>
                </div>
              </div>

              <!-- Agent Info Column -->
              <div class="agent-info-column">
                <!-- Agent Avatar -->
                <div class="agent-avatar-section">
                  <img :src="agent.logo || '/icons/img.png'" :alt="agent.name" class="agent-avatar" @click="selectBot(agent)"
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
                    <span class="badge-text">{{ ch.label }}</span>
                  </span>
                </div>
                  <p class="agent-users">{{ botUsers[agent.id] !== undefined ? botUsers[agent.id] : 0 }} users</p>
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
          <button
              @click="loadMoreAgents"
              class="load-more-btn"
              :disabled="isLoadingMore"
          >
            <span v-if="isLoadingMore" class="loading-spinner"></span>
            <i v-else class="pi pi-plus"></i>
            <span>{{
                isLoadingMore ? 'Loading more agents...' : `Load More (${totalAgents - agentsData.length} remaining)`
              }}</span>
          </button>
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
  <div v-if="showAgentModal" class="modal-overlay" @click="closeAgentModal">
    <div class="modal-content edit-modal" @click.stop role="dialog" aria-modal="true"
         :aria-labelledby="modalMode === 'create' ? 'create-modal-title' : 'edit-modal-title'">
      <div class="modal-header">
        <h3 :id="modalMode === 'create' ? 'create-modal-title' : 'edit-modal-title'" class="modal-title">
          {{ modalMode === 'create' ? 'Create New Agent' : 'Edit Agent Name' }}
        </h3>
        <button @click="closeAgentModal" class="modal-close" aria-label="Close modal">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <Input
              label="Agent Name"
              id="agentName"
              v-model="agentNameValue"
              type="text"
              :placeholder="modalMode === 'create' ? 'Enter a name for your new agent' : 'Enter a descriptive name for your agent'"
              @keyup.enter="saveAgent"
              @keyup.escape="closeAgentModal"
              maxlength="50"
              autocomplete="off"
              spellcheck="false"
              ref="agentNameInput"
          />
          <div class="char-count" :class="{ 'text-warning': agentNameValue.length > 40 }">
            {{ agentNameValue.length }}/50
          </div>
        </div>
      </div>

      <div class="modal-footer">
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
          {{ isSavingAgent ? 'Saving...' : (modalMode === 'create' ? 'Create Agent' : 'Save Changes') }}
        </Button>
      </div>
    </div>
  </div>
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

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3) calc(var(--space-6) + var(--space-1));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(68, 115, 246, 0.1);
  background-color: var(--color-bg-primary);
}

.clear-search {
  position: absolute;
  right: var(--space-3);
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: color var(--transition-normal);
}

.clear-search:hover {
  color: var(--color-text-secondary);
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

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 4px rgba(0, 163, 255, 0.2);
}

.load-more-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 163, 255, 0.3);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.reset-filters-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.reset-filters-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.add-agent-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.add-agent-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.add-agent-btn:disabled,
.add-agent-btn.disabled {
  background: var(--color-bg-hover);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  transform: none;
  border: 1px solid var(--color-border);
  pointer-events: none; /* allow tooltip wrapper to receive hover */
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
  overflow: hidden !important;
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
  padding: 4px 8px;
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

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10;
  min-width: 160px;
  margin-top: var(--space-1);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.menu-item:hover {
  background: var(--color-bg-hover);
}

.menu-item.delete {
  color: var(--color-error);
}

.menu-item.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

.menu-item i {
  width: 16px;
  font-size: 0.875rem;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-agent-info {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.modal-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.modal-agent-info h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.modal-agent-info p {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: color var(--transition-normal);
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-6);
}

.capabilities-section,
.tags-section,
.template-section {
  margin-bottom: var(--space-6);
}

.capabilities-section h3,
.tags-section h3,
.template-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.capabilities-full {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.capabilities-full li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.capabilities-full i {
  color: var(--color-success);
  font-size: 0.8rem;
  width: 16px;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.template-preview {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  font-style: italic;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.cancel-btn {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.cancel-btn:hover {
  background: var(--color-bg-hover);
}

/* Edit Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
  padding: var(--space-4);
}

.edit-modal {
  background: white;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6) var(--space-6) var(--space-4);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
  line-height: 1.2;
}

.modal-close {
  background: transparent;
  border: none;
  padding: var(--space-2);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  transform: scale(1.1);
}

.modal-body {
  padding: var(--space-6);
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: var(--space-3);
  font-family: var(--font-subheading);
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-normal);
  box-sizing: border-box;
  line-height: 1.5;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(46, 102, 244, 0.12);
  background: white;
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-top: var(--space-2);
  font-family: var(--font-subheading);
  transition: color var(--transition-normal);
}

.char-count.text-warning {
  color: var(--color-warning);
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6) var(--space-6);
  background: var(--color-bg-primary);
}

.btn {
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border: none;
  font-family: var(--font-subheading);
  line-height: 1.4;
  min-width: 80px;
  justify-content: center;
}

.cancel-btn {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
}

.cancel-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-text-tertiary);
  transform: translateY(-1px);
}

.save-btn {
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
  box-shadow: 0 2px 4px rgba(46, 102, 244, 0.2);
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(46, 102, 244, 0.3);
}

.save-btn:disabled {
  background: var(--color-bg-hover);
  color: var(--color-text-tertiary);
  border-color: var(--color-border);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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

  .modal-content {
    margin: var(--space-3);
    max-height: calc(100vh - 24px);
    max-width: calc(100vw - 24px);
  }

  .edit-modal {
    max-width: calc(100vw - 24px);
  }

  .modal-header {
    padding: var(--space-4) var(--space-4) var(--space-3);
  }

  .modal-body {
    padding: var(--space-4);
  }

  .modal-footer {
    padding: var(--space-3) var(--space-4) var(--space-4);
    gap: var(--space-2);
  }

  .btn {
    padding: var(--space-3) var(--space-4);
    font-size: 0.875rem;
  }

  .form-input {
    font-size: 1rem; /* Better for mobile input */
    padding: var(--space-3);
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

[data-theme="dark"] .modal-content {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .edit-modal {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .modal-header {
  background: linear-gradient(135deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 100%);
  border-bottom-color: var(--color-border);
}

[data-theme="dark"] .modal-footer {
  background: var(--color-bg-secondary);
}

[data-theme="dark"] .form-input {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border);
}

[data-theme="dark"] .form-input:focus {
  background: var(--color-bg-primary);
  border-color: var(--color-primary);
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