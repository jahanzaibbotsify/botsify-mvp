<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { Agent, AgentCategory } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const selectedCategory = ref<string>('all')
const selectedAgentId = ref<string | null>(null)
const showAgentDetails = ref(false)
const selectedAgentForDetails = ref<Agent | null>(null)
const activeTab = ref<'my-agents' | 'shared-agents'>('my-agents')
const activeMenuId = ref<string | null>(null)

// Edit agent modal state
const showEditModal = ref(false)
const editingAgent = ref<Agent | null>(null)
const editAgentNameValue = ref('')
const agentNameInput = ref<HTMLInputElement | null>(null)

// Filter agents based on search, category, and tab
const filteredAgents = computed(() => {
  let agents = authStore.agents

  // Filter by tab (My Agents vs Shared Agents)
  if (activeTab.value === 'my-agents') {
    // Filter to show only user's agents (for now, show agents created by botsify as "my agents")
    agents = agents.filter(agent => agent.createdBy === 'botsify')
  } else {
    // Show community/shared agents
    agents = agents.filter(agent => agent.createdBy === 'community')
  }



  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    agents = agents.filter(agent =>
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.capabilities.some(cap => cap.toLowerCase().includes(query)) ||
      agent.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return agents
})

const popularAgents = computed(() => {
  return authStore.getPopularAgents().slice(0, 3)
})

const categories = computed(() => {
  return [
    { id: 'all', name: 'All Categories', description: 'Browse all available agents', icon: 'pi-th-large', agentCount: authStore.agents.length },
    ...authStore.agentCategories
  ]
})

const handleAgentSelect = async (agent: Agent) => {
  selectedAgentId.value = agent.id
  
  const success = await authStore.selectAgent(agent)
  
  if (success) {
    window.$toast?.success(`${agent.name} selected successfully! Redirecting to agentic platform...`)
    // Redirect to agentic platform with agent ID
    router.push(`/agent/${agent.id}`)
  } else {
    window.$toast?.error('Failed to select agent. Please try again.')
    selectedAgentId.value = null
  }
}

const showDetails = (agent: Agent) => {
  selectedAgentForDetails.value = agent
  showAgentDetails.value = true
}

const closeDetails = () => {
  showAgentDetails.value = false
  selectedAgentForDetails.value = null
}

const skipSelection = () => {
  // Continue without selecting an agent
  authStore.updateOnboardingStep('completed')
  router.push('/auth/agentic-home')
}

const switchTab = (tab: 'my-agents' | 'shared-agents') => {
  activeTab.value = tab
  // Reset search when switching tabs
  searchQuery.value = ''
}

const formatRating = (rating: number) => {
  return rating.toFixed(1)
}

const getRatingStars = (rating: number) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  for (let i = 0; i < fullStars; i++) {
    stars.push('full')
  }

  if (hasHalfStar) {
    stars.push('half')
  }

  while (stars.length < 5) {
    stars.push('empty')
  }

  return stars
}

const toggleAgentMenu = (agentId: string) => {
  activeMenuId.value = activeMenuId.value === agentId ? null : agentId
}

const editAgentName = (agent: Agent) => {
  editingAgent.value = agent
  editAgentNameValue.value = agent.name
  showEditModal.value = true
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

const cloneAgent = (agent: Agent) => {
  console.log('Clone agent:', agent.name)
  activeMenuId.value = null
}

const deleteAgent = (agent: Agent) => {
  console.log('Delete agent:', agent.name)
  activeMenuId.value = null
}

const copyPayload = (agent: Agent) => {
  console.log('Copy payload for:', agent.name)
  activeMenuId.value = null
}

const exportData = (agent: Agent) => {
  console.log('Export data for:', agent.name)
  activeMenuId.value = null
}

const addAgent = () => {
  console.log('Add new agent')
  // Redirect to agent creation page or open modal
}

const createAgent = () => {
  console.log('Create new agent')
  // Redirect to agent creation page or open modal
  // router.push('/create-agent')
}

// Modal functions
const closeEditModal = () => {
  showEditModal.value = false
  editingAgent.value = null
  editAgentNameValue.value = ''
  // Remove keyboard event listener
  document.removeEventListener('keydown', handleModalKeydown)
}

// Handle keyboard events in modal
const handleModalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeEditModal()
  }
}

