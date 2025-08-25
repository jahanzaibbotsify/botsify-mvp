<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import StorySidebar from '@/components/sidebar/StorySidebar.vue';
import ChatMessage from '@/components/chat/ChatMessage.vue';
import MessageInput from '@/components/chat/MessageInput.vue';
import TypingIndicator from '@/components/chat/TypingIndicator.vue';
import SystemMessageSender from '@/components/chat/SystemMessageSender.vue';
import ChatHeader from '@/components/chat/ChatHeader.vue';
import { useChatScroll } from '@/composables/useChatScroll';
import { useChatSuggestions } from '@/composables/useChatSuggestions';
import { useChatManagement } from '@/composables/useChatManagement';

const route = useRoute();
const chatStore = useChatStore();

const chatId = route.params.id as string;
const storySidebar = ref<InstanceType<typeof StorySidebar> | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const showSystemMessageModal = ref(false);
const showStorySidebar = ref(false);

// Use the chat management composable
const {
  chat,
  latestPromptContent,
  hasPromptContent,
  showCenteredInput,
  setActiveChat
} = useChatManagement(chatId);

// Use the chat scroll composable
const { scrollToBottom } = useChatScroll(
  messagesContainer,
  computed(() => chat.value?.messages || []),
  computed(() => chatStore.isTyping)
);

// Use the chat suggestions composable
const { suggestions, sendSuggestion } = useChatSuggestions(chatId);

onMounted(async () => {
  setActiveChat();
  await nextTick();
  scrollToBottom();
});

const toggleSystemMessageModal = () => {
  showSystemMessageModal.value = !showSystemMessageModal.value;
};

const toggleStorySidebar = () => {
  showStorySidebar.value = !showStorySidebar.value;
};
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
        <MessageInput :chatId="chatId" :centered="true" :has-prompt-content="hasPromptContent" />
        <div class="suggestion-buttons">
          <button 
            v-for="suggestion in suggestions" 
            :key="suggestion" 
            class="suggestion-btn" 
            @click="sendSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Bottom MessageInput if there are real messages -->
    <MessageInput v-if="!showCenteredInput" :chatId="chatId" :has-prompt-content="hasPromptContent" />
    
    <!-- Story Sidebar - Only show when enabled -->
    <StorySidebar 
      v-if="showStorySidebar" 
      ref="storySidebar" 
      :chatId="chatId"
      @toggle-story-sidebar="toggleStorySidebar" 
    />

    <!-- System Message Modal -->
    <div v-if="showSystemMessageModal" class="modal-overlay" @click.self="toggleSystemMessageModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>System Message</h3>
          <button class="close-button" @click="toggleSystemMessageModal">
            <i class="pi pi-times" style="font-size: 16px;"></i>
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
  transition: padding-right var(--transition-normal);
  position: relative;
}

.chat-view.with-sidebar {
  padding-right: 400px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
  background-color: var(--color-bg-primary);
}

.messages-container,
.message-input-container {
  padding-left: var(--space-8);
  padding-right: var(--space-8);
}

.message-input-container.centered {
  padding-left: var(--space-2);
  padding-right: var(--space-2);
}

.chat-view.with-sidebar .messages-container,
.chat-view.with-sidebar .message-input-container {
  padding-left: var(--space-4);
  padding-right: var(--space-4);
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

.centered-message-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 75vh;
  width: 100%;
  padding: 0;
  background-color: var(--color-bg-primary);
  padding-top: calc(30vh - 150px);
}

.centered-message-input > * {
  width: 100%;
  max-width: 100%;
}

.centered-heading {
  width: 100%;
  text-align: center;
  margin-bottom: var(--space-2);
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  margin-top: var(--space-4);
}

/* Mobile styles */
@media (max-width: 767px) {
  .chat-view.with-sidebar {
    padding-right: 0;
  }

  .messages-container {
    padding: var(--space-3) var(--space-2);
    margin: 0 var(--space-2);
  }
  
  .message-input-container {
    margin: 0 var(--space-2) var(--space-2);
  }
  
  .messages-container,
  .message-input-container {
    padding-left: var(--space-2);
    padding-right: var(--space-2);
  }
}

/* Small mobile devices */
@media (max-width: 480px) {
  .messages-container {
    padding: var(--space-2) var(--space-1);
  }
  
  .messages-container,
  .message-input-container {
    padding-left: var(--space-1);
    padding-right: var(--space-1);
  }
}
</style>