<script setup lang="ts">
import ModalLayout from "@/components/ui/ModalLayout.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";
import { ref, onMounted, defineAsyncComponent, onUnmounted } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import { eventBus } from "@/utils/eventBus";
import { botsifyApi } from "@/services/botsifyApi";
import { useChatStore } from "@/stores/chatStore";

// Change from async to direct import for WhatsAppModal
const WhatsAppModal = defineAsyncComponent({
  loader: () => import('./WhatsApp/WhatsAppModal.vue'),
  onError: (error: any, retry: any, fail: any, attempts: any) => {
    console.error('Failed to load WhatsAppModal:', error);
    if (attempts <= 3) {
      retry();
    } else {
      fail();
    }
  }
});
const SmsModal = defineAsyncComponent({
  loader: () => import('./Sms/SmsModal.vue'),
  onError: (error: any, retry: any, fail: any, attempts: any) => {
    console.error('Failed to load SmsModal:', error);
    if (attempts <= 3) {
      retry();
    } else {
      fail();
    }
  }
});
const MessengerModal = defineAsyncComponent({
  loader: () => import('./Messenger/MessengerModal.vue'),
  onError: (error: any, retry: any, fail: any, attempts: any) => {
    console.error('Failed to load MessengerModal:', error);
    if (attempts <= 3) {
      retry();
    } else {
      fail();
    }
  }
});
const InstagramModal = defineAsyncComponent({
  loader: () => import('./Instagram/InstagramModal.vue'),
  onError: (error: any, retry: any, fail: any, attempts: any) => {
    console.error('Failed to load InstagramModal:', error);
    if (attempts <= 3) {
      retry();
    } else {
      fail();
    }
  }
});
const TelegramModal = defineAsyncComponent({
  loader: () => import('./TelegramModal.vue'),
  onError: (error: any, retry: any, fail: any, attempts: any) => {
    console.error('Failed to load TelegramModal:', error);
    if (attempts <= 3) {
      retry();
    } else {
      fail();
    }
  }
});
const WebsiteModal = defineAsyncComponent({
  loader: () => import('./WebsiteModal.vue'),
  onError: (error: any, retry: any, fail: any, attempts: any) => {
    console.error('Failed to load WebsiteModal:', error);
    if (attempts <= 3) {
      retry();
    } else {
      fail();
    }
  }
});
const PortableAgentModal = defineAsyncComponent({
  loader: () => import('./PortableAgentModal.vue'),
  onError: (error: any, retry: any, fail: any, attempts: any) => {
    console.error('Failed to load PortableAgentModal:', error);
    if (attempts <= 3) {
      retry();
    } else {
      fail();
    }
  }
});

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null);
const websiteModalRef = ref<InstanceType<typeof WebsiteModal> | null>(null);
const whatsappModalRef = ref<any>(null);
const telegramModalRef = ref<InstanceType<typeof TelegramModal> | null>(null);
const smsModalRef = ref<InstanceType<typeof SmsModal> | null>(null);
const messengerModalRef = ref<InstanceType<typeof MessengerModal> | null>(null);
const instagramModalRef = ref<InstanceType<typeof InstagramModal> | null>(null);
const portableAgentModalRef = ref<InstanceType<typeof PortableAgentModal> | null>(null);

const publishStore = usePublishStore();
const chatStore = useChatStore();
const isLoading = ref(false);
const isDeploying = ref(false);

const agents = ref([
  { icon: 'portable-agent-icon.svg', label: 'Portable agent', status: 'inactive' },
  { icon: 'website.png', label: 'Website', status: 'inactive' },
  { icon: 'whatsapp.png', label: 'WhatsApp', status: 'inactive' },
  { icon: 'messenger.png', label: 'Messenger', status: 'inactive' },
  { icon: 'instagram.png', label: 'Instagram', status: 'inactive' },
  { icon: 'telegram.png', label: 'Telegram', status: 'inactive' },
  { icon: 'sms.png', label: 'SMS', status: 'inactive' },
]);

