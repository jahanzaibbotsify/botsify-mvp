<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import StorySidebar from '@/components/sidebar/StorySidebar.vue';
import ChatMessage from '@/components/chat/ChatMessage.vue';
import MessageInput from '@/components/chat/MessageInput.vue';
import TypingIndicator from '@/components/chat/TypingIndicator.vue';
import SystemMessageSender from '@/components/chat/SystemMessageSender.vue';
import ApiErrorNotification from '@/components/chat/ApiErrorNotification.vue';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';
import UserMenu from '@/components/auth/UserMenu.vue';
import { botsifyApi } from '@/services/botsifyApi';
import { BOTSIFY_WEB_URL } from '@/utils/config';


const route = useRoute();
const chatStore = useChatStore();
const chatId = computed(() => route.params.id as string);
const storySidebar = ref<InstanceType<typeof StorySidebar> | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const showSystemMessageModal = ref(false);
const showStorySidebar = ref(false);

const chat = computed(() => {
  let foundChat = chatStore.chats.find(c => c.id === chatId.value);
  
  // If chat doesn't exist, create it
  if (!foundChat && chatId.value) {
    console.log('Chat not found, creating new chat with ID:', chatId.value);
    const newChat = chatStore.createNewChat();
    // Update the chat ID to match the route
    newChat.id = chatId.value;
    foundChat = newChat;
  }
  
  return foundChat;
});

const isDeployingAI = ref(false);
const latestPromptContent = computed(() => chat.value?.story?.content || '');
const hasPromptContent = computed(() => latestPromptContent.value.trim().length > 0);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Watch for new messages to scroll to bottom
watch(() => chat.value?.messages.length, (newLength, oldLength) => {
  console.log('Messages length changed:', { newLength, oldLength });
  scrollToBottom();
});

watch(
  () => chat.value?.messages.map(m => m.content).join(''),
  () => {
    scrollToBottom();
  }
);

// Watch for typing status to scroll to bottom
watch(() => chatStore.isTyping, (isTyping, wasTyping) => {
  console.log('Typing status changed:', { isTyping, wasTyping });
  scrollToBottom();
});

const showCenteredInput = computed(() => {
  if (!chat.value || !chat.value.messages) return true;
  const msgs = chat.value.messages;
  return msgs.length === 0 || (msgs.length === 1 && (!msgs[0].content || msgs[0].content === null || msgs[0].content === ''));
});

onMounted(() => {
  // Set active chat when component mounts
  chatStore.setActiveChat(chatId.value);
  scrollToBottom();
  
});

function toggleSystemMessageModal() {
  showSystemMessageModal.value = !showSystemMessageModal.value;
}

function toggleMobileSidebar() {
  if (storySidebar.value) {
    storySidebar.value.toggleSidebar();
  }
}

function toggleStorySidebar() {
  showStorySidebar.value = !showStorySidebar.value;
}

async function testAI() {
  if (!hasPromptContent.value) {
    window.$toast.error('No prompt content available to deploy. Please generate some content first.');
    return;
  }
  const apiKey = (await import('@/stores/apiKeyStore')).useApiKeyStore().apiKey;
  const url = `${BOTSIFY_WEB_URL}/web-bot/agent/${apiKey}`;
  window.open(url, '_blank');
}

function deployAI() {
  if (!hasPromptContent.value) {
    window.$toast.error('No prompt content available to deploy. Please generate some content first.');
    return;
  }
  window.$confirm({}, async () => {
    isDeployingAI.value = true;
    try {
      const result = await botsifyApi.deployAiAgent(latestPromptContent.value);
      if (result.success) {
        window.$toast.success(`🚀 ${result.message}`);
      } else {
        window.$toast.error(`❌ Deployment failed: ${result.message}`);
      }
    } catch (error) {
      window.$toast.error('❌ An unexpected error occurred during deployment.');
    } finally {
      isDeployingAI.value = false;
    }
  });
}

function clearVersionHistory() {
  window.$confirm({}, () => {
    chatStore.clearVersionHistory(chatId.value);
  });
}

function clearAllChats() {
  window.$confirm({}, () => {
    chatStore.clearAllChatsExceptActive();
  });
}

// function clearMessageHistory() {
//   if (confirm('Are you sure you want to clear the message history for this conversation? This cannot be undone.')) {
//     chatStore.clearChatMessages(chatId.value);
//   }
// }
</script>

