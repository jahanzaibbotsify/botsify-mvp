<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConversationStore } from '@/stores/conversationStore'
import {
  ConversationSidebar,
  ChatHeader,
  ChatMessages,
  MessageInput,
  UserSidebar
} from '@/components/conversation'


const route = useRoute()
const conversationStore = useConversationStore()

// Local state
const newMessage = ref('')
const selectedLanguage = ref('en')

// Methods
const sendMessage = async (message: string, fileUrls?: string[]) => {
  if (!message.trim()) return
  await conversationStore.sendMessage(message, fileUrls)
  newMessage.value = ''
}

const handleTranslateLanguage = (lang: string) => {
  selectedLanguage.value = lang
  // Translation logic will be added in next step
}

// Lifecycle
onMounted(async () => {
  // Set API key from route
  const chatId = route.params.id as string
  // Fetch conversations from API
  await conversationStore.fetchConversations(false, chatId)

  // Select first conversation by default if available
  if (conversationStore.conversations.length > 0) {
    await conversationStore.selectConversation(conversationStore.conversations[0])
  }
})
</script>

<template>
  <div class="conversation-view">
    <!-- Main Conversation Area -->
    <div class="conversation-content">
      <!-- Left Sidebar - Conversation List -->
      <ConversationSidebar 
        :search-query="conversationStore.searchQuery"
        :active-filter="conversationStore.activeFilter"
        :active-tab="conversationStore.activeTab"
        :read-filter="conversationStore.readFilter"
        :chat-type-filter="conversationStore.chatTypeFilter"
        :sort-order="conversationStore.sortOrder"
        :conversations="conversationStore.filteredConversations"
        :selected-conversation="conversationStore.selectedConversation"
        :loading="conversationStore.loading"
        :error="conversationStore.error"
        :is-loading-more="conversationStore.isLoadingMore"
        @update:search-query="conversationStore.setSearchQuery"
        @update:active-filter="conversationStore.setActiveFilter"
        @update:active-tab="conversationStore.setActiveTab"
        @update:read-filter="conversationStore.setReadFilter"
        @update:chat-type-filter="conversationStore.setChatTypeFilter"
        @update:sort-order="conversationStore.setSortOrder"
        @select-conversation="conversationStore.selectConversation"
        @load-more-conversations="conversationStore.loadMoreConversations"
        @retry="conversationStore.fetchConversations"
      />

      <!-- No Conversation Selected - Only show when not loading and no conversation selected -->
    <div 
      v-if="!conversationStore.selectedConversation" 
      class="no-conversation"
    >
      <div class="no-conversation-content">
        <div class="no-conversation-icon">💬</div>
        <h3>No Conversation Selected</h3>
        <p>Select a conversation from the sidebar to start chatting.</p>
      </div>
    </div>

    <template v-else>
      <!-- Main Chat Area -->
      <div class="chat-main">
        <!-- Chat Header -->
        <ChatHeader 
          :loading="conversationStore.loading"
          @translate-language="handleTranslateLanguage"
        />

        <!-- Chat Messages Area -->
        <ChatMessages 
          :messages="conversationStore.messages"
          :loading="conversationStore.loading"
          :error="conversationStore.error"
          :selected-language="selectedLanguage"
          @retry="conversationStore.fetchUserConversation(conversationStore.selectedConversation?.fbid || '')"
        />

        <!-- Message Input -->
        <MessageInput 
          :chat-id="conversationStore.selectedConversation?.id || ''"
          :message="newMessage"
          :loading="conversationStore.loading"
          @update:message="newMessage = $event"
          @send="sendMessage"
        />
      </div>

      <!-- Right Sidebar - User Details -->
      <UserSidebar :loading="conversationStore.loading" />
    </template>
    </div>
  </div>
</template>

<style scoped>
.conversation-view {
  height: 100vh;
  background-color: var(--color-bg-primary);
  display: flex;
  flex-direction: column;
}



.conversation-content {
  display: flex;
  flex: 1;
  height: 100%;
  background-color: var(--color-bg-primary);
  overflow: hidden;
}

/* Main Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  min-width: 0; /* Allow flex item to shrink below content size */
}


.no-conversation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.no-conversation-content {
  text-align: center;
  max-width: 400px;
}

.no-conversation-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.no-conversation-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.no-conversation-content p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .conversation-content {
    flex-direction: column;
  }
  
  .chat-main {
    flex: 1;
    border-left: none;
    border-right: none;
    border-top: 1px solid var(--color-border);
  }
}

@media (max-width: 768px) {
  .conversation-view {
    height: 100vh;
  }
  
  .conversation-content {
    height: 100%;
  }

  .no-conversation {
    padding: var(--space-4);
  }
  
  .no-conversation-icon {
    font-size: 3rem;
  }
}
</style>
