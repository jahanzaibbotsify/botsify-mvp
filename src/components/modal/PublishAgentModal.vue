<script setup lang="ts">
import ModalLayout from "@/components/ui/ModalLayout.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";
import { ref, defineAsyncComponent, computed } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import { botsifyApi } from "@/services/botsifyApi";
import { useChatStore } from "@/stores/chatStore";
import { formatDate } from "@/utils";

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
const isDeploying = ref(false);

const publishStatus = computed(() => publishStore.publishStatus.data);
const agents = computed(() => {
  const statusData = publishStatus.value?.data?.data;
  return [
    { icon: 'portable-agent-icon.svg', label: 'Portable agent', status: 'inactive' },
    { icon: 'website.png', label: 'Website', status: 'inactive' },
    { icon: 'whatsapp.png', label: 'WhatsApp', status: statusData?.whatsapp ? 'active' : 'inactive' },
    { icon: 'messenger.png', label: 'Messenger', status: statusData?.facebook ? 'active' : 'inactive' },
    { icon: 'instagram.png', label: 'Instagram', status: statusData?.instagram ? 'active' : 'inactive' },
    { icon: 'telegram.png', label: 'Telegram', status: statusData?.telegram ? 'active' : 'inactive' },
    { icon: 'sms.png', label: 'SMS', status: statusData?.twilio ? 'active' : 'inactive' },
  ];
});

const openModal = () => {
  modalRef.value?.openModal();
  // Only fetch if not already cached
  publishStore.publishStatus.load();
};

const handleAgentClick = (agentLabel: string) => {
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
};

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
        <div>
          <p>Are you sure you want to deploy changes?</p>
          <small>This will deploy your AI Agent to connected platforms</small>
        </div>
        <div class="confirmation-actions">
          <Button 
            variant="success" 
            @click="handleDeploy" 
            icon="pi pi-play"
            :disabled="isDeploying"
            :loading="isDeploying"
          >
            {{ isDeploying ? 'Deploying...' : 'Deploy agent' }}
          </Button>
          <p v-if="chatStore.activeAiPromptVersion?.createdAt">Deployed: {{ formatDate(chatStore.activeAiPromptVersion.createdAt) }}</p>
        </div>
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
  border-bottom: 1px solid var(--color-border);
  margin-left: -16px;
  margin-right: -16px;
  padding-bottom: var(--space-4);
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}


.confirmation-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
}

.confirmation-message p {
  margin: 0;
  color: var(--color-text-primary, #111827);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
}

.confirmation-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}

.confirmation-actions p{
  font-size: 0.65rem;
  font-weight: 400;
}

.agents-section {
  padding-top: var(--space-3);
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