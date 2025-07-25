<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const userStats = computed(() => ({
  totalAgents: authStore.selectedAgent ? 1 : 0,
  totalConversations: 0,
  planName: authStore.selectedPlan?.name || 'Free',
  planLimit: authStore.selectedPlan?.limits.conversations || 100
}))

const quickActions = [
  {
    id: 'start-chat',
    title: 'Start Your First Chat',
    description: 'Begin a conversation with your AI agent',
    icon: 'pi-comments',
    color: 'var(--color-primary)',
    action: () => router.push(`/agent/${authStore.user?.id}`)
  },
  {
    id: 'customize-agent',
    title: 'Customize Your Agent',
    description: 'Personalize your agent\'s responses and behavior',
    icon: 'pi-cog',
    color: 'var(--color-success)',
    action: () => router.push('/settings')
  },
  {
    id: 'explore-features',
    title: 'Explore Features',
    description: 'Discover what your AI agent can do',
    icon: 'pi-lightbulb',
    color: 'var(--color-warning)',
    action: () => router.push('/agent/' + authStore.user?.id)
  },
  {
    id: 'view-analytics',
    title: 'View Analytics',
    description: 'Monitor your agent\'s performance',
    icon: 'pi-chart-line',
    color: 'var(--color-accent)',
    action: () => router.push('/conversations')
  }
]

const getStartedSteps = [
  {
    id: 'agent-selected',
    title: 'Select Your Agent',
    description: 'Choose an AI agent that fits your needs',
    completed: !!authStore.selectedAgent,
    action: () => router.push('/select-agent')
  },
  {
    id: 'first-chat',
    title: 'Start First Conversation',
    description: 'Test your agent with a sample conversation',
    completed: false,
    action: () => router.push(`/agent/${authStore.user?.id}`)
  },
  {
    id: 'customize-settings',
    title: 'Customize Settings',
    description: 'Configure your agent\'s behavior and responses',
    completed: false,
    action: () => router.push('/settings')
  },
  {
    id: 'explore-advanced',
    title: 'Explore Advanced Features',
    description: 'Discover integrations and advanced capabilities',
    completed: false,
    action: () => router.push('/conversations')
  }
]

const completedSteps = computed(() => {
  return getStartedSteps.filter(step => step.completed).length
})

const progressPercentage = computed(() => {
  return (completedSteps.value / getStartedSteps.length) * 100
})

const handleQuickAction = (action: Function) => {
  action()
}

const handleGetStartedStep = (step: any) => {
  step.action()
}

const continueToAgent = () => {
  if (authStore.user?.id) {
    router.push(`/agent/${authStore.user.id}`)
  }
}

onMounted(() => {
  // Mark onboarding as completed
  authStore.updateOnboardingStep('completed')
})
</script>

