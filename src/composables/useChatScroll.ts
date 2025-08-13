import { ref, nextTick, watch, onMounted } from 'vue';
import type { Ref } from 'vue';

export function useChatScroll(
  messagesContainer: Ref<HTMLElement | null>,
  messages: Ref<any[]>,
  isTyping: Ref<boolean>
) {
  const isScrolling = ref(false);
  const scrollTimeout = ref<NodeJS.Timeout | null>(null);

  const scrollToBottom = async (immediate = false) => {
    try {
      if (isScrolling.value && !immediate) return;
      
      isScrolling.value = true;
      
      await nextTick();
      
      if (messagesContainer.value) {
        const container = messagesContainer.value;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        // Only scroll if there's actually content to scroll to
        if (scrollHeight > clientHeight) {
          container.scrollTop = scrollHeight;
        }
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    } finally {
      // Debounce scrolling to prevent excessive calls
      if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value);
      }
      
      scrollTimeout.value = setTimeout(() => {
        isScrolling.value = false;
      }, 100);
    }
  };

  // Debounced scroll function for performance
  const debouncedScrollToBottom = () => {
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value);
    }
    
    scrollTimeout.value = setTimeout(() => {
      scrollToBottom();
    }, 50);
  };

  // Watch for changes that should trigger scroll to bottom
  watch(
    [
      () => messages.value.length,
      () => messages.value.map(m => m.content).join(''),
      () => isTyping.value
    ],
    () => {
      debouncedScrollToBottom();
    },
    { flush: 'post' } // Ensure DOM is updated before scrolling
  );

  // Cleanup on unmount
  onMounted(() => {
    // Initial scroll to bottom
    scrollToBottom(true);
  });

  return {
    scrollToBottom,
    debouncedScrollToBottom,
    isScrolling
  };
}
