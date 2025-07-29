<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import StorySidebar from '@/components/sidebar/StorySidebar.vue';
import ChatMessage from '@/components/chat/ChatMessage.vue';
import MessageInput from '@/components/chat/MessageInput.vue';
import TypingIndicator from '@/components/chat/TypingIndicator.vue';
import SystemMessageSender from '@/components/chat/SystemMessageSender.vue';
import ChatHeader from '@/components/chat/ChatHeader.vue';


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

const suggestions = [
  'Create an Agent for hotel management',
  'Fetch data from my API',
  'Collect user email and name at start',
  'Add Carousel for products',
  'Add welcome message with Quick Replies',
  'Update agent logo'
];

function sendSuggestion(suggestion: string) {
  if (!chatId.value) return;
  chatStore.addMessage(chatId.value, suggestion, 'user');
}

onMounted(() => {
  // Set active chat when component mounts
  chatStore.setActiveChat(chatId.value);
  scrollToBottom();
  
});

function toggleSystemMessageModal() {
  showSystemMessageModal.value = !showSystemMessageModal.value;
}


function toggleStorySidebar() {
  showStorySidebar.value = !showStorySidebar.value;
}
</script>

<template>
  <div v-if="chat" class="chat-view" :class="{ 'with-sidebar': showStorySidebar }">
    <!-- API Error Notification -->
    <ChatHeader 
      v-if="chat"
      :chatId="chat.id"
      :title="chat.title"
      :has-prompt-content="hasPromptContent"
      :latest-prompt-content="latestPromptContent"
      @toggle-story-sidebar="toggleStorySidebar"
    />
    
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
          <h1>Start building your AI agent prompt...</h1>
        </div>
        <MessageInput :chatId="chatId" :centered="true" />
        <div class="suggestion-buttons">
          <button v-for="suggestion in suggestions" :key="suggestion" class="suggestion-btn" @click="sendSuggestion(suggestion)">
            {{ suggestion }}
          </button>
        </div>
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
  /* z-index: 1; */
}

.chat-view.with-sidebar {
  padding-right: 400px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
  background-color: var(--color-bg-primary);
  /* border-left: 1px solid rgba(0, 163, 255, 0.1);
  border-right: 1px solid rgba(0, 163, 255, 0.1); */
  /* margin: 0 var(--space-4); */
  /*box-shadow: 0 0 20px rgba(0, 163, 255, 0.06); */
}

.messages-container,
.message-input-container{
  padding-left: 150px;
  padding-right: 150px;
}
.message-input-container.centered{
  padding-left: 10px;
  padding-right: 10px;
}

.chat-view.with-sidebar .messages-container,
.chat-view.with-sidebar .message-input-container{
  padding-left: 30px;
  padding-right: 30px;
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
  
  .message-input-container {
    margin: 0 var(--space-2) var(--space-2);
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
  background-color:var(--color-bg-primary);
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
.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  margin-top: var(--space-4);
}
.suggestion-btn {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: 0.80rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}
.suggestion-btn:hover {
  /* background-color: var(--color-primary);
  color: #fff; */
  border-color: var(--color-text-tertiary);
}
</style>