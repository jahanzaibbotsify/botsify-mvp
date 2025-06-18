import { defineStore } from 'pinia';
import { ref, computed, nextTick, watch } from 'vue';
import { useOpenAIStore } from './openaiStore';
import { useMCPStore } from './mcpStore';
import type { Chat, Message, Attachment, PromptVersion, GlobalPromptTemplate } from '../types';

export const useChatStore = defineStore('chat', () => {
  const openAIStore = useOpenAIStore();
  const mcpStore = useMCPStore();
  const chats = ref<Chat[]>([]);
  const activeChat = ref<string | null>(null);
  const isTyping = ref(false);
  const globalPromptTemplates = ref<GlobalPromptTemplate[]>([]);

  // Load data from localStorage on initialization
  function loadFromStorage() {
    try {
      console.log('🔍 Attempting to load data from localStorage');
      const storedChats = localStorage.getItem('botsify_chats');
      const storedTemplates = localStorage.getItem('botsify_prompt_templates');
      const storedActiveChat = localStorage.getItem('botsify_active_chat');

      console.log('📊 Storage check:', { 
        hasStoredChats: !!storedChats, 
        hasStoredTemplates: !!storedTemplates,
        hasStoredActiveChat: !!storedActiveChat 
      });

      if (storedChats) {
        try {
          const parsedChats = JSON.parse(storedChats);
          // Convert date strings back to Date objects
          chats.value = parsedChats.map((chat: any) => ({
            ...chat,
            timestamp: new Date(chat.timestamp),
            messages: chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })),
            story: chat.story ? {
              ...chat.story,
              updatedAt: new Date(chat.story.updatedAt),
              versions: chat.story.versions?.map((v: any) => ({
                ...v,
                updatedAt: new Date(v.updatedAt)
              })) || []
            } : undefined
          }));
          console.log('✅ Loaded chats from storage:', chats.value.length);
        } catch (jsonError) {
          console.error('❌ Failed to parse stored chats JSON:', jsonError);
          // Clear corrupted data
          localStorage.removeItem('botsify_chats');
        }
      } else {
        console.warn('⚠️ No chats found in localStorage');
      }

      if (storedTemplates) {
        try {
          const parsedTemplates = JSON.parse(storedTemplates);
          globalPromptTemplates.value = parsedTemplates.map((template: any) => ({
            ...template,
            createdAt: new Date(template.createdAt),
            updatedAt: new Date(template.updatedAt)
          }));
          console.log('✅ Loaded prompt templates from storage:', globalPromptTemplates.value.length);
        } catch (jsonError) {
          console.error('❌ Failed to parse stored templates JSON:', jsonError);
          // Clear corrupted data
          localStorage.removeItem('botsify_prompt_templates');
        }
      } else {
        console.warn('⚠️ No templates found in localStorage');
      }

      if (storedActiveChat && chats.value.some(c => c.id === storedActiveChat)) {
        activeChat.value = storedActiveChat;
        console.log('✅ Restored active chat:', storedActiveChat);
      } else if (storedActiveChat) {
        console.warn('⚠️ Stored active chat ID not found in loaded chats:', storedActiveChat);
      }
    } catch (error) {
      console.error('❌ Error loading from storage:', error);
    }
  }

  // Save data to localStorage
  function saveToStorage() {
    try {
      console.log('💾 Saving data to localStorage', { 
        chatsCount: chats.value.length,
        templatesCount: globalPromptTemplates.value.length,
        activeChat: activeChat.value
      });
      
      const chatsJson = JSON.stringify(chats.value);
      const templatesJson = JSON.stringify(globalPromptTemplates.value);
      
      // Check size before saving to prevent quota errors
      const totalSize = chatsJson.length + templatesJson.length;
      const estimatedSizeInMB = totalSize / (1024 * 1024);
      console.log(`📊 Estimated storage size: ${estimatedSizeInMB.toFixed(2)}MB`);
      
      // localStorage typically has a 5-10MB limit depending on browser
      if (estimatedSizeInMB > 4.5) {
        console.warn('⚠️ Data size approaching localStorage limit. Consider clearing old chats.');
        
        // If size is critical, try to save only essential data
        if (estimatedSizeInMB > 4.8) {
          console.error('❌ Data too large for localStorage! Attempting to save only active chat.');
          
          // Try to save only the active chat
          if (activeChat.value) {
            const activeChatsOnly = chats.value.filter(c => c.id === activeChat.value);
            if (activeChatsOnly.length > 0) {
              const reducedChatsJson = JSON.stringify(activeChatsOnly);
              localStorage.setItem('botsify_chats', reducedChatsJson);
              localStorage.setItem('botsify_prompt_templates', templatesJson);
              localStorage.setItem('botsify_active_chat', activeChat.value);
              console.log('✅ Saved only active chat to prevent data loss');
              return true;
            }
          }
          return false;
        }
      }
      
      localStorage.setItem('botsify_chats', chatsJson);
      localStorage.setItem('botsify_prompt_templates', templatesJson);
      if (activeChat.value) {
        localStorage.setItem('botsify_active_chat', activeChat.value);
      }
      
      // Verify storage was successful
      const storedChats = localStorage.getItem('botsify_chats');
      const storedTemplates = localStorage.getItem('botsify_prompt_templates');
      const storedActiveChat = localStorage.getItem('botsify_active_chat');
      
      console.log('✅ Storage verification:', { 
        chatsStored: !!storedChats && storedChats === chatsJson,
        templatesStored: !!storedTemplates && storedTemplates === templatesJson,
        activeChatStored: !activeChat.value || (!!storedActiveChat && storedActiveChat === activeChat.value)
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error saving to storage:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('💾 localStorage quota exceeded. Data too large to store.');
        
        // Try to save only the active chat as a fallback
        try {
          if (activeChat.value) {
            const activeChatsOnly = chats.value.filter(c => c.id === activeChat.value);
            if (activeChatsOnly.length > 0) {
              localStorage.setItem('botsify_chats', JSON.stringify(activeChatsOnly));
              localStorage.setItem('botsify_active_chat', activeChat.value);
              console.log('✅ Fallback: Saved only active chat');
              return true;
            }
          }
        } catch (fallbackError) {
          console.error('❌ Fallback save failed:', fallbackError);
        }
      }
      return false;
    }
  }
  
  // Force immediate save - can be called at critical points
  function forceSave() {
    console.log('🔄 Force saving data to storage');
    return saveToStorage();
  }

  // Watch for changes and auto-save
  watch([chats, globalPromptTemplates, activeChat], () => {
    console.log('🔄 Data changed, triggering save');
    saveToStorage();
  }, { deep: true });
  
  // Add window event listeners to ensure data is saved before page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      console.log('📝 Page unloading, saving data');
      forceSave();
    });
    
    // Also save when tab visibility changes (user switches tabs)
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.log('📝 Tab hidden, saving data');
        forceSave();
      }
    });
  }

  const currentChat = computed(() => {
    return chats.value.find(chat => chat.id === activeChat.value) || null;
  });

  const defaultPromptTemplate = computed(() => {
    return globalPromptTemplates.value.find(t => t.isDefault) || null;
  });

  function setActiveChat(chatId: string) {
    console.log('Setting active chat:', chatId);
    activeChat.value = chatId;
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) {
      chat.unread = false;
    } else {
      console.warn('Chat not found with ID:', chatId);
    }
  }

  async function addMessage(chatId: string, content: string, sender: 'user' | 'assistant', attachments?: Attachment[]) {
    console.log(`Adding ${sender} message to chat ${chatId}:`, content);
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat) {
      console.error('Chat not found with ID:', chatId);
      return null;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      sender,
      attachments
    };

    chat.messages.push(newMessage);
    chat.lastMessage = content;
    chat.timestamp = new Date();

    // Only trigger AI response for user messages when connected
    if (sender === 'user' && openAIStore.connected) {
      console.log('Triggering AI response');
      await handleAIResponse(chat);
    } else if (sender === 'user' && !openAIStore.connected) {
      console.warn('OpenAI not connected, skipping AI response');
      // Add a message to inform the user
      addMessage(
        chatId, 
        'OpenAI API is not connected. Please check your API key in the Settings page.', 
        'assistant'
      );
    }

    return newMessage;
  }

  async function updateMessage(messageId: string, content: string) {
    console.log(`Updating message ${messageId} with content:`, content.substring(0, 50) + '...');
    
    // Find the message across all chats
    for (const chat of chats.value) {
      const message = chat.messages.find(m => m.id === messageId);
      if (message) {
        message.content = content;
        chat.lastMessage = content;
        console.log('Message updated successfully');
        await nextTick();
        return message;
      }
    }
    
    console.warn('Message not found with ID:', messageId);
    return null;
  }

  function createPromptVersion(content: string, isActive: boolean = true): PromptVersion {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      updatedAt: new Date(),
      version: Date.now(),
      isActive
    };
  }

  function updateStory(chatId: string, content: string, createNewVersion: boolean = true) {
    console.log(`Updating story for chat ${chatId}`);
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat) {
      console.error('Chat not found with ID:', chatId);
      return;
    }

    if (!chat.story) {
      // Create new story with first version
      const newVersion = createPromptVersion(content);
      chat.story = {
        content,
        updatedAt: new Date(),
        versions: [newVersion],
        activeVersionId: newVersion.id
      };
    } else {
      if (createNewVersion) {
        // Mark current version as inactive
        chat.story.versions.forEach(v => v.isActive = false);
        
        // Create new version
        const newVersion = createPromptVersion(content);
        chat.story.versions.push(newVersion);
        chat.story.activeVersionId = newVersion.id;
      }
      
      chat.story.content = content;
      chat.story.updatedAt = new Date();
    }

    return chat.story;
  }

  function revertToPromptVersion(chatId: string, versionId: string) {
    console.log(`Reverting to prompt version ${versionId} for chat ${chatId}`);
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat?.story) {
      console.error('Chat or story not found');
      return;
    }

    const version = chat.story.versions.find(v => v.id === versionId);
    if (!version) {
      console.error('Version not found');
      return;
    }

    // Mark all versions as inactive
    chat.story.versions.forEach(v => v.isActive = false);
    
    // Mark selected version as active
    version.isActive = true;
    chat.story.activeVersionId = version.id;
    chat.story.content = version.content;
    chat.story.updatedAt = new Date();

    return chat.story;
  }

  function deletePromptVersion(chatId: string, versionId: string) {
    console.log(`Deleting prompt version ${versionId} for chat ${chatId}`);
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat?.story) {
      console.error('Chat or story not found');
      return;
    }

    const versionIndex = chat.story.versions.findIndex(v => v.id === versionId);
    if (versionIndex === -1) {
      console.error('Version not found');
      return;
    }

    // Don't allow deleting the last version
    if (chat.story.versions.length <= 1) {
      console.warn('Cannot delete the last version');
      return;
    }

    const wasActive = chat.story.versions[versionIndex].isActive;
    chat.story.versions.splice(versionIndex, 1);

    // If deleted version was active, make the most recent one active
    if (wasActive) {
      const mostRecent = chat.story.versions.reduce((prev, current) => 
        prev.version > current.version ? prev : current
      );
      mostRecent.isActive = true;
      chat.story.activeVersionId = mostRecent.id;
      chat.story.content = mostRecent.content;
      chat.story.updatedAt = new Date();
    }
  }

  // Global prompt template management
  function createGlobalPromptTemplate(name: string, content: string, isDefault: boolean = false): GlobalPromptTemplate {
    if (isDefault) {
      // Mark all existing templates as non-default
      globalPromptTemplates.value.forEach(t => t.isDefault = false);
    }

    const template: GlobalPromptTemplate = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      content,
      isDefault,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    globalPromptTemplates.value.push(template);
    return template;
  }

  function updateGlobalPromptTemplate(templateId: string, updates: Partial<GlobalPromptTemplate>) {
    const template = globalPromptTemplates.value.find(t => t.id === templateId);
    if (!template) {
      console.error('Template not found');
      return;
    }

    if (updates.isDefault) {
      // Mark all other templates as non-default
      globalPromptTemplates.value.forEach(t => t.isDefault = false);
    }

    Object.assign(template, updates, { updatedAt: new Date() });
    return template;
  }

  function deleteGlobalPromptTemplate(templateId: string) {
    const index = globalPromptTemplates.value.findIndex(t => t.id === templateId);
    if (index === -1) {
      console.error('Template not found');
      return;
    }

    globalPromptTemplates.value.splice(index, 1);
  }

  async function handleAIResponse(chat: Chat) {
    console.log('Handling AI response for chat:', chat.id);
    isTyping.value = true;
    let streamedContent = '';
    let toolCalls: any[] = [];

    try {
      // Prepare messages with MCP system prompt integration
      const userMessages = chat.messages.map(msg => ({
        role: msg.sender,
        content: msg.content
      }));

      // Add MCP system prompt if there are connected servers
      const mcpSystemPrompt = mcpStore.getCombinedSystemPrompt();
      const messages = mcpSystemPrompt 
        ? [{ role: 'system', content: mcpSystemPrompt }, ...userMessages]
        : userMessages;

      console.log('Sending messages to OpenAI with MCP integration:', {
        hasMCPPrompt: !!mcpSystemPrompt,
        connectedServers: mcpStore.connectedServers.length,
        messageCount: messages.length
      });
      
      // Check if OpenAI is connected
      if (!openAIStore.connected) {
        console.error('OpenAI is not connected. Cannot send messages.');
        throw new Error('OpenAI is not connected. Please check your API key.');
      }
      
      const stream = await openAIStore.streamChat(messages);
      console.log('Stream object received:', stream);

      // Don't add initial AI message yet - wait for first content
      let aiMessage: Message | null = null;
      console.log('Waiting for first content chunk to create AI message');

      console.log('Starting to process stream');
      for await (const chunk of stream) {
        console.log('Received chunk:', chunk);
        
        // Handle Responses API streaming format
        if (chunk.type === 'response.output_text.delta') {
          const content = chunk.delta || '';
          streamedContent += content;
          
          // Create AI message on first content chunk
          if (!aiMessage && content) {
            aiMessage = {
              id: Date.now().toString(),
              content: '',
              timestamp: new Date(),
              sender: 'assistant'
            };
            chat.messages.push(aiMessage);
            console.log('Created AI message on first content chunk');
          }
          
          // For now, just show "AI is processing..." until we have the full response
          if (aiMessage) {
            aiMessage.content = 'AI is processing your request...';
            chat.lastMessage = 'AI is processing your request...';
            await nextTick();
          }
        } else if (chunk.type && chunk.type.includes('function_call')) {
          // Handle tool calls for Responses API
          console.log('Tool call delta received:', chunk);
          // Tool call handling for Responses API format
          // This will need to be implemented based on the actual tool call structure
        }
      }
      
      console.log('Stream processing complete');
      console.log('Final content length:', streamedContent.length);
      console.log('Tool calls received:', toolCalls);
      
      // Parse the dual response format
      const parsedResponse = parseDualResponse(streamedContent);
      
      if (parsedResponse.chatResponse && parsedResponse.aiPrompt) {
        // Update the AI message with the chat response
        if (aiMessage) {
          aiMessage.content = parsedResponse.chatResponse;
          chat.lastMessage = parsedResponse.chatResponse;
          await nextTick();
        }
        
        // Update the sidebar with the AI prompt
        updateStory(chat.id, parsedResponse.aiPrompt, true);
        console.log('Updated sidebar with AI prompt');
      } else {
        // Fallback: use the entire content as both chat and prompt
        console.warn('Could not parse dual response format, using content as-is');
        if (aiMessage) {
          aiMessage.content = streamedContent || 'I received your message but had no response to provide.';
          chat.lastMessage = aiMessage.content;
          await nextTick();
        }
        
        // Also update sidebar with the full content
        if (streamedContent) {
          updateStory(chat.id, streamedContent, true);
        }
      }
      
      // Process tool calls if any
      if (toolCalls.length > 0) {
        for (const toolCall of toolCalls) {
          if (toolCall.function.name === 'configure_chatbot') {
            try {
              console.log('Processing configure_chatbot tool call:', toolCall);
              
              // Parse the arguments
              const args = JSON.parse(toolCall.function.arguments);
              console.log('Parsed tool arguments:', args);
              
              if (args.tasks && Array.isArray(args.tasks)) {
                // Process configuration tasks
                const configResult = await openAIStore.processConfigurationTool(args.tasks);
                console.log('Configuration result:', configResult);
                
                // Add configuration result as a new message
                const configMessage: Message = {
                  id: Date.now().toString() + '_config',
                  content: configResult,
                  timestamp: new Date(),
                  sender: 'assistant'
                };
                chat.messages.push(configMessage);
                chat.lastMessage = configResult;
                
                // Force UI update
                await nextTick();
              } else {
                console.error('Invalid tool call arguments:', args);
                const errorMessage: Message = {
                  id: Date.now().toString() + '_error',
                  content: '❌ Invalid configuration request format.',
                  timestamp: new Date(),
                  sender: 'assistant'
                };
                chat.messages.push(errorMessage);
                chat.lastMessage = errorMessage.content;
              }
            } catch (parseError: any) {
              console.error('Error parsing tool call arguments:', parseError);
              const errorMessage: Message = {
                id: Date.now().toString() + '_parse_error',
                content: `❌ Error processing configuration request: ${parseError.message}`,
                timestamp: new Date(),
                sender: 'assistant'
              };
              chat.messages.push(errorMessage);
              chat.lastMessage = errorMessage.content;
            }
          }
        }
      }
      
      // If no content was received but we expected some, show a fallback message
      if (!streamedContent && !toolCalls.length) {
        console.warn('No content received from stream');
        if (!aiMessage) {
          aiMessage = {
            id: Date.now().toString(),
            content: 'I received your message but had no response to provide.',
            timestamp: new Date(),
            sender: 'assistant'
          };
          chat.messages.push(aiMessage);
          chat.lastMessage = aiMessage.content;
        }
      }
      
    } catch (error: any) {
      console.error('AI response error:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Remove any empty message if it exists
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage && lastMessage.sender === 'assistant' && !lastMessage.content) {
        chat.messages.pop();
      }
      
      // Add an error message
      addMessage(
        chat.id, 
        `Error: ${error.message || 'An unknown error occurred while generating a response.'}`, 
        'assistant'
      );
    } finally {
      // Always set typing to false when done
      isTyping.value = false;
      console.log('Typing indicator turned off');
    }
  }

  // Helper function to parse dual response format
  function parseDualResponse(content: string): { chatResponse: string | null; aiPrompt: string | null } {
    console.log('Parsing dual response from content:', content.substring(0, 200) + '...');
    
    const chatResponseMatch = content.match(/---CHAT_RESPONSE---([\s\S]*?)---AI_PROMPT---/);
    const aiPromptMatch = content.match(/---AI_PROMPT---([\s\S]*?)---END---/);
    
    const chatResponse = chatResponseMatch ? chatResponseMatch[1].trim() : null;
    const aiPrompt = aiPromptMatch ? aiPromptMatch[1].trim() : null;
    
    console.log('Parsed responses:', { 
      hasChatResponse: !!chatResponse, 
      hasAiPrompt: !!aiPrompt,
      chatResponseLength: chatResponse?.length || 0,
      aiPromptLength: aiPrompt?.length || 0
    });
    
    return { chatResponse, aiPrompt };
  }

  function createNewChat() {
    console.log('Creating new chat');
    
    // Use default template if available
    const initialPrompt = defaultPromptTemplate.value?.content || '';
    
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Conversation',
      timestamp: new Date(),
      messages: [
        {
          id: '1',
          content: 'Hello! Start creating your AI prompt here.',
          timestamp: new Date(),
          sender: 'assistant'
        }
      ],
      lastMessage: 'Hello! Start creating your AI prompt here.'
    };

    // If there's a default template, initialize the story with it
    if (initialPrompt) {
      const initialVersion = createPromptVersion(initialPrompt);
      newChat.story = {
        content: initialPrompt,
        updatedAt: new Date(),
        versions: [initialVersion],
        activeVersionId: initialVersion.id
      };
    }
    
    chats.value.unshift(newChat);
    setActiveChat(newChat.id);
    console.log('New chat created with ID:', newChat.id);
    return newChat;
  }

  // Function to clear all chat history except the active chat
  function clearAllChatsExceptActive() {
    if (!activeChat.value) return;
    
    // Keep only the active chat
    const currentActiveChat = chats.value.find(c => c.id === activeChat.value);
    if (currentActiveChat) {
      chats.value = [currentActiveChat];
      console.log('Cleared all chats except active one');
      forceSave();
      return true;
    }
    return false;
  }

  // Function to clear version history for a specific chat
  function clearVersionHistory(chatId: string) {
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat?.story) return false;
    
    // Keep only the active version
    const activeVersion = chat.story.versions.find(v => v.isActive);
    if (activeVersion) {
      chat.story.versions = [activeVersion];
      console.log(`Cleared version history for chat ${chatId}`);
      forceSave();
      return true;
    }
    return false;
  }

  // Function to clear message history for a specific chat
  function clearChatMessages(chatId: string) {
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat) return false;
    
    // Keep only the welcome message
    chat.messages = [{
      id: Date.now().toString(),
      content: 'Chat history has been cleared.',
      timestamp: new Date(),
      sender: 'assistant'
    }];
    chat.lastMessage = 'Chat history has been cleared.';
    console.log(`Cleared message history for chat ${chatId}`);
    forceSave();
    return true;
  }

  // Initialize data
  loadFromStorage();

  // Initialize with a default chat if none exists
  if (chats.value.length === 0) {
    console.log('No chats found, creating default chat');
    createNewChat();
  }

  // Initialize default template if none exists
  if (globalPromptTemplates.value.length === 0) {
    console.log('Creating default prompt template');
    createGlobalPromptTemplate(
      'Default Bot Prompt',
      `You are an AI prompt designer. I will describe how the chatbot should behave, and you will build a structured chatbot flow step-by-step.

Format your responses as clean, numbered flows like this:

1. When user says "Hi", bot replies with:
   - Text: "Hello! How can I help you today?"
   - Quick replies: ["Get Started", "Learn More"]

2. When user clicks "Get Started", bot replies with:
   - Text: "Great! Let's begin..."

Keep flows organized, clear, and user-friendly.`,
      true
    );
  }

  return {
    chats,
    activeChat,
    currentChat,
    isTyping,
    globalPromptTemplates,
    defaultPromptTemplate,
    setActiveChat,
    addMessage,
    updateMessage,
    createNewChat,
    updateStory,
    revertToPromptVersion,
    deletePromptVersion,
    createGlobalPromptTemplate,
    updateGlobalPromptTemplate,
    deleteGlobalPromptTemplate,
    loadFromStorage,
    saveToStorage,
    forceSave,
    clearAllChatsExceptActive,
    clearVersionHistory,
    clearChatMessages
  };
});