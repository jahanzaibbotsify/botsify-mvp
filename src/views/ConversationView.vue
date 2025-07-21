<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const activeUserTab = ref('profile')
const newMessage = ref('')

// Computed properties
const satisfactionPercentage = computed(() => {
  return conversationStore.selectedConversation?.satisfaction || 25
})

// Methods
const sendMessage = async (message: string, fileUrls?: string[]) => {
  if (!message.trim()) return
  await conversationStore.sendMessage(message, fileUrls)
  newMessage.value = ''
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

      <!-- Main Chat Area -->
      <div class="chat-main">
        <!-- Chat Header -->
        <ChatHeader 
          :user-name="conversationStore.selectedConversation?.title"
          :user-id="conversationStore.selectedConversation?.fbid"
          :loading="conversationStore.loading"
        />

        <!-- Chat Messages Area -->
        <ChatMessages 
          :has-selected-conversation="!!conversationStore.selectedConversation"
          :messages="conversationStore.messages"
          :loading="conversationStore.loading"
          :error="conversationStore.error"
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
      <UserSidebar 
        :user="conversationStore.selectedConversation"
        :active-tab="activeUserTab"
        :satisfaction-percentage="satisfactionPercentage"
        :loading="conversationStore.loading"
        @update:active-tab="activeUserTab = $event"
      />
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
}
</style>
