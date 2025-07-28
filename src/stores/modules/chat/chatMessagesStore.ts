import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Message, Attachment } from '@/types';

export const useChatMessagesStore = defineStore('chatMessages', () => {
  // State
  const messages = ref<Map<string, Message[]>>(new Map());
  const isTyping = ref(false);
  const isAIPromptGenerating = ref(false);

  // Getters
  const getMessagesForChat = computed(() => {
    return (chatId: string): Message[] => {
      return messages.value.get(chatId) || [];
    };
  });

  const getLastMessage = computed(() => {
    return (chatId: string): Message | null => {
      const chatMessages = messages.value.get(chatId);
      return chatMessages && chatMessages.length > 0 
        ? chatMessages[chatMessages.length - 1] 
        : null;
    };
  });

  const getMessageCount = computed(() => {
    return (chatId: string): number => {
      return messages.value.get(chatId)?.length || 0;
    };
  });

  // Actions
  function addMessage(chatId: string, content: string, sender: 'user' | 'assistant', attachments?: Attachment[]): Message {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      timestamp: new Date(),
      sender,
      status: 'sent',
      attachments: attachments || []
    };

    if (!messages.value.has(chatId)) {
      messages.value.set(chatId, []);
    }

    messages.value.get(chatId)!.push(message);
    return message;
  }

  function updateMessage(messageId: string, content: string): boolean {
    for (const chatMessages of messages.value.values()) {
      const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        chatMessages[messageIndex].content = content;
        chatMessages[messageIndex].timestamp = new Date();
        return true;
      }
    }
    return false;
  }

  function removeLastMessage(chatId: string): boolean {
    const chatMessages = messages.value.get(chatId);
    if (chatMessages && chatMessages.length > 0) {
      chatMessages.pop();
      return true;
    }
    return false;
  }

  function clearMessages(chatId: string): void {
    messages.value.set(chatId, []);
  }

  function setTypingStatus(status: boolean): void {
    isTyping.value = status;
  }

  function setAIPromptGeneratingStatus(status: boolean): void {
    isAIPromptGenerating.value = status;
  }

  function loadMessagesFromStorage(chatId: string, storedMessages: any[]): void {
    const parsedMessages = storedMessages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
    messages.value.set(chatId, parsedMessages);
  }

  function saveMessagesToStorage(chatId: string): any[] {
    return messages.value.get(chatId) || [];
  }

  return {
    // State
    messages,
    isTyping,
    isAIPromptGenerating,
    
    // Getters
    getMessagesForChat,
    getLastMessage,
    getMessageCount,
    
    // Actions
    addMessage,
    updateMessage,
    removeLastMessage,
    clearMessages,
    setTypingStatus,
    setAIPromptGeneratingStatus,
    loadMessagesFromStorage,
    saveMessagesToStorage
  };
}); 