<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '../stores/chatStore';
import ChatMessage from '../components/chat/ChatMessage.vue';
import MessageInput from '../components/chat/MessageInput.vue';
import TypingIndicator from '../components/chat/TypingIndicator.vue';
import DebugConsole from '../components/debug/DebugConsole.vue';
import SystemMessageSender from '../components/chat/SystemMessageSender.vue';
import ApiErrorNotification from '../components/chat/ApiErrorNotification.vue';
import StorySidebar from '../components/chat/StorySidebar.vue';
import ThemeToggle from '../components/ui/ThemeToggle.vue';
import UserMenu from '../components/auth/UserMenu.vue';

const route = useRoute();
const chatStore = useChatStore();
const chatId = computed(() => route.params.id as string);
const messagesContainer = ref<HTMLElement | null>(null);
const storySidebar = ref<InstanceType<typeof StorySidebar> | null>(null);
const showDebug = ref(false);
const showSystemMessageModal = ref(false);

const chat = computed(() => {
  return chatStore.chats.find(c => c.id === chatId.value);
});

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

// Watch for typing status to scroll to bottom
watch(() => chatStore.isTyping, (isTyping, wasTyping) => {
  console.log('Typing status changed:', { isTyping, wasTyping });
  scrollToBottom();
});

onMounted(() => {
  // Set active chat when component mounts
  chatStore.setActiveChat(chatId.value);
  scrollToBottom();
  
  // Toggle debug console with Ctrl+Shift+D
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      showDebug.value = !showDebug.value;
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
});

function toggleSystemMessageModal() {
  showSystemMessageModal.value = !showSystemMessageModal.value;
}

function toggleMobileSidebar() {
  if (storySidebar.value) {
    storySidebar.value.toggleSidebar();
  }
}

function clearVersionHistory() {
  if (confirm('Are you sure you want to clear version history for this chat? This cannot be undone.')) {
    chatStore.clearVersionHistory(chatId.value);
  }
}

function clearAllChats() {
  if (confirm('Are you sure you want to clear all conversations except this one? This cannot be undone.')) {
    chatStore.clearAllChatsExceptActive();
  }
}

function clearMessageHistory() {
  if (confirm('Are you sure you want to clear the message history for this conversation? This cannot be undone.')) {
    chatStore.clearChatMessages(chatId.value);
  }
}
</script>

<template>
  <div v-if="chat" class="chat-view with-sidebar">
    <!-- API Error Notification -->
    <ApiErrorNotification />
    
    <div class="chat-header">
      <h2>{{ chat.title }}</h2>
      <div class="chat-actions">
        <!-- Clear History Dropdown -->
        <div class="dropdown">
          <button class="icon-button" title="Clear History">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
          <div class="dropdown-content">
            <button @click="clearMessageHistory" class="dropdown-item">
              Clear Message History
            </button>
            <button @click="clearVersionHistory" class="dropdown-item">
              Clear Version History
            </button>
            <button @click="clearAllChats" class="dropdown-item danger">
              Clear All Conversations
            </button>
          </div>
        </div>
        
        <!-- Mobile sidebar toggle button -->
        <button class="icon-button mobile-sidebar-toggle" @click="toggleMobileSidebar" title="Toggle Sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="9"></line>
            <line x1="9" y1="12" x2="15" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </button>
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
    </div>
    
    <MessageInput :chatId="chatId" />
    
    <!-- Story Sidebar -->
    <StorySidebar ref="storySidebar" :chatId="chatId" />
    
    <!-- System Message Modal -->
    <div v-if="showSystemMessageModal" class="modal-overlay" @click.self="toggleSystemMessageModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>System Message</h3>
          <button class="close-button" @click="toggleSystemMessageModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <SystemMessageSender />
      </div>
    </div>
    
    <DebugConsole v-if="showDebug" />
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
}

.chat-view.with-sidebar {
  padding-right: 400px;
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
    max-width: calc(100% - 120px);
  }
  
  .modal-content {
    width: 95%;
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
</style>