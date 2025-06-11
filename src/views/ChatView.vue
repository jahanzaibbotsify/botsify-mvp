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

// Watch for new messages to scroll to bottom and update story
watch(() => chat.value?.messages.length, (newLength, oldLength) => {
  console.log('Messages length changed:', { newLength, oldLength });
  scrollToBottom();
  
  // Check if a new AI message was added
  if (newLength && oldLength && newLength > oldLength) {
    const lastMessage = chat.value?.messages[newLength - 1];
    console.log('New message added:', lastMessage);
    if (lastMessage && lastMessage.sender === 'assistant') {
      console.log('New AI message detected, will watch for content updates');
      // We'll handle the content update in the separate watcher below
    }
  }
});

// Watch for changes in the last message content (handles streaming responses)
watch(() => {
  const messages = chat.value?.messages || [];
  const lastMessage = messages[messages.length - 1];
  // Return an object with both content and sender to ensure proper tracking
  return {
    content: lastMessage?.content || '',
    sender: lastMessage?.sender,
    id: lastMessage?.id
  };
}, (newData, oldData) => {
  console.log('Last message data changed:', { 
    newContent: newData.content.substring(0, 50) + '...',
    oldContent: oldData?.content?.substring(0, 50) + '...',
    sender: newData.sender,
    hasContent: !!newData.content
  });
  
  // Update sidebar when AI message content changes and has actual content
  if (newData.sender === 'assistant' && newData.content && newData.content !== oldData?.content) {
    console.log('AI message content updated, updating sidebar');
    updatePromptContent(newData.content);
  }
}, { deep: true });

// Also watch for when typing stops (final update)
watch(() => chatStore.isTyping, (isTyping, wasTyping) => {
  console.log('Typing status changed:', { isTyping, wasTyping });
  scrollToBottom();
  
  // When typing stops, make sure we have the final content in sidebar
  if (wasTyping && !isTyping) {
    const messages = chat.value?.messages || [];
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'assistant' && lastMessage.content) {
      console.log('Typing finished, ensuring sidebar has final content');
      updatePromptContent(lastMessage.content);
    }
  }
});

function updatePromptContent(message: string) {
  console.log('updatePromptContent called with message:', message.substring(0, 100) + '...');
  if (!chat.value) {
    console.log('No chat found, returning');
    return;
  }
  
  // Replace the entire prompt content with just the latest AI response
  const newPromptContent = `${message}`;
  
  console.log('Updating prompt with content:', newPromptContent.substring(0, 100) + '...');
  // Update the prompt in the store (replace, don't append)
  chatStore.updateStory(chatId.value, newPromptContent);
  console.log('Prompt updated successfully');
}

onMounted(() => {
  // Set active chat when component mounts
  chatStore.setActiveChat(chatId.value);
  scrollToBottom();
  
  // Check if there's already an AI message and add it to sidebar
  if (chat.value && chat.value.messages.length > 0) {
    const lastMessage = chat.value.messages[chat.value.messages.length - 1];
    if (lastMessage && lastMessage.sender === 'assistant' && lastMessage.content) {
      console.log('Found existing AI message on mount, adding to sidebar');
      updatePromptContent(lastMessage.content);
    }
  }
  
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
</script>

<template>
  <div v-if="chat" class="chat-view with-sidebar">
    <!-- API Error Notification -->
    <ApiErrorNotification />
    
    <div class="chat-header">
      <h2>{{ chat.title }}</h2>
      <div class="chat-actions">
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
}

.chat-view.with-sidebar {
  padding-right: 350px;
}

.chat-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  z-index: var(--z-sticky);
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-content {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
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
    padding-right: 0; /* Remove sidebar padding on mobile - let sidebar handle its own visibility */
  }

  /* Show mobile sidebar toggle on mobile */
  .mobile-sidebar-toggle {
    display: flex;
  }

  .messages-container {
    padding: var(--space-3) var(--space-2);
  }
  
  .chat-header {
    padding: var(--space-2) var(--space-3);
  }
  
  .chat-header h2 {
    font-size: 1rem;
    max-width: calc(100% - 120px); /* Make room for all buttons */
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
</style>