const fetchPublishStatus = async () => {
  // Only fetch if not already loaded
  if (publishStore.loadingStates.publishStatus && publishStore.cache.publishStatus) {
    updateAgentStatus(publishStore.cache.publishStatus);
    return;
  }
  
  isLoading.value = true;
  try {
    const result = await publishStore.getPublishStatus();
    
    if (result.success && result.data) {
      updateAgentStatus(result.data);
    }
  } catch (error) {
    console.error('Failed to fetch publish status:', error);
  } finally {
    isLoading.value = false;
  }
};

const updateAgentStatus = (publishStatus: any) => {
  if (!publishStatus || !publishStatus.data) return;

  const statusData = publishStatus.data;

  // Update status based on publish status API response
  agents.value.forEach(agent => {
    switch (agent.label) {
      case 'Telegram':
        agent.status = statusData.telegram ? 'active' : 'inactive';
        break;
      case 'SMS':
        agent.status = statusData.twilio ? 'active' : 'inactive';
        break;
      case 'WhatsApp':
        agent.status = statusData.whatsapp ? 'active' : 'inactive';
        break;
      case 'Messenger':
        agent.status = statusData.facebook ? 'active' : 'inactive';
        break;
      case 'Instagram':
        agent.status = statusData.instagram ? 'active' : 'inactive';
        break;
      case 'Website':
        // Website status might be handled differently
        agent.status = 'inactive';
        break;
      case 'Portable agent':
        // Portable agent status might be handled differently
        agent.status = 'inactive';
        break;
      default:
        agent.status = 'inactive';
    }
  });
};

const openModal = () => {
  modalRef.value?.openModal();
  // Only fetch if not already cached
  if (!publishStore.loadingStates.publishStatus || !publishStore.cache.publishStatus) {
    fetchPublishStatus();
  } else {
    // Use cached data
    updateAgentStatus(publishStore.cache.publishStatus);
  }
};

const handleAgentClick = (agentLabel: string) => {
  // Emit event for agent selection
  eventBus.emit('publish-agent:selected', { agent: agentLabel });
  
  if (agentLabel === 'Website') {
    websiteModalRef.value?.openModal();
  } else if (agentLabel === 'WhatsApp') {
    whatsappModalRef.value?.openModal();
  } else if (agentLabel === 'Telegram'){
    telegramModalRef.value?.openModal();
  } else if (agentLabel === 'SMS'){
    smsModalRef.value?.openModal();
  } else if (agentLabel === 'Messenger'){
    messengerModalRef.value?.openModal();
  } else if (agentLabel === 'Instagram'){
    instagramModalRef.value?.openModal();
  } else if (agentLabel === 'Portable agent'){
    portableAgentModalRef.value?.openModal();
  }
  modalRef.value?.closeModal();
};

const handleBackToMain = () => {
  modalRef.value?.openModal();
  // Only fetch if not already cached
  if (!publishStore.loadingStates.publishStatus || !publishStore.cache.publishStatus) {
    fetchPublishStatus();
  }
};

// Listen for deploy request from ChatHeader
onMounted(() => {
  // Listen for status updates from child modals
  const handleStatusUpdate = () => {
    // Refresh status if needed
    fetchPublishStatus();
  };
  
  // Listen for deploy request
  const handleDeployRequest = () => {
    openModal();
  };
  
  eventBus.on('agent:status-updated', handleStatusUpdate);
  eventBus.on('deploy-agent:request', handleDeployRequest);
  
  // Store handlers for cleanup
  const handlers = {
    'agent:status-updated': handleStatusUpdate,
    'deploy-agent:request': handleDeployRequest
  };
  
  // Cleanup event listeners
  onUnmounted(() => {
    Object.entries(handlers).forEach(([event, handler]) => {
      eventBus.off(event, handler);
    });
  });
});