const saveAgentName = () => {
  const trimmedName = editAgentNameValue.value.trim()
  
  if (editingAgent.value && trimmedName && trimmedName.length >= 2) {
    // Check if name has actually changed
    if (trimmedName === editingAgent.value.name) {
      closeEditModal()
      return
    }
    
    // Update the agent name in the store
    editingAgent.value.name = trimmedName
    console.log('Agent name updated:', trimmedName)
    
    // Show success message
    window.$toast?.success('Agent name updated successfully!')
    
    closeEditModal()
  } else if (trimmedName.length < 2) {
    window.$toast?.error('Agent name must be at least 2 characters long.')
  }
}

// Click outside to close dropdown
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.agent-menu')) {
    activeMenuId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Set first popular agent as suggested
  if (popularAgents.value.length > 0) {
    // Could pre-select or highlight first popular agent
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="agent-selection-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <i class="pi pi-users"></i>
          <span>AI Agent Selection</span>
        </div>
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
            <span class="tab-count">{{ authStore.agents.filter(a => a.createdBy === 'botsify').length }}</span>
          </button>
          <button
            @click="switchTab('shared-agents')"
            class="tab-button"
            :class="{ active: activeTab === 'shared-agents' }"
          >
            <i class="pi pi-globe"></i>
            <span>Shared Agents</span>
            <span class="tab-count">{{ authStore.agents.filter(a => a.createdBy === 'community').length }}</span>
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
    <div v-if="authStore.error" class="error-alert">
      <div class="error-content">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ authStore.error }}</span>
      </div>
    </div>

    <!-- Agents Grid -->
    <div class="agents-section">
      <div class="agents-container">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              {{ activeTab === 'my-agents' ? 'My Agents' : 'Shared Agents' }}
              <span class="results-count">({{ filteredAgents.length }} available)</span>
            </h2>
          </div>
          
          <!-- Create Agent Button -->
          <div class="create-agent-wrapper">
            <button @click="createAgent" class="create-agent-btn">
              <i class="pi pi-plus"></i>
              <span>Create Agent</span>
            </button>
          </div>
          

        </div>
        <div v-if="filteredAgents.length === 0" class="no-results">
            <div class="no-results-icon">
              <i class="pi pi-plus"></i>
            </div>
            <h3 v-if="searchQuery">No agents found</h3>
            <h3 v-else>No agents available</h3>
            <p v-if="searchQuery">Try adjusting your search to find more agents</p>
            <p v-else>Get started by adding your first agent</p>
            
            <button v-if="searchQuery" @click="searchQuery = ''" class="reset-filters-btn">
              <i class="pi pi-refresh"></i>
              <span>Reset Search</span>
            </button>
            <button v-else @click="addAgent" class="add-agent-btn">
              <i class="pi pi-plus"></i>
              <span>Add Agent</span>
            </button>
          </div>
        <div v-if="filteredAgents.length > 0" class="agents-grid">
          <div
            v-for="(agent, index) in filteredAgents"
            :key="agent.id"
            class="agent-card"
            :class="{ 
              premium: agent.isPremium,
              popular: agent.isPopular,
              selected: selectedAgentId === agent.id,
              loading: authStore.isLoading && selectedAgentId === agent.id
            }"
            :style="{ '--card-delay': index * 0.05 + 's' }"
          >
            <!-- Agent Card -->
            <div class="agent-card-content">
              <!-- Agent Menu (Top Right Corner) -->
              <div class="agent-menu">
                <button @click="toggleAgentMenu(agent.id)" class="menu-trigger">
                  <i class="pi pi-ellipsis-v"></i>
                </button>
                
                <div v-if="activeMenuId === agent.id" class="menu-dropdown" @click.stop>
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
                  <img :src="agent.avatar" :alt="agent.name" class="agent-avatar" />
                </div>
                
                <!-- Agent Details -->
                <div class="agent-details">
                  <h3 class="agent-title">{{ agent.name }}</h3>
                  <p class="agent-users">{{ agent.reviewCount.toLocaleString() }} users</p>
                  <p class="agent-role">{{ categories.find(c => c.id === agent.category)?.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent Details Modal -->
    <div v-if="showAgentDetails && selectedAgentForDetails" class="modal-overlay" @click="closeDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-agent-info">
            <img :src="selectedAgentForDetails.avatar" :alt="selectedAgentForDetails.name" class="modal-avatar" />
            <div>
              <h2>{{ selectedAgentForDetails.name }}</h2>
              <p>{{ selectedAgentForDetails.description }}</p>
            </div>
          </div>
          <button @click="closeDetails" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="capabilities-section">
            <h3>Capabilities</h3>
            <ul class="capabilities-full">
              <li v-for="capability in selectedAgentForDetails.capabilities" :key="capability">
                <i class="pi pi-check"></i>
                <span>{{ capability }}</span>
              </li>
            </ul>
          </div>

          <div class="tags-section">
            <h3>Tags</h3>
            <div class="tags-grid">
              <span v-for="tag in selectedAgentForDetails.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>

          <div v-if="selectedAgentForDetails.template" class="template-section">
            <h3>Template Preview</h3>
            <div class="template-preview">
              <p><strong>Welcome Message:</strong> {{ selectedAgentForDetails.template.welcomeMessage }}</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetails" class="cancel-btn">
            Close
          </button>
          <button
            v-if="selectedAgentForDetails"
            @click="handleAgentSelect(selectedAgentForDetails)"
            class="select-btn primary"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading" class="loading-spinner"></span>
            <i v-else class="pi pi-check"></i>
            <span>{{ authStore.isLoading ? 'Selecting...' : 'Select This Agent' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Agent Name Modal -->
  <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
    <div class="modal-content edit-modal" @click.stop role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div class="modal-header">
        <h3 id="edit-modal-title" class="modal-title">Edit Agent Name</h3>
        <button @click="closeEditModal" class="modal-close" aria-label="Close modal">
          <i class="pi pi-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="agentName" class="form-label">Agent Name</label>
          <input
            id="agentName"
            v-model="editAgentNameValue"
            type="text"
            class="form-input"
            placeholder="Enter a descriptive name for your agent"
            @keyup.enter="saveAgentName"
            @keyup.escape="closeEditModal"
            maxlength="50"
            autocomplete="off"
            spellcheck="false"
            ref="agentNameInput"
          />
          <div class="char-count" :class="{ 'text-warning': editAgentNameValue.length > 40 }">
            {{ editAgentNameValue.length }}/50
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="closeEditModal" class="btn cancel-btn" type="button">
          Cancel
        </button>
        <button 
          @click="saveAgentName" 
          class="btn save-btn"
          type="button"
          :disabled="!editAgentNameValue.trim() || editAgentNameValue.trim().length < 2"
        >
          <i class="pi pi-check"></i>
          Save Changes
        </button>
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
  padding: var(--space-8) var(--space-6) var(--space-6);
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

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 20px;
  border-radius: 50px;
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #feda75, #d21efa, #d62976, #962fbf, #4f5bd5);
  background-size: 600% 600%;
  animation: gradientShift 6s ease infinite;
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

.create-agent-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 4px rgba(0, 163, 255, 0.2);
}

.create-agent-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 163, 255, 0.3);
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
  flex: 1;
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
  padding: var(--space-3) var(--space-3) var(--space-3) calc(var(--space-8) + var(--space-1));
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

.add-agent-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

/* Agents Grid */
.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-6);
}

/* Agent Cards */
.agent-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  animation: slideUp 0.6s ease-out;
  animation-delay: var(--card-delay);
  animation-fill-mode: both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.agent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.agent-card-content {
  position: relative;
  padding: var(--space-5);
  min-height: 180px;
}

/* Agent Info Column */
.agent-info-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: var(--space-3);
  width: 100%;
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

.agent-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
}

.agent-users {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
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

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

  .create-agent-btn {
    width: 100%;
    justify-content: center;
  }

  .search-input {
    font-size: 1rem; /* Better for mobile */
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
  }

  .agent-body {
    padding: var(--space-4);
  }

  .agent-actions {
    padding: var(--space-3) var(--space-4);
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

[data-theme="dark"] .agent-card {
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