<template>
  <div v-if="chat" class="chat-view" :class="{ 'with-sidebar': showStorySidebar }">
    <!-- API Error Notification -->
    <ApiErrorNotification />
    
    <div class="chat-header">
      <h2>{{ chat.title }}</h2>
      <div class="chat-actions">
        
        <!-- Deploy/Test AI Buttons -->
        <button 
          class="action-button deploy-button"
          @click="deployAI"
          :disabled="isDeployingAI || !hasPromptContent"
          :title="!hasPromptContent ? 'Generate prompt content first' : 'Deploy your AI agent'"
        >
          <div class="button-content">
            <svg v-if="!isDeployingAI" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10,8 16,12 10,16 10,8"></polygon>
            </svg>
            <div v-else class="loading-spinner"></div>
            <span>{{ isDeployingAI ? 'Deploying...' : 'Deploy AI' }}</span>
          </div>
        </button>
        <button 
          class="action-button test-button"
          @click="testAI"
          :disabled="!hasPromptContent"
          :title="!hasPromptContent ? 'Generate prompt content first' : 'Test your AI agent'"
        >
          <div class="button-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            <span>Test AI</span>
          </div>
        </button>

        <!-- AI Prompt Toggle -->
        <button 
          class="icon-button ai-prompt-toggle" 
          @click="toggleStorySidebar"
          title="AI Prompt"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 12l2 2 4-4"></path>
            <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
            <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
            <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
            <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
          </svg>
        </button>

        <!-- Clear History Dropdown -->
        <div class="dropdown">
          <button class="icon-button" title="Delete">
            <i class="pi pi-trash"></i>
          </button>
          <div class="dropdown-content">
            <button @click="clearAllChats" class="dropdown-item danger">
              Delete Conversations
            </button>
            <button @click="clearVersionHistory" class="dropdown-item danger">
              Delete Version History
            </button>
          </div>
        </div>
        
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
    
    <div ref="messagesContainer" class="messages-container scrollbar">
      <div class="messages">
        <ChatMessage 
          v-for="message in chat.messages" 
          :key="`${message.id}-${message.content ? message.content.length : 0}`" 
          :message="message" 
        />
        
        <TypingIndicator v-if="chatStore.isTyping" />
      </div>
      <!-- Centered MessageInput if no messages or first message is empty -->
      <div v-if="showCenteredInput" class="centered-message-input">
        <div class="centered-heading">
          <h1>Start building your AI chatbot prompt...</h1>
        </div>
        <MessageInput :chatId="chatId" :centered="true" />
      </div>
    </div>
    
    <!-- Bottom MessageInput if there are real messages -->
    <MessageInput v-if="!showCenteredInput" :chatId="chatId" />
    
     <!-- Story Sidebar - Only show when enabled -->
     <StorySidebar v-if="showStorySidebar" ref="storySidebar" :chatId="chatId" />

    <!-- System Message Modal -->
    <div v-if="showSystemMessageModal" class="modal-overlay" @click.self="toggleSystemMessageModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>System Message</h3>
          <button class="close-button" @click="toggleSystemMessageModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <SystemMessageSender />
      </div>
    </div>
  </div>
  
  <div v-else class="chat-not-found">
    <h2>Chat not found</h2>
    <p>The chat you're looking for doesn't exist or has been deleted.</p>
    <button class="primary" @click="$router.push('/')">Back to Home</button>
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: padding-right 0.3s ease;
  position: relative;
  z-index: 1;
  padding-right: 150px;
  padding-left: 150px;
}

.chat-view.with-sidebar {
  padding-right: 400px;
  padding-left: 0px;
}

.chat-header {
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-bg-secondary);
  border-bottom: none;
  z-index: var(--z-sticky);
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 var(--space-4);
  margin-top: var(--space-4);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: 0 4px 15px rgba(0, 163, 255, 0.08);
  border: 1px solid rgba(0, 163, 255, 0.1);
  border-bottom: none;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-actions {
  display: flex;
  gap: var(--space-2);
}

.icon-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.ai-prompt-toggle {
  color: var(--color-primary);
  position: relative;
}

.ai-prompt-toggle:hover {
  background-color: rgba(0, 163, 255, 0.1);
  color: var(--color-primary);
}

.ai-prompt-toggle::after {
  content: 'AI Prompt';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast);
  z-index: var(--z-dropdown);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  margin-top: var(--space-1);
}

.ai-prompt-toggle:hover::after {
  opacity: 1;
  visibility: visible;
}

