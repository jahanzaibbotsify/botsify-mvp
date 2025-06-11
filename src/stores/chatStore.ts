import { defineStore } from 'pinia';
import { ref, computed, nextTick } from 'vue';
import { useOpenAIStore } from './openaiStore';
import type { Chat, Message, Attachment } from '../types';

export const useChatStore = defineStore('chat', () => {
  const openAIStore = useOpenAIStore();
  const chats = ref<Chat[]>([]);
  const activeChat = ref<string | null>(null);
  const isTyping = ref(false);

  const currentChat = computed(() => {
    return chats.value.find(chat => chat.id === activeChat.value) || null;
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
      return;
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

  function updateStory(chatId: string, content: string) {
    console.log(`Updating story for chat ${chatId}`);
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat) {
      console.error('Chat not found with ID:', chatId);
      return;
    }

    if (!chat.story) {
      chat.story = {
        content,
        updatedAt: new Date()
      };
    } else {
      chat.story.content = content;
      chat.story.updatedAt = new Date();
    }

    return chat.story;
  }

  async function handleAIResponse(chat: Chat) {
    console.log('Handling AI response for chat:', chat.id);
    isTyping.value = true;
    let streamedContent = '';

    try {
      const messages = chat.messages.map(msg => ({
        role: msg.sender,
        content: msg.content
      }));

      console.log('Sending messages to OpenAI:', JSON.stringify(messages));
      
      // Check if OpenAI is connected
      if (!openAIStore.connected) {
        console.error('OpenAI is not connected. Cannot send messages.');
        throw new Error('OpenAI is not connected. Please check your API key.');
      }
      
      const stream = await openAIStore.streamChat(messages);
      console.log('Stream object received:', stream);

      // Add initial AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: '',
        timestamp: new Date(),
        sender: 'assistant'
      };
      chat.messages.push(aiMessage);
      console.log('Added initial empty AI message');

      console.log('Starting to process stream');
      for await (const chunk of stream) {
        console.log('Received chunk:', chunk);
        const content = chunk.choices[0]?.delta?.content || '';
        streamedContent += content;
        
        // Update the message in real-time as chunks arrive
        aiMessage.content = streamedContent;
        chat.lastMessage = streamedContent;
        
        // Force UI update after each chunk
        await nextTick();
      }
      console.log('Stream processing complete, final content length:', streamedContent.length);
    } catch (error: any) {
      console.error('AI response error:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Remove the empty message if it exists
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage && lastMessage.sender === 'assistant' && lastMessage.content === '') {
        chat.messages.pop();
      }
      
      // Add an error message
      addMessage(
        chat.id, 
        `Error: ${error.message || 'An unknown error occurred while generating a response.'}`, 
        'assistant'
      );
    } finally {
      isTyping.value = false;
    }
  }

  function createNewChat() {
    console.log('Creating new chat');
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
    
    chats.value.unshift(newChat);
    setActiveChat(newChat.id);
    console.log('New chat created with ID:', newChat.id);
    return newChat;
  }

  // Initialize with a default chat if none exists
  if (chats.value.length === 0) {
    console.log('No chats found, creating default chat');
    createNewChat();
  }

  return {
    chats,
    activeChat,
    currentChat,
    isTyping,
    setActiveChat,
    addMessage,
    createNewChat,
    updateStory
  };
});