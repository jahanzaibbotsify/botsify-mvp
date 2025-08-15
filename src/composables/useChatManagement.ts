import { computed, ref, watch } from 'vue';
import { useChatStore } from '@/stores/chatStore';

export function useChatManagement(chatId: string) {
  const chatStore = useChatStore();
  const chatCache = ref<Map<string, any>>(new Map());

  // Simplified chat creation logic with caching
  const chat = computed(() => {
    // Check cache first
    if (chatCache.value.has(chatId)) {
      return chatCache.value.get(chatId);
    }

    let foundChat = chatStore.chats.find(c => c.id === chatId);
    
    if (!foundChat && chatId) {
      try {
        const newChat = chatStore.createNewChat();
        newChat.id = chatId;
        foundChat = newChat;
      } catch (error) {
        return null;
      }
    }
    
    // Cache the result
    if (foundChat) {
      chatCache.value.set(chatId, foundChat);
    }
    
    return foundChat;
  });

  const latestPromptContent = computed(() => {
    try {
      return chat.value?.story?.content || '';
    } catch (error) {
      console.error('Error getting latest prompt content:', error);
      return '';
    }
  });

  const hasPromptContent = computed(() => {
    try {
      return latestPromptContent.value.trim().length > 0;
    } catch (error) {
      console.error('Error checking prompt content:', error);
      return false;
    }
  });

  const showCenteredInput = computed(() => {
    try {
      // Don't show centered input until we have proper chat data
      if (!chat.value?.messages) return true;
      
      const msgs = chat.value.messages;
      
      // Only show centered input if there are no messages or only one empty message
      // and ensure the message array is properly initialized
      if (!Array.isArray(msgs)) return true;
      
      // Check if messages are still loading (empty array might mean loading)
      if (msgs.length === 0) return true;
      
      // Check if first message is empty or undefined
      if (msgs.length === 1 && (!msgs[0]?.content || msgs[0].content.trim() === '')) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking centered input:', error);
      return true;
    }
  });

  const setActiveChat = () => {
    try {
      chatStore.setActiveChat(chatId);
    } catch (error) {
      console.error('Error setting active chat:', error);
    }
  };

  // Watch for chat changes to update cache
  watch(() => chatStore.chats, (newChats) => {
    const currentChat = newChats.find(c => c.id === chatId);
    if (currentChat) {
      chatCache.value.set(chatId, currentChat);
    }
  }, { deep: true });

  // Clear cache when chatId changes
  watch(() => chatId, () => {
    chatCache.value.clear();
  });

  // Utility functions
  const clearCache = () => {
    chatCache.value.clear();
  };

  const refreshChat = () => {
    chatCache.value.delete(chatId);
    return chat.value;
  };

  return {
    chat,
    latestPromptContent,
    hasPromptContent,
    showCenteredInput,
    setActiveChat,
    clearCache,
    refreshChat
  };
}
