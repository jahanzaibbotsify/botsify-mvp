<template>
  <div class="chat-header">
    <div class="chat-header-left">
      <!-- Bot Name Dropdown -->
      <Dropdown position="bottom-left" class="bot-name-dropdown">
        <template #trigger>
          <div class="bot-name-trigger" title="More actions">
            {{botStore.botName}} 
            <i class="pi pi-plus" style="font-size: 14px; font-weight: 500; margin-left: 3px;"></i>
          </div>
        </template>
        <template #content>
          <DropdownItem @click="navigateToManageAgents">
            <template #icon>
              <i class="pi pi-cog" style="font-size: 17px;"></i>
            </template>
            <span>Manage Agents</span>
          </DropdownItem>
        </template>
      </Dropdown>
    </div>
    
    <div class="action-buttons">  
      <!-- Deploy/Test AI Buttons -->
      <div class="action-buttons">
        <Button 
          variant="success"
          @click="deployAI"
          :disabled="!hasPromptContent || chatStore.isAIPromptGenerating"
          :title="!hasPromptContent ? 'Generate prompt content first' : 'Deploy your AI agent'"
          icon="pi pi-play"
        >
          Deploy Agent
        </Button>
        <Button 
          variant="warning"
          @click="testAI"
          :disabled="!hasPromptContent || chatStore.isAIPromptGenerating"
          :title="!hasPromptContent ? 'Generate prompt content first' : 'Test your AI agent'"
          icon="pi pi-wrench"
        >
          Test Agent
        </Button>
      </div>

      <!-- More Actions Dropdown -->
      <Dropdown position="bottom-right" class="more-actions-dropdown">
        <template #trigger>
          <button class="icon-button" title="More actions">
            <i class="pi pi-ellipsis-v"></i>
          </button>
        </template>
        <template #content>
          <DropdownItem @click="toggleTheme">
            <template #icon>
              <i :class="themeStore.theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'" style="font-size: 17px;"></i>
            </template>
            <span>{{ themeStore.theme === 'light' ? 'Night Theme' : 'Light Theme' }}</span>
          </DropdownItem>
          <DropdownItem @click="handleAIPrompt" v-if="props.hasPromptContent">
            <template #icon>
              <i class="pi pi-bolt" style="font-size: 17px;"></i>
            </template>
            <span>AI Prompt</span>
          </DropdownItem>
          <DropdownItem 
            :disabled="chatStore.chats[0].messages.length < 2" 
            @click="handleReset('reset')"
          >
            <template #icon>
              <i class="pi pi-replay" style="font-size: 17px;"></i>
            </template>
            <span>Clear Conversation</span>
          </DropdownItem>
        </template>
      </Dropdown>
      
      <UserMenu/>
    </div>
    
    <CalendlyModal ref="bookMeetingRef"></CalendlyModal>
    
    <Teleport to="body">
      <PublishAgentModal ref="publishAgentRef"/>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/themeStore';
import { useChatStore } from '@/stores/chatStore';
import { useBotStore } from '@/stores/botStore';
import { useRoleStore } from '@/stores/roleStore';
import { getWebUrl } from '@/utils';
import CalendlyModal from '@/components/modal/CalendlyModal.vue';
import UserMenu from "@/components/ui/UserMenu.vue";
import PublishAgentModal from "@/components/modal/PublishAgentModal.vue";
import Button from "@/components/ui/Button.vue";
import { Dropdown, DropdownItem } from "@/components/ui";

interface Props {
  chatId: string,
  title: string;
  hasPromptContent: boolean;
  latestPromptContent: string;
}

const props = defineProps<Props>();
const router = useRouter();
const chatStore = useChatStore();
const botStore = useBotStore();
const themeStore = useThemeStore();
const bookMeetingRef = ref<InstanceType<typeof CalendlyModal> | null>(null)
const publishAgentRef = ref<InstanceType<typeof PublishAgentModal> | null>(null)

const emit = defineEmits<{
  toggleStorySidebar: [];
}>();

const roleStore = useRoleStore();

function toggleTheme() {
  themeStore.setTheme(themeStore.theme === 'light' ? 'dark' : 'light');
}

function handleAIPrompt() {
  emit('toggleStorySidebar');
}

async function testAI() {
  if (!props.hasPromptContent) {
    window.$toast.error('No prompt content available to deploy. Please generate some content first.');
    return;
  }
  const apiKey = botStore.apiKey;
  const url = `${getWebUrl()}/web-bot/agent/${apiKey}?testagent=true`;
  window.open(url, '_blank');
}

function deployAI() {
  if (!roleStore.hasSubscription) {
    bookMeetingRef.value?.openModal();
    return;
  }

  if (!props.hasPromptContent) {
    window.$toast.error('No prompt content available to deploy. Please generate some content first.');
    return;
  }
  
  // Direct call to open publish agent modal
  publishAgentRef.value?.openModal();
}

function handleReset(type: string) {
  let confirmButtonText = 'Yes';
  if (type === 'reset') {
    confirmButtonText += ' Clear it!';
  }
  window.$confirm({
    text: "Are you sure you want to clear the conversation?",
    confirmButtonText: confirmButtonText
  }, async() => {
    // Confirm callback - clear chat messages
    chatStore.clearChatMessages()
  }, () => {
    // Cancel callback - do nothing
  });
}

function navigateToManageAgents() {
  router.push({ path: '/select-agent' });
}
</script>

<style scoped>
.chat-header {
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 163, 255, 0.08);
  border: 1px solid rgba(0, 163, 255, 0.1);
}

.chat-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-header-left {
  display: flex;
  gap: 5px;
}

.icon-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  display: flex;
  font-size: 22px;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.bot-name-dropdown {
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.bot-name-dropdown:hover {
  background-color: var(--color-bg-tertiary);
}

.bot-name-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.bot-name-trigger .pi-angle-down {
  transition: transform var(--transition-fast);
}

.bot-name-dropdown:hover .pi-angle-down {
  transform: rotate(180deg);
}

.more-actions-dropdown {
  position: relative;
  display: inline-block;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style> 