const handleDeploy = async () => {
  // Prevent multiple clicks while deploying
  if (isDeploying.value) {
    return;
  }
  
  // Set deploying state
  isDeploying.value = true;
  
  try {
    const result = await botsifyApi.deployAiAgent(
      chatStore.activeAiPromptVersion?.version_id ?? parseInt(chatStore.activeAiPromptVersion?.id ?? '0'),
      chatStore.createAiPromptVersionName()
    );
    
    
    if (result.success) {
      // Update the story with the latest content
      const currentChat = chatStore.chats[0];
      if (currentChat) {
        chatStore.updateStory(currentChat.id, currentChat.story?.content || '', true);
        chatStore.updateActivePromptVersionId(result.data.version.id);
      }
      
      // Show success message
      window.$toast.success('Agent deployed successfully!');
    } else {
      window.$toast.error(`Deployment failed: ${result.message}`);
    }
  } catch (error) {
    window.$toast.error('An unexpected error occurred during deployment.');
  } finally {
    isDeploying.value = false;
  }
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <!-- Main Agent Selection Modal -->
  <ModalLayout
    ref="modalRef"
    title=""
    max-width="650px"
    :showCloseButton="true"
  >
    <!-- Confirmation Message -->
    <div class="confirmation-message">
      <div class="confirmation-content">
        <p>Are you sure you want to deploy changes it?</p>
        <Button 
          variant="success" 
          @click="handleDeploy" 
          icon="pi pi-play"
          :disabled="isDeploying"
          :loading="isDeploying"
        >
          {{ isDeploying ? 'Deploying...' : 'Deploy agent' }}
        </Button>
      </div>
    </div>
    
    <!-- Agent Selection Grid -->
    <div class="agents-section">
      <h4>Publish agent</h4>
      <div class="server-grid">
        <div
          class="server-card"
          v-for="agent in agents"
          :key="agent.icon"
          @click="handleAgentClick(agent.label)"
          :class="{ 'active': agent.status === 'active' }"
        >
          <div class="server-icon">
            <img :src="`/bots/${agent.icon}`" width="28" height="28" :alt="`${agent.label} icon`"/>
          </div>
          <div class="text-sm text-emphasis">
            <div>{{ agent.label }}</div>
          </div>
          <!-- Status badges -->
          <Badge 
            v-if="agent.status === 'active'" 
            variant="success" 
            size="xs" 
            icon="pi pi-check"
            iconPosition="left"
            class="status-badge"
          >
            Connected
          </Badge>
        </div>
      </div>
    </div>
  </ModalLayout>

  <!-- Website Modal Component -->
  <WebsiteModal 
    ref="websiteModalRef" 
    @back="handleBackToMain" 
  />

  <!-- WhatsApp Modal Component -->
  <WhatsAppModal 
    ref="whatsappModalRef" 
    @back="handleBackToMain" 
  />

   <!-- Telegram Modal Component -->
   <TelegramModal 
    ref="telegramModalRef" 
    @back="handleBackToMain" 
  />

  
   <!-- Sms Modal Component -->
   <SmsModal 
    ref="smsModalRef" 
    @back="handleBackToMain" 
  />

  <MessengerModal 
    ref="messengerModalRef" 
    @back="handleBackToMain" 
  />

  <InstagramModal 
    ref="instagramModalRef" 
    @back="handleBackToMain" 
  />

  <PortableAgentModal 
    ref="portableAgentModalRef" 
    @back="handleBackToMain" 
  />
</template>

<style scoped>
/* Common Modal Styles - Centralized for all modal components */
.server-card {
  position: relative;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-tertiary);
  text-align: center;
}

.server-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.server-card .server-icon {
  margin-bottom: var(--space-2);
}

.server-card .server-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

/* Status Badge Styles */
.status-badge {
  position: absolute;
  top: 2px;
  right: 4px;
  z-index: 1;
  font-size: 0.6rem;
  font-weight: 500;
  transition: transform var(--transition-fast);
}

.status-badge:hover {
  transform: scale(1.05);
}

/* Active card styling */
.server-card.active {
  border: 2px solid var(--color-secondary, #10b981);
  background-color: rgba(16, 185, 129, 0.1);
}

/* Single Screen Layout Styles */
.confirmation-message {
  text-align: center;
  margin-bottom: var(--space-6);
}

.confirmation-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.confirmation-message p {
  margin: 0;
  color: var(--color-text-primary, #111827);
  font-size: 18px;
  font-weight: 500;
  line-height: 1.6;
}

.agents-section {
  border-top: 1px solid var(--color-border-secondary);
  padding-top: var(--space-6);
}

.agents-section h4 {
  margin: 0 0 var(--space-4) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  text-align: left;
}

.server-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}
</style>