/* Dropdown styles */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background-color: var(--color-bg-primary);
  background-image: 
    radial-gradient(circle at right top, rgba(0, 163, 255, 0.08), transparent 70%);
  min-width: 200px;
  box-shadow: var(--shadow-md), 0 4px 15px rgba(0, 163, 255, 0.08);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 163, 255, 0.1);
  z-index: var(--z-dropdown);
  overflow: hidden;
}

.dropdown:hover .dropdown-content,
.dropdown:focus-within .dropdown-content {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  border-bottom: 1px solid rgba(0, 163, 255, 0.05);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color var(--transition-fast);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: rgba(0, 163, 255, 0.05);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.08), transparent 80%);
}

.dropdown-item.danger {
  color: var(--color-error);
}

.dropdown-item.danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.system-button {
  color: var(--color-primary);
}

.debug-button {
  color: var(--color-warning);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  background-color: var(--color-bg-primary);
  border-left: 1px solid rgba(0, 163, 255, 0.1);
  border-right: 1px solid rgba(0, 163, 255, 0.1);
  margin: 0 var(--space-4);
  box-shadow: 0 0 20px rgba(0, 163, 255, 0.06);
}

.messages {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.chat-not-found {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  text-align: center;
  background-image: 
    radial-gradient(circle at center, rgba(0, 163, 255, 0.05), transparent 70%);
}

.chat-not-found h2 {
  margin-bottom: var(--space-2);
}

.chat-not-found p {
  margin-bottom: var(--space-4);
  color: var(--color-text-secondary);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  background-image: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-content {
  background-color: var(--color-bg-secondary);
  background-image: 
    radial-gradient(circle at left top, rgba(0, 163, 255, 0.08), transparent 60%),
    radial-gradient(circle at right bottom, rgba(0, 163, 255, 0.05), transparent 60%);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg), 0 0 30px rgba(0, 163, 255, 0.1);
  border: 1px solid rgba(0, 163, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid rgba(0, 163, 255, 0.1);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.05), transparent 80%);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.close-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* Hide mobile sidebar toggle on desktop */
.mobile-sidebar-toggle {
  display: none;
}

/* Mobile styles */
@media (max-width: 767px) {
  .chat-view.with-sidebar {
    padding-right: 0;
  }

  .mobile-sidebar-toggle {
    display: flex;
  }

  .messages-container {
    padding: var(--space-3) var(--space-2);
    margin: 0 var(--space-2);
  }
  
  .chat-header {
    padding: var(--space-2) var(--space-3);
    margin: var(--space-2) var(--space-2) 0;
  }
  
  .message-input-container {
    margin: 0 var(--space-2) var(--space-2);
    padding: var(--space-2);
  }
  
  .chat-header h2 {
    font-size: 1rem;
    max-width: calc(100% - 140px);
  }
  
  .modal-content {
    width: 95%;
  }
  
  .ai-prompt-toggle::after {
    display: none;
  }
}

/* Small mobile devices */
@media (max-width: 480px) {
  .messages-container {
    padding: var(--space-2) var(--space-1);
  }
}

.message-input-container {
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
  position: sticky;
  bottom: 0;
  z-index: var(--z-sticky);
  margin: 0 var(--space-4) var(--space-4);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: 0 -2px 10px rgba(0, 163, 255, 0.03);
  border: 1px solid rgba(0, 163, 255, 0.1);
  border-top: none;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal);
  border: none;
  margin-left: var(--space-2);
}
.btn-primary {
  background-color: var(--color-primary);
  color: white;
}
.btn-primary:hover {
  background-color: var(--color-primary-hover);
}
.btn-secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}
.btn-secondary:hover {
  background-color: var(--color-bg-hover);
}
.centered-message-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  width: 100%;
  padding: 0;
  background-color: white;
}
.centered-message-input > * {
  width: 100%;
  max-width: 100%;
}
/* Centered heading styles */
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
  font-family: var(--font-family);
  line-height: 1.2;
}
.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-normal);
  cursor: pointer;
  border: none;
  width: 100%;
  height: 40px;
  min-height: 40px;
  max-height: 40px;
}
.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.button-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.test-button {
  background-color: var(--color-warning);
  color: white;
}
.test-button:hover:not(:disabled) {
  background-color: var(--color-warning-hover, #e6a700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.deploy-button {
  background-color: var(--color-success);
  color: white;
}
.deploy-button:hover:not(:disabled) {
  background-color: var(--color-success-hover, #16a34a);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.status-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}
.status-info.warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.status-info.success {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}
.status-info svg {
  flex-shrink: 0;
}
</style>