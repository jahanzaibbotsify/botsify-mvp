import { computed, ref } from 'vue';
import { useChatStore } from '@/stores/chatStore';

export function useChatSuggestions(chatId: string) {
  const chatStore = useChatStore();
  const customSuggestions = ref<string[]>([]);

  const defaultSuggestions = [
    'Create an AI agent that helps manage a resort like room availability, booking info, amenities, and contact details',
    'Create an agent that searches uploaded files and answers user questions from it',
    'Add Lead Collection Form that asks for user name, email, and message, then sends a summary email to sales@company.com',
    'Create an agent that fetches data from a REST API and returns a formatted result to the user',
    'Create an agent that can search my website for answers',
  ];

  const suggestions = computed(() => {
    return [...defaultSuggestions, ...customSuggestions.value];
  });

  const sendSuggestion = async (suggestion: string) => {
    try {
      if (!chatId) {
        console.warn('No chat ID provided for suggestion');
        return;
      }
      
      await chatStore.addMessage(chatId, suggestion, 'user');
    } catch (error) {
      console.error('Error sending suggestion:', error);
      // You could add toast notification here
    }
  };

  const addCustomSuggestion = (suggestion: string) => {
    if (suggestion.trim() && !customSuggestions.value.includes(suggestion.trim())) {
      customSuggestions.value.push(suggestion.trim());
    }
  };

  const removeCustomSuggestion = (suggestion: string) => {
    const index = customSuggestions.value.indexOf(suggestion);
    if (index > -1) {
      customSuggestions.value.splice(index, 1);
    }
  };

  const clearCustomSuggestions = () => {
    customSuggestions.value = [];
  };

  return {
    suggestions,
    sendSuggestion,
    addCustomSuggestion,
    removeCustomSuggestion,
    clearCustomSuggestions,
    customSuggestions: computed(() => customSuggestions.value)
  };
}
