import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useChatMessagesStore } from './chatMessagesStore';
import { useChatListStore } from './chatListStore';
import { usePromptTemplatesStore } from './promptTemplatesStore';
import { useOpenAIStore } from '../../openaiStore';
import { useMCPStore } from '../../mcpStore';
import { useRoleStore } from '../../roleStore';
import { botsifyApi } from '@/services/botsifyApi';
import { useApiKeyStore } from '../../apiKeyStore';
import { STANDARD_ERROR_MESSAGE } from '@/utils/errorHandler';
import type { Chat, Message, Attachment } from '@/types';
import type { ChatMessage } from '@/types/openai';

export const useChatStore = defineStore('chat', () => {
  // Import smaller store modules
  const messagesStore = useChatMessagesStore();
  const chatListStore = useChatListStore();
  const templatesStore = usePromptTemplatesStore();
  const openAIStore = useOpenAIStore();
  const mcpStore = useMCPStore();
  const roleStore = useRoleStore();
  const apiKeyStore = useApiKeyStore();

  // Computed properties that combine data from multiple stores
  const activeChat = computed(() => chatListStore.getActiveChat);
  
  const activeChatMessages = computed(() => {
    const activeChatId = chatListStore.activeChat;
    return activeChatId ? messagesStore.getMessagesForChat(activeChatId) : [];
  });

  const isTyping = computed(() => messagesStore.isTyping);
  const isAIPromptGenerating = computed(() => messagesStore.isAIPromptGenerating);

  // Unified actions that coordinate between stores
  async function addMessage(chatId: string, content: string, sender: 'user' | 'assistant', attachments?: Attachment[]): Promise<Message> {
    const message = messagesStore.addMessage(chatId, content, sender, attachments);
    
    // Update chat's last message
    chatListStore.updateChatLastMessage(chatId, content);
    
    return message;
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
        messagesStore.setTypingStatus(false);
        return;
      }
    }

    try {
      messagesStore.setTypingStatus(true);
      
      // Get connected services JSON
      const connectedServicesJson = await getConnectedServicesJson(chat.id);
      
      // Get active story content
      const activeVersion = templatesStore.getActiveVersionForChat(chat.id);
      const storyContent = activeVersion?.content || '';
      
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
          templatesStore.addVersionToChat(chat.id, aiPrompt, true);
          
          // Save to template
          await saveToTemplate();
        }
      } else {
        throw new Error(response.error || STANDARD_ERROR_MESSAGE);
      }
    } catch (error: any) {
      console.error('❌ AI Response Error:', error);
      const errorMessage = error.message || STANDARD_ERROR_MESSAGE;
      await addMessage(chat.id, errorMessage, 'assistant');
    } finally {
      messagesStore.setTypingStatus(false);
    }
  }

  async function saveToTemplate(): Promise<boolean> {
    try {
      const activeChatId = chatListStore.activeChat;
      if (!activeChatId) return false;

      const activeVersion = templatesStore.getActiveVersionForChat(activeChatId);
      if (!activeVersion) return false;

      const response = await botsifyApi.deployAiAgent(activeVersion.content);
      return response.success;
    } catch (error) {
      console.error('❌ Failed to save template:', error);
      return false;
    }
  }

  function parseDualResponse(content: string): { chatResponse: string | null; aiPrompt: string | null } {
    try {
      // Check if content contains dual response markers
      if (content.includes('===CHAT_RESPONSE===') && content.includes('===AI_PROMPT===')) {
        const chatMatch = content.match(/===CHAT_RESPONSE===\s*([\s\S]*?)\s*===AI_PROMPT===/);
        const promptMatch = content.match(/===AI_PROMPT===\s*([\s\S]*?)(?:\s*===|$)/);
        
        const chatResponse = chatMatch ? chatMatch[1].trim() : null;
        const aiPrompt = promptMatch ? promptMatch[1].trim() : null;
        
        return { chatResponse, aiPrompt };
      }
      
      // If no markers, treat entire content as chat response
      return { chatResponse: content, aiPrompt: null };
    } catch (error) {
      console.error('❌ Error parsing dual response:', error);
      return { chatResponse: content, aiPrompt: null };
    }
  }

  async function getConnectedServicesJson(chatId: string): Promise<string | null> {
    try {
      const connectedServers = mcpStore.connectedServers;
      if (connectedServers.length === 0) return null;

      const servicesData = connectedServers.map(server => ({
        server_label: server.name,
        server_url: server.connectionUrl,
        allowed_tools: server.features || [],
        require_approval: "never"
      }));

      return JSON.stringify(servicesData);
    } catch (error) {
      console.error('❌ Error generating connected services JSON:', error);
      return null;
    }
  }

  // Expose all store functionality through a unified interface
  return {
    // State from composed stores
    chats: chatListStore.chats,
    activeChat,
    messages: messagesStore.messages,
    isTyping,
    isAIPromptGenerating,
    globalPromptTemplates: templatesStore.globalPromptTemplates,
    
    // Getters from composed stores
    getActiveChat: chatListStore.getActiveChat,
    getChatById: chatListStore.getChatById,
    getChatsCount: chatListStore.getChatsCount,
    getUnreadChatsCount: chatListStore.getUnreadChatsCount,
    getSortedChats: chatListStore.getSortedChats,
    getMessagesForChat: messagesStore.getMessagesForChat,
    getLastMessage: messagesStore.getLastMessage,
    getMessageCount: messagesStore.getMessageCount,
    getGlobalTemplates: templatesStore.getGlobalTemplates,
    getDefaultTemplate: templatesStore.getDefaultTemplate,
    getTemplateById: templatesStore.getTemplateById,
    getVersionsForChat: templatesStore.getVersionsForChat,
    getActiveVersionForChat: templatesStore.getActiveVersionForChat,
    
    // Computed properties
    activeChatMessages,
    
    // Actions from composed stores
    setActiveChat: chatListStore.setActiveChat,
    createNewChat: chatListStore.createNewChat,
    updateChatTitle: chatListStore.updateChatTitle,
    updateChatLastMessage: chatListStore.updateChatLastMessage,
    deleteChat: chatListStore.deleteChat,
    clearAllChatsExceptActive: chatListStore.clearAllChatsExceptActive,
    markChatAsUnread: chatListStore.markChatAsUnread,
    updateChatStory: chatListStore.updateChatStory,
    loadChatsFromStorage: chatListStore.loadChatsFromStorage,
    saveChatsToStorage: chatListStore.saveChatsToStorage,
    restoreActiveChat: chatListStore.restoreActiveChat,
    
    addMessage: messagesStore.addMessage,
    updateMessage: messagesStore.updateMessage,
    removeLastMessage: messagesStore.removeLastMessage,
    clearMessages: messagesStore.clearMessages,
    setTypingStatus: messagesStore.setTypingStatus,
    setAIPromptGeneratingStatus: messagesStore.setAIPromptGeneratingStatus,
    loadMessagesFromStorage: messagesStore.loadMessagesFromStorage,
    saveMessagesToStorage: messagesStore.saveMessagesToStorage,
    
    createPromptVersion: templatesStore.createPromptVersion,
    addVersionToChat: templatesStore.addVersionToChat,
    revertToPromptVersion: templatesStore.revertToPromptVersion,
    deletePromptVersion: templatesStore.deletePromptVersion,
    clearVersionHistory: templatesStore.clearVersionHistory,
    createGlobalPromptTemplate: templatesStore.createGlobalPromptTemplate,
    updateGlobalPromptTemplate: templatesStore.updateGlobalPromptTemplate,
    deleteGlobalPromptTemplate: templatesStore.deleteGlobalPromptTemplate,
    loadTemplatesFromStorage: templatesStore.loadTemplatesFromStorage,
    saveTemplatesToStorage: templatesStore.saveTemplatesToStorage,
    loadVersionsFromStorage: templatesStore.loadVersionsFromStorage,
    saveVersionsToStorage: templatesStore.saveVersionsToStorage,
    
    // Unified actions
    handleAIResponse,
    saveToTemplate,
    parseDualResponse,
    getConnectedServicesJson
  };
}); 