<template>
  <div class="agentic-home-view">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            Welcome to Botsify, {{ authStore.user?.firstName }}! 🎉
          </h1>
          <p class="welcome-subtitle">
            Your AI agent is ready to go. Let's get started building amazing conversations!
          </p>
        </div>
        
        <div class="welcome-actions">
          <button @click="continueToAgent" class="primary-action primary">
            <i class="pi pi-play"></i>
            <span>Start Building</span>
          </button>
          <button @click="() => router.push('/settings')" class="secondary-action">
            <i class="pi pi-cog"></i>
            <span>Customize</span>
          </button>
        </div>
      </div>
      
      <div class="welcome-illustration">
        <div class="success-animation">
          <div class="checkmark-circle">
            <i class="pi pi-check"></i>
          </div>
          <div class="celebration-dots">
            <div class="dot dot-1"></div>
            <div class="dot dot-2"></div>
            <div class="dot dot-3"></div>
            <div class="dot dot-4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.totalAgents }}</div>
            <div class="stat-label">AI Agents</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-comments"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.totalConversations }}</div>
            <div class="stat-label">Conversations</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-star"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.planName }}</div>
            <div class="stat-label">Current Plan</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-chart-line"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.planLimit }}</div>
            <div class="stat-label">Monthly Limit</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="main-content">
      <!-- Selected Agent Card -->
      <div class="content-card agent-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user"></i>
            Your AI Agent
          </h3>
        </div>
        
        <div class="card-body">
          <div v-if="authStore.selectedAgent" class="agent-info">
            <div class="agent-avatar">
              <img :src="authStore.selectedAgent.avatar" :alt="authStore.selectedAgent.name" />
              <div v-if="authStore.selectedAgent.isPremium" class="premium-badge">
                <i class="pi pi-crown"></i>
              </div>
            </div>
            
            <div class="agent-details">
              <h4 class="agent-name">{{ authStore.selectedAgent.name }}</h4>
              <p class="agent-description">{{ authStore.selectedAgent.description }}</p>
              
              <div class="agent-capabilities">
                <h5>Key Capabilities:</h5>
                <ul>
                  <li v-for="capability in authStore.selectedAgent.capabilities.slice(0, 3)" :key="capability">
                    <i class="pi pi-check"></i>
                    <span>{{ capability }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div v-else class="no-agent">
            <div class="no-agent-icon">🤖</div>
            <p>No agent selected yet</p>
            <button @click="() => router.push('/select-agent')" class="select-agent-btn primary">
              Choose an Agent
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="content-card quick-actions-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-bolt"></i>
            Quick Actions
          </h3>
        </div>
        
        <div class="card-body">
          <div class="quick-actions-grid">
            <button
              v-for="action in quickActions"
              :key="action.id"
              @click="handleQuickAction(action.action)"
              class="quick-action-btn"
              :style="{ '--action-color': action.color }"
            >
              <div class="action-icon">
                <i :class="action.icon"></i>
              </div>
              <div class="action-content">
                <h4 class="action-title">{{ action.title }}</h4>
                <p class="action-description">{{ action.description }}</p>
              </div>
              <div class="action-arrow">
                <i class="pi pi-arrow-right"></i>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Getting Started Progress -->
      <div class="content-card progress-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-list-check"></i>
            Getting Started
          </h3>
          <div class="progress-indicator">
            <span class="progress-text">{{ completedSteps }}/{{ getStartedSteps.length }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div class="card-body">
          <div class="steps-list">
            <div
              v-for="step in getStartedSteps"
              :key="step.id"
              class="step-item"
              :class="{ completed: step.completed }"
              @click="handleGetStartedStep(step)"
            >
              <div class="step-indicator">
                <i v-if="step.completed" class="pi pi-check"></i>
                <span v-else class="step-number">{{ getStartedSteps.indexOf(step) + 1 }}</span>
              </div>
              
              <div class="step-content">
                <h4 class="step-title">{{ step.title }}</h4>
                <p class="step-description">{{ step.description }}</p>
              </div>
              
              <div class="step-action">
                <i class="pi pi-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plan Overview -->
      <div class="content-card plan-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-credit-card"></i>
            Your Plan
          </h3>
        </div>
        
        <div class="card-body">
          <div v-if="authStore.selectedPlan" class="plan-info">
            <div class="plan-header">
              <h4 class="plan-name">{{ authStore.selectedPlan.name }} Plan</h4>
              <div class="plan-price">
                <span class="currency">$</span>
                <span class="price">{{ authStore.selectedPlan.price }}</span>
                <span class="period">/{{ authStore.selectedPlan.billing }}</span>
              </div>
            </div>
            
            <div class="plan-features">
              <h5>Included Features:</h5>
              <ul>
                <li v-for="feature in authStore.selectedPlan.features.slice(0, 4)" :key="feature">
                  <i class="pi pi-check"></i>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>
            
            <div class="plan-usage">
              <div class="usage-item">
                <span class="usage-label">Conversations:</span>
                <span class="usage-value">
                  0 / {{ typeof authStore.selectedPlan.limits.conversations === 'number' 
                    ? authStore.selectedPlan.limits.conversations.toLocaleString() 
                    : authStore.selectedPlan.limits.conversations }}
                </span>
              </div>
              <div class="usage-item">
                <span class="usage-label">AI Agents:</span>
                <span class="usage-value">
                  {{ userStats.totalAgents }} / {{ typeof authStore.selectedPlan.limits.agents === 'number' 
                    ? authStore.selectedPlan.limits.agents 
                    : authStore.selectedPlan.limits.agents }}
                </span>
              </div>
            </div>
            
            <button @click="() => router.push('/pricing')" class="upgrade-btn">
              <i class="pi pi-arrow-up"></i>
              <span>{{ authStore.selectedPlan.price === 0 ? 'Upgrade Plan' : 'Change Plan' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Section -->
    <div class="help-section">
      <div class="help-card">
        <div class="help-content">
          <div class="help-icon">
            <i class="pi pi-question-circle"></i>
          </div>
          <div class="help-text">
            <h4>Need Help Getting Started?</h4>
            <p>Check out our tutorials and documentation to make the most of your AI agent.</p>
          </div>
          <div class="help-actions">
            <a href="https://docs.botsify.com" target="_blank" class="help-link">
              <i class="pi pi-book"></i>
              <span>Documentation</span>
            </a>
            <a href="https://www.youtube.com/@Botsify" target="_blank" class="help-link">
              <i class="pi pi-play-circle"></i>
              <span>Video Tutorials</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agentic-home-view {
  padding: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-header {
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  margin-bottom: var(--space-8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.welcome-header::before {
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
  border-radius: var(--radius-lg);
}

.welcome-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#ffffff20 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.18;
  z-index: 1;
  mix-blend-mode: color-dodge;
  pointer-events: none;
  border-radius: var(--radius-lg);
}

.welcome-header > * {
  position: relative;
  z-index: 2;
}



.welcome-content {
  flex: 1;
  z-index: 2;
  position: relative;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--space-3);
  line-height: 1.2;
  color: #000;
}

.welcome-subtitle {
  font-size: 1.125rem;
  margin-bottom: var(--space-6);
  line-height: 1.5;
  color: #333;
}

.welcome-actions {
  display: flex;
  gap: var(--space-3);
}

.primary-action {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: white;
  color: var(--color-primary);
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.primary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.secondary-action {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.secondary-action:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.welcome-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  position: relative;
}

.success-animation {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkmark-circle {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.celebration-dots {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.dot {
  position: absolute;
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float 3s ease-in-out infinite;
}

.dot-1 {
  top: -60px;
  left: -30px;
  animation-delay: 0s;
}

.dot-2 {
  top: -20px;
  right: -50px;
  animation-delay: 0.8s;
}

.dot-3 {
  bottom: -50px;
  left: 20px;
  animation-delay: 1.6s;
}

.dot-4 {
  bottom: -20px;
  right: -30px;
  animation-delay: 2.4s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px);
    opacity: 1;
  }
}

.stats-section {
  margin-bottom: var(--space-8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.stat-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: all var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: rgba(68, 115, 246, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #000;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.stat-icon::before {
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
  filter: blur(30px);
  opacity: 0.8;
  z-index: 0;
  border-radius: var(--radius-md);
}

.stat-icon > * {
  position: relative;
  z-index: 1;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.main-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.content-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.content-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: rgba(68, 115, 246, 0.2);
}

.card-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(to right, rgba(68, 115, 246, 0.02), transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.card-body {
  padding: var(--space-4);
}

.agent-info {
  display: flex;
  gap: var(--space-4);
}

.agent-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-tertiary);
}

.agent-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.premium-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: var(--color-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
  border: 2px solid white;
}

.agent-details {
  flex: 1;
  min-width: 0;
}

.agent-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.agent-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}

.agent-capabilities h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.agent-capabilities ul {
  list-style: none;
}

.agent-capabilities li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
}

.agent-capabilities i {
  color: var(--color-success);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.no-agent {
  text-align: center;
  padding: var(--space-6);
}

.no-agent-icon {
  font-size: 3rem;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.no-agent p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.select-agent-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-normal);
}

.select-agent-btn:hover {
  background: var(--color-primary-hover);
}

.quick-actions-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: left;
  width: 100%;
}

.quick-action-btn:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--action-color);
  transform: translateX(4px);
}

.action-icon {
  width: 40px;
  height: 40px;
  background: var(--action-color);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.action-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.action-arrow {
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.progress-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--color-success), #16a34a);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.step-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.step-item:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-primary);
}

.step-item.completed {
  background: rgba(16, 185, 129, 0.05);
  border-color: var(--color-success);
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.step-item.completed .step-indicator {
  background: var(--color-success);
  color: white;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.step-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.step-action {
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.plan-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.currency {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.period {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.plan-features {
  margin-bottom: var(--space-4);
}

.plan-features h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.plan-features ul {
  list-style: none;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
}

.plan-features i {
  color: var(--color-success);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.plan-usage {
  margin-bottom: var(--space-4);
}

.usage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--color-border);
}

.usage-item:last-child {
  border-bottom: none;
}

.usage-label {
  color: var(--color-text-secondary);
}

.usage-value {
  color: var(--color-text-primary);
  font-weight: 500;
}

.upgrade-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: #000;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.upgrade-btn::before {
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
  filter: blur(30px);
  opacity: 0.8;
  z-index: 0;
  border-radius: var(--radius-md);
}

.upgrade-btn > * {
  position: relative;
  z-index: 1;
}

.upgrade-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(68, 115, 246, 0.3);
}

.help-section {
  margin-top: var(--space-8);
}

.help-card {
  background: linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-tertiary));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.help-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.help-icon {
  width: 60px;
  height: 60px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.help-text {
  flex: 1;
  min-width: 0;
}

.help-text h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.help-text p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.help-actions {
  display: flex;
  gap: var(--space-3);
}

.help-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-normal);
}

.help-link:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .agentic-home-view {
    padding: var(--space-4);
  }

  .welcome-header {
    flex-direction: column;
    text-align: center;
    padding: var(--space-6);
  }

  .welcome-title {
    font-size: 2rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }

  .welcome-actions {
    justify-content: center;
  }

  .welcome-illustration {
    margin-top: var(--space-4);
  }

  .checkmark-circle {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .agent-info {
    flex-direction: column;
    text-align: center;
  }

  .help-content {
    flex-direction: column;
    text-align: center;
  }

  .help-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-actions {
    flex-direction: column;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
    justify-content: center;
  }
}

/* Dark theme support */
[data-theme="dark"] .welcome-header {
  background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%);
}

[data-theme="dark"] .help-card {
  background: linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary));
}
</style> 