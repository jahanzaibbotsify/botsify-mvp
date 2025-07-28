import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useOpenAIStore } from './openaiStore';
import { useMCPStore } from './mcpStore';
import { useRoleStore } from './roleStore';
import { botsifyApi } from '@/services/botsifyApi';
import { useApiKeyStore } from './apiKeyStore';
import { STANDARD_ERROR_MESSAGE } from '@/utils/errorHandler';
import type { Chat, Message, Attachment } from '@/types';
import type { ChatMessage } from '@/types/openai';

export const useChatStore = defineStore('chat', () => {
  // State
  const chats = ref<Chat[]>([]);
  const activeChat = ref<string | null>(null);
  const messages = ref<Map<string, Message[]>>(new Map());
  const isTyping = ref(false);
  const isAIPromptGenerating = ref(false);
  const globalPromptTemplates = ref<any[]>([]);
  const storyVersions = ref<Map<string, any[]>>(new Map());

  // Import other stores
  const openAIStore = useOpenAIStore();
  const mcpStore = useMCPStore();
  const roleStore = useRoleStore();
  const apiKeyStore = useApiKeyStore();

  // Getters
  const getActiveChat = computed(() => {
    return chats.value.find(chat => chat.id === activeChat.value) || null;
  });

  const activeChatMessages = computed(() => {
    const activeChatId = activeChat.value;
    return activeChatId ? messages.value.get(activeChatId) || [] : [];
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

    chats.value.unshift(newChat);
    setActiveChat(newChat.id);
    return newChat;
  }

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
    
    // Update chat's last message
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessage = content;
      chat.timestamp = new Date();
    }
    
    return message;
  }

  function removeLastMessage(chatId: string): boolean {
    const chatMessages = messages.value.get(chatId);
    if (chatMessages && chatMessages.length > 0) {
      chatMessages.pop();
      return true;
    }
    return false;
  }

  function setTypingStatus(status: boolean): void {
    isTyping.value = status;
  }

  function setAIPromptGeneratingStatus(status: boolean): void {
    isAIPromptGenerating.value = status;
  }

  async function handleAIResponse(chat: Chat): Promise<void> {
    if (!chat.id) {
      console.error('❌ Chat ID is required for AI response');
      return;
    }

    // Check if editor is trying to use MCP servers
    if (roleStore.isEditor) {
      const hasBotsifyMCPServer = mcpStore.connectedServers.some(server =>
        server.connectionUrl === "https://mcp.botsify.com/mcp"
      );
      if (hasBotsifyMCPServer) {
        console.log('❌ Editor attempted to use MCP server, blocking request');
        await addMessage(chat.id, "Error: You are not allowed to send this request", 'assistant');
        setTypingStatus(false);
        return;
      }
    }

    try {
      setTypingStatus(true);
      
      // Get connected services JSON
      const connectedServicesJson = await getConnectedServicesJson(chat.id);
      
      // Convert Message[] to ChatMessage[] format
      const chatMessages: ChatMessage[] = activeChatMessages.value.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Stream AI response
      const response = await openAIStore.streamChat(chatMessages);

      if (response.success) {
        // Parse dual response
        const { chatResponse, aiPrompt } = parseDualResponse(response.data || '');
        
        if (chatResponse) {
          await addMessage(chat.id, chatResponse, 'assistant');
        }
        
        if (aiPrompt) {
          // Update story with new AI prompt
          addVersionToChat(chat.id, aiPrompt, true);
          
          // Save to template
          await saveToTemplate();
        }
      } else {
        throw new Error(response.error || STANDARD_ERROR_MESSAGE);
      }
    } catch (error: any) {
      console.error('❌ Error in handleAIResponse:', error);
      await addMessage(chat.id, STANDARD_ERROR_MESSAGE, 'assistant');
    } finally {
      setTypingStatus(false);
    }
  }

  async function saveToTemplate(): Promise<boolean> {
    try {
      const activeChatId = activeChat.value;
      if (!activeChatId) return false;

      const chatMessages = messages.value.get(activeChatId);
      if (!chatMessages || chatMessages.length === 0) return false;

      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage.sender !== 'assistant') return false;

      const response = await botsifyApi.saveToTemplate(lastMessage.content);
      return response.success;
    } catch (error) {
      console.error('❌ Error saving to template:', error);
      return false;
    }
  }

  function parseDualResponse(content: string): { chatResponse: string | null; aiPrompt: string | null } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      
      if (parsed.chatResponse && parsed.aiPrompt) {
        return {
          chatResponse: parsed.chatResponse,
          aiPrompt: parsed.aiPrompt
        };
      }
    } catch (error) {
      // If parsing fails, it's not a JSON message, so don't skip
    }

    // If not JSON or doesn't have expected structure, treat as regular chat response
    return {
      chatResponse: content,
      aiPrompt: null
    };
  }

  async function getConnectedServicesJson(chatId: string): Promise<string | null> {
    try {
      const connectedServers = mcpStore.connectedServers;
      if (connectedServers.length === 0) return null;

      const servicesData = connectedServers.map(server => ({
        name: server.name,
        description: server.description,
        connectionUrl: server.connectionUrl,
        capabilities: server.capabilities
      }));

      return JSON.stringify(servicesData);
    } catch (error) {
      console.error('❌ Error getting connected services JSON:', error);
      return null;
    }
  }

  function addVersionToChat(chatId: string, content: string, isActive: boolean = false): void {
    if (!storyVersions.value.has(chatId)) {
      storyVersions.value.set(chatId, []);
    }

    const versions = storyVersions.value.get(chatId)!;
    const newVersion = {
      id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      timestamp: new Date(),
      isActive
    };

    versions.push(newVersion);
  }

  function getActiveVersionForChat(chatId: string): any | null {
    const versions = storyVersions.value.get(chatId);
    if (!versions || versions.length === 0) return null;
    return versions.find(v => v.isActive) || versions[versions.length - 1];
  }

  function loadChatsFromStorage(storedChats: any[]): void {
    const parsedChats = storedChats.map((chat: any) => ({
      ...chat,
      timestamp: new Date(chat.timestamp)
    }));
    chats.value = parsedChats;
  }

  function loadMessagesFromStorage(chatId: string, storedMessages: any[]): void {
    const parsedMessages = storedMessages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
    messages.value.set(chatId, parsedMessages);
  }

  function loadTemplatesFromStorage(storedTemplates: any[]): void {
    globalPromptTemplates.value = storedTemplates;
  }

  function loadVersionsFromStorage(storedVersions: any[]): void {
    const versionsMap = new Map();
    storedVersions.forEach((version: any) => {
      if (!versionsMap.has(version.chatId)) {
        versionsMap.set(version.chatId, []);
      }
      versionsMap.get(version.chatId).push({
        ...version,
        timestamp: new Date(version.timestamp)
      });
    });
    storyVersions.value = versionsMap;
  }

  function saveChatsToStorage(): any[] {
    return chats.value;
  }

  function saveMessagesToStorage(chatId: string): any[] {
    return messages.value.get(chatId) || [];
  }

  function saveTemplatesToStorage(): any[] {
    return globalPromptTemplates.value;
  }

  function saveVersionsToStorage(): any[] {
    const versions: any[] = [];
    storyVersions.value.forEach((chatVersions, chatId) => {
      chatVersions.forEach((version: any) => {
        versions.push({
          ...version,
          chatId
        });
      });
    });
    return versions;
  }

  function restoreActiveChat(): void {
    const storedActiveChat = localStorage.getItem('botsify_active_chat');
    if (storedActiveChat && chats.value.some(chat => chat.id === storedActiveChat)) {
      activeChat.value = storedActiveChat;
    }
  }

  return {
    // State
    chats,
    activeChat,
    messages,
    isTyping,
    isAIPromptGenerating,
    globalPromptTemplates,
    storyVersions,
    
    // Getters
    getActiveChat,
    activeChatMessages,
    getChatsCount,
    getUnreadChatsCount,
    getSortedChats,
    
    // Actions
    setActiveChat,
    createNewChat,
    addMessage,
    removeLastMessage,
    setTypingStatus,
    setAIPromptGeneratingStatus,
    handleAIResponse,
    saveToTemplate,
    parseDualResponse,
    getConnectedServicesJson,
    addVersionToChat,
    getActiveVersionForChat,
    loadChatsFromStorage,
    loadMessagesFromStorage,
    loadTemplatesFromStorage,
    loadVersionsFromStorage,
    saveChatsToStorage,
    saveMessagesToStorage,
    saveTemplatesToStorage,
    saveVersionsToStorage,
    restoreActiveChat
  };
}); 