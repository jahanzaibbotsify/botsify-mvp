import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Chat, Story } from '@/types';

export const useChatListStore = defineStore('chatList', () => {
  // State
  const chats = ref<Chat[]>([]);
  const activeChat = ref<string | null>(null);

  // Getters
  const getActiveChat = computed(() => {
    return chats.value.find(chat => chat.id === activeChat.value) || null;
  });

  const getChatById = computed(() => {
    return (chatId: string): Chat | undefined => {
      return chats.value.find(chat => chat.id === chatId);
    };
  });

  const getChatsCount = computed(() => chats.value.length);

  const getUnreadChatsCount = computed(() => {
    return chats.value.filter(chat => chat.unread).length;
  });

  const getSortedChats = computed(() => {
    return [...chats.value].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  });

  // Actions
  function setActiveChat(chatId: string): void {
    if (chats.value.some(chat => chat.id === chatId)) {
      activeChat.value = chatId;
      localStorage.setItem('botsify_active_chat', chatId);
    }
  }

  function createNewChat(title?: string): Chat {
    const newChat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || `New Chat ${chats.value.length + 1}`,
      timestamp: new Date(),
      messages: [],
      unread: false
    };
    console.log(newChat, "newChat")
    chats.value.unshift(newChat);
    setActiveChat(newChat.id);
    return newChat;
  }

  function updateChatTitle(chatId: string, newTitle: string): boolean {
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) {
      chat.title = newTitle;
      return true;
    }
    return false;
  }

  function updateChatLastMessage(chatId: string, lastMessage: string): boolean {
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessage = lastMessage;
      chat.timestamp = new Date();
      return true;
    }
    return false;
  }

  function deleteChat(chatId: string): boolean {
    const chatIndex = chats.value.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      chats.value.splice(chatIndex, 1);
      
      // If deleted chat was active, set first chat as active
      if (activeChat.value === chatId) {
        activeChat.value = chats.value.length > 0 ? chats.value[0].id : null;
        localStorage.setItem('botsify_active_chat', activeChat.value || '');
      }
      return true;
    }
    return false;
  }

  function clearAllChatsExceptActive(): void {
    if (activeChat.value) {
      chats.value = chats.value.filter(chat => chat.id === activeChat.value);
    } else {
      chats.value = [];
    }
  }

  function markChatAsUnread(chatId: string, unread: boolean = true): boolean {
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) {
      chat.unread = unread;
      return true;
    }
    return false;
  }

  function updateChatStory(chatId: string, story: Story): boolean {
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) {
      chat.story = story;
      return true;
    }
    return false;
  }

  function loadChatsFromStorage(storedChats: any[]): void {
    chats.value = storedChats.map((chat: any) => ({
      ...chat,
      timestamp: new Date(chat.timestamp),
      messages: chat.messages?.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })) || [],
      story: chat.story ? {
        ...chat.story,
        updatedAt: new Date(chat.story.updatedAt),
        versions: chat.story.versions?.map((v: any) => ({
          ...v,
          updatedAt: new Date(v.updatedAt)
        })) || []
      } : undefined
    }));
  }

  function saveChatsToStorage(): any[] {
    return chats.value;
  }

  function restoreActiveChat(): void {
    const storedActiveChat = localStorage.getItem('botsify_active_chat');
    if (storedActiveChat && chats.value.some(c => c.id === storedActiveChat)) {
      activeChat.value = storedActiveChat;
    } else if (chats.value.length > 0) {
      activeChat.value = chats.value[0].id;
    }
  }

  return {
    // State
    chats,
    activeChat,
    
    // Getters
    getActiveChat,
    getChatById,
    getChatsCount,
    getUnreadChatsCount,
    getSortedChats,
    
    // Actions
    setActiveChat,
    createNewChat,
    updateChatTitle,
    updateChatLastMessage,
    deleteChat,
    clearAllChatsExceptActive,
    markChatAsUnread,
    updateChatStory,
    loadChatsFromStorage,
    saveChatsToStorage,
    restoreActiveChat
  };
}); 