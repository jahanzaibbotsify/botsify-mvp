<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useChatStore } from '../../stores/chatStore';
import { marked } from 'marked';

const props = defineProps<{
  chatId: string;
}>();

const chatStore = useChatStore();
const isCollapsed = ref(false);

// Check if we're on mobile and set initial collapsed state
onMounted(() => {
  const isMobile = window.innerWidth <= 767;
  isCollapsed.value = isMobile; // Start collapsed on mobile, open on desktop
});

const story = computed(() => {
  const chat = chatStore.chats.find(c => c.id === props.chatId);
  const storyData = chat?.story;
  console.log('Story data computed:', storyData);
  return storyData;
});

// Watch for story changes
watch(story, (newStory, oldStory) => {
  console.log('Story changed in sidebar:', { 
    newContent: newStory?.content?.substring(0, 50) + '...',
    oldContent: oldStory?.content?.substring(0, 50) + '...',
    hasNewContent: !!newStory?.content,
    hasOldContent: !!oldStory?.content
  });
}, { deep: true });

const parsedStoryContent = computed(() => {
  console.log('Parsing story content, story exists:', !!story.value?.content);
  if (!story.value?.content) {
    return `
      <div class="empty-state">
        <h4>🤖 Latest Chatbot Story</h4>
        <p>The most recent AI response will appear here automatically.</p>
        <p>Start chatting and the AI's latest response will be displayed in this sidebar!</p>
      </div>
    `;
  }
  
  try {
    const parsed = marked(story.value.content);
    console.log('Successfully parsed story content');
    return parsed;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return `<p class="error-text">Error rendering content</p>`;
  }
});

const formattedLastUpdate = computed(() => {
  if (!story.value?.updatedAt) return '';
  
  const date = new Date(story.value.updatedAt);
  return date.toLocaleString();
});

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

// Expose the toggleSidebar function to parent components
defineExpose({
  toggleSidebar
});
</script>

<template>
  <div class="story-sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-toggle mobile-only" @click="toggleSidebar">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'rotate': isCollapsed }">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </div>
    
    <div class="sidebar-content">
      <div class="sidebar-header">
        <h3>Chatbot Story</h3>
        <span v-if="story?.updatedAt" class="last-updated">Updated: {{ formattedLastUpdate }}</span>
      </div>
      
      <div class="story-content scrollbar" style="padding: 35px;" v-html="parsedStoryContent"></div>
    </div>
  </div>
</template>

<style scoped>
.story-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: row;
  transition: transform 0.3s ease;
  z-index: var(--z-sidebar);
}

.story-sidebar.collapsed {
  transform: translateX(calc(100% - 30px));
}

.sidebar-toggle {
  width: 30px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  border-right: 1px solid var(--color-border);
  border-bottom-left-radius: var(--radius-md);
  cursor: pointer;
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
}

/* Hide toggle button on desktop screens */
.sidebar-toggle.mobile-only {
  display: none;
}

.sidebar-toggle svg {
  transition: transform 0.3s ease;
}

.sidebar-toggle svg.rotate {
  transform: rotate(180deg);
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.last-updated {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

.story-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.story-content :deep(p) {
  margin: 0 0 var(--space-3);
}

.story-content :deep(p:last-child) {
  margin-bottom: 0;
}

.story-content :deep(h1), 
.story-content :deep(h2), 
.story-content :deep(h3), 
.story-content :deep(h4), 
.story-content :deep(h5), 
.story-content :deep(h6) {
  margin-top: var(--space-4);
  margin-bottom: var(--space-2);
}

.story-content :deep(.error-text) {
  color: var(--color-error);
  font-weight: 500;
}

.story-content :deep(.empty-state) {
  text-align: center;
  padding: var(--space-6) var(--space-4);
  color: var(--color-text-secondary);
}

.story-content :deep(.empty-state h4) {
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
  font-size: 1.125rem;
}

.story-content :deep(.empty-state ul) {
  text-align: left;
  margin: var(--space-3) 0;
  padding-left: var(--space-4);
}

.story-content :deep(.empty-state li) {
  margin-bottom: var(--space-2);
}

.story-content :deep(.empty-state p) {
  margin-bottom: var(--space-3);
}

/* Mobile styles */
@media (max-width: 767px) {
  .story-sidebar {
    width: 280px;
  }
  
  /* Show toggle button on mobile */
  .sidebar-toggle.mobile-only {
    display: flex;
  }
  
  .sidebar-header {
    padding: var(--space-2) var(--space-3);
  }
  
  .story-content {
    padding: var(--space-3);
  }
}
</style> 