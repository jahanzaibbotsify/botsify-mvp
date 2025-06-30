<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useChatStore } from '../../stores/chatStore';
import { marked } from 'marked';
import AiAgentActions from '../sidebar/AiAgentActions.vue';
import BotsifyLoader from '../../components/ui/BotsifyLoader.vue';

const props = defineProps<{
  chatId: string;
}>();

const chatStore = useChatStore();
const isCollapsed = ref(false);
const isEditing = ref(false);
const editContent = ref('');
const showVersionHistory = ref(false);
const showTemplateManager = ref(false);
const newTemplateName = ref('');

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

const isTyping = computed(() => chatStore.isTyping);

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
        <h4>🤖 AI Generated Prompt</h4>
        <p>When you chat with the AI, it will generate two responses:</p>
        <ul>
          <li><strong>Chat Response:</strong> A friendly message shown in the conversation</li>
          <li><strong>Technical Prompt:</strong> The detailed AI prompt that appears here</li>
        </ul>
        <p>Start chatting to see both responses in action!</p>
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

const sortedVersions = computed(() => {
  if (!story.value?.versions) return [];
  return [...story.value.versions].sort((a, b) => b.version - a.version);
});

const formattedLastUpdate = computed(() => {
  if (!story.value?.updatedAt) return '';
  
  const date = new Date(story.value.updatedAt);
  return date.toLocaleString();
});

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

function startEditing() {
  editContent.value = story.value?.content || '';
  isEditing.value = true;
}

function cancelEditing() {
  isEditing.value = false;
  editContent.value = '';
}

function saveEdit() {
  if (editContent.value.trim()) {
    chatStore.updateStory(props.chatId, editContent.value.trim(), true);
    isEditing.value = false;
    editContent.value = '';
    
    // Force save to ensure persistence
    chatStore.forceSave();
  }
}

function revertToVersion(versionId: string) {
  chatStore.revertToPromptVersion(props.chatId, versionId);
  showVersionHistory.value = false;
  
  // Force save to ensure persistence
  chatStore.forceSave();
}

function deleteVersion(versionId: string) {
  if (confirm('Are you sure you want to delete this version?')) {
    chatStore.deletePromptVersion(props.chatId, versionId);
  }
}

function saveAsTemplate() {
  if (!story.value?.content || !newTemplateName.value.trim()) {
    alert('Please enter a template name and ensure there is prompt content to save.');
    return;
  }

  chatStore.createGlobalPromptTemplate(
    newTemplateName.value.trim(),
    story.value.content,
    false
  );
  
  newTemplateName.value = '';
  showTemplateManager.value = false;
  alert('Template saved successfully!');
}

function loadTemplate(templateId: string) {
  const template = chatStore.globalPromptTemplates.find(t => t.id === templateId);
  if (template) {
    chatStore.updateStory(props.chatId, template.content, true);
    showTemplateManager.value = false;
    
    // Force save to ensure persistence
    chatStore.forceSave();
  }
}

function deleteTemplate(templateId: string) {
  if (confirm('Are you sure you want to delete this template?')) {
    chatStore.deleteGlobalPromptTemplate(templateId);
  }
}

function setAsDefaultTemplate(templateId: string) {
  chatStore.updateGlobalPromptTemplate(templateId, { isDefault: true });
}

function formatVersionDate(date: Date) {
  return new Date(date).toLocaleString();
}

function clearAllVersionHistory() {
  if (confirm('Are you sure you want to clear all version history? Only the current active version will be kept.')) {
    chatStore.clearVersionHistory(props.chatId);
  }
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
        <div class="header-title">
          <h3>AI Generated Prompt</h3>
          <div class="header-actions">
            <button 
              v-if="story?.content && !isEditing" 
              @click="startEditing" 
              class="icon-btn edit-btn" 
              title="Edit prompt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            
            <button 
              v-if="story?.versions && story.versions.length > 1" 
              @click="showVersionHistory = !showVersionHistory" 
              class="icon-btn history-btn" 
              title="Version history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M12 7v5l4 2"></path>
              </svg>
            </button>
            
            <button 
              @click="showTemplateManager = !showTemplateManager" 
              class="icon-btn template-btn" 
              title="Manage templates"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="7" y="7" width="10" height="3"></rect>
                <rect x="7" y="14" width="10" height="3"></rect>
              </svg>
            </button>
          </div>
        </div>
        <span v-if="story?.updatedAt && !isEditing" class="last-updated">
          Updated: {{ formattedLastUpdate }}
          <span v-if="story?.versions" class="version-count">
            ({{ story.versions.length }} version{{ story.versions.length !== 1 ? 's' : '' }})
          </span>
        </span>
      </div>
      
      <!-- Editing Mode -->
      <div v-if="isEditing" class="edit-mode">
        <div class="edit-header">
          <h4>Edit Prompt</h4>
          <div class="edit-actions">
            <button @click="cancelEditing" class="btn-secondary">Cancel</button>
            <button @click="saveEdit" class="btn-primary" :disabled="!editContent.trim()">Save</button>
          </div>
        </div>
        <textarea 
          v-model="editContent" 
          class="edit-textarea scrollbar" 
          placeholder="Enter your prompt content..."
          rows="20"
        ></textarea>
      </div>
      
      <!-- Version History -->
      <div v-else-if="showVersionHistory" class="version-history">
        <div class="section-header">
          <h4>Version History</h4>
          <div class="header-actions">
            <button 
              v-if="story?.versions && story.versions.length > 1"
              @click="clearAllVersionHistory" 
              class="icon-btn clear-btn" 
              title="Clear version history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
            <button @click="showVersionHistory = false" class="close-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="versions-list scrollbar">
          <div 
            v-for="version in sortedVersions" 
            :key="version.id" 
            class="version-item" 
            :class="{ active: version.isActive }"
          >
            <div class="version-info">
              <div class="version-meta">
                <span class="version-number">Version {{ sortedVersions.length - sortedVersions.indexOf(version) }}</span>
                <span v-if="version.isActive" class="active-badge">Active</span>
              </div>
              <div class="version-date">{{ formatVersionDate(version.updatedAt) }}</div>
              <div class="version-preview">{{ version.content.substring(0, 100) }}...</div>
            </div>
            <div class="version-actions">
              <button 
                v-if="!version.isActive" 
                @click="revertToVersion(version.id)" 
                class="btn-revert"
                title="Revert to this version"
              >
                Revert
              </button>
              <button 
                v-if="!version.isActive && sortedVersions.length > 1" 
                @click="deleteVersion(version.id)" 
                class="btn-delete"
                title="Delete this version"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Template Manager -->
      <div v-else-if="showTemplateManager" class="template-manager">
        <div class="section-header">
          <h4>Prompt Templates</h4>
          <button @click="showTemplateManager = false" class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- Save Current as Template -->
        <div v-if="story?.content" class="save-template-section">
          <h5>Save Current Prompt as Template</h5>
          <div class="save-template-form">
            <input 
              v-model="newTemplateName" 
              type="text" 
              placeholder="Template name..." 
              class="template-name-input"
            />
            <button 
              @click="saveAsTemplate" 
              class="btn-primary" 
              :disabled="!newTemplateName.trim()"
            >
              Save Template
            </button>
          </div>
        </div>
        
        <!-- Templates List -->
        <div class="templates-list scrollbar">
          <div v-if="chatStore.globalPromptTemplates.length === 0" class="empty-templates">
            <p>No templates saved yet.</p>
          </div>
          <div 
            v-for="template in chatStore.globalPromptTemplates" 
            :key="template.id" 
            class="template-item"
          >
            <div class="template-info">
              <div class="template-header">
                <span class="template-name">{{ template.name }}</span>
                <span v-if="template.isDefault" class="default-badge">Default</span>
              </div>
              <div class="template-date">Created: {{ formatVersionDate(template.createdAt) }}</div>
              <div class="template-preview">{{ template.content.substring(0, 100) }}...</div>
            </div>
            <div class="template-actions">
              <button @click="loadTemplate(template.id)" class="btn-load">Load</button>
              <button 
                v-if="!template.isDefault" 
                @click="setAsDefaultTemplate(template.id)" 
                class="btn-default"
                title="Set as default template for new chats"
              >
                Set Default
              </button>
              <button 
                @click="deleteTemplate(template.id)" 
                class="btn-delete"
                title="Delete template"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Normal View -->
      <div v-else class="story-content scrollbar" v-html="parsedStoryContent"></div>

      <!-- loader -->
      <div v-if="isTyping" class="loader-container">
        <BotsifyLoader/>
      </div>


      <!-- AI Agent Actions moved to right sidebar -->
      <AiAgentActions />
    </div>
  </div>
</template>

<style scoped>
.story-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  border-left: 1px solid rgba(0, 163, 255, 0.1);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 15px rgba(0, 163, 255, 0.08);
  transition: transform var(--transition-normal);
  background-image: 
    radial-gradient(circle at right top, rgba(0, 163, 255, 0.12), transparent 60%),
    radial-gradient(circle at right bottom, rgba(0, 163, 255, 0.08), transparent 60%);
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
  border-bottom: 1px solid rgba(0, 163, 255, 0.1);
  align-items: center;
  justify-content: space-between;
  background-image: linear-gradient(to left, rgba(0, 163, 255, 0.08), transparent 80%);
}

.header-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-actions {
  display: flex;
  gap: var(--space-1);
}

.icon-btn {
  background: transparent;
  border: none;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.edit-btn:hover {
  color: var(--color-primary);
}

.history-btn:hover {
  color: var(--color-warning);
}

.template-btn:hover {
  color: var(--color-success);
}

.last-updated {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.version-count {
  font-weight: 500;
  color: var(--color-primary);
}

/* Edit Mode */
.edit-mode {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.edit-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.edit-actions {
  display: flex;
  gap: var(--space-2);
}

.btn-secondary, .btn-primary {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.btn-secondary:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-textarea {
  flex: 1;
  padding: var(--space-4);
  border: none;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  outline: none;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.section-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.close-btn, .icon-btn {
  background: transparent;
  border: none;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover, .icon-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.clear-btn:hover {
  color: var(--color-error);
}

/* Version History */
.version-history, .template-manager {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.versions-list, .templates-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}

.version-item, .template-item {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
}

.version-item.active {
  border-color: var(--color-primary);
  background-color: rgba(79, 70, 229, 0.05);
}

.version-info, .template-info {
  margin-bottom: var(--space-2);
}

.version-meta, .template-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.version-number, .template-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.active-badge, .default-badge {
  background-color: var(--color-primary);
  color: white;
  padding: 0.125rem var(--space-1);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.default-badge {
  background-color: var(--color-success);
}

.version-date, .template-date {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
}

.version-preview, .template-preview {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.version-actions, .template-actions {
  display: flex;
  gap: var(--space-2);
}

.btn-revert, .btn-load, .btn-default, .btn-delete {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn-revert, .btn-load {
  background-color: var(--color-primary);
  color: white;
}

.btn-revert:hover, .btn-load:hover {
  background-color: var(--color-primary-hover);
}

.btn-default {
  background-color: var(--color-warning);
  color: white;
}

.btn-default:hover {
  background-color: var(--color-warning-hover);
}

.btn-delete {
  background-color: var(--color-error);
  color: white;
}

.btn-delete:hover {
  background-color: var(--color-error-hover);
}

/* Template Manager */
.save-template-section {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
}

.save-template-section h5 {
  margin: 0 0 var(--space-2) 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.save-template-form {
  display: flex;
  gap: var(--space-2);
}

.template-name-input {
  flex: 1;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.template-name-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.empty-templates {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-text-secondary);
}

.story-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
  background-color: var(--color-bg-primary);
}

.story-content :deep(.empty-state) {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-secondary);
}

.story-content :deep(.empty-state h4) {
  margin: 0 0 var(--space-3) 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.story-content :deep(.empty-state p) {
  margin: 0 0 var(--space-2) 0;
  line-height: 1.5;
}

.story-content :deep(.empty-state p:last-child) {
  margin-bottom: 0;
}

.story-content :deep(.error-text) {
  color: var(--color-error);
  font-style: italic;
  text-align: center;
  padding: var(--space-4);
}

/* Markdown content styling */
.story-content :deep(h1),
.story-content :deep(h2),
.story-content :deep(h3),
.story-content :deep(h4),
.story-content :deep(h5),
.story-content :deep(h6) {
  margin: var(--space-4) 0 var(--space-2) 0;
  font-weight: 600;
  color: var(--color-text-primary);
}

.story-content :deep(h1) { font-size: 1.5rem; }
.story-content :deep(h2) { font-size: 1.375rem; }
.story-content :deep(h3) { font-size: 1.25rem; }
.story-content :deep(h4) { font-size: 1.125rem; }
.story-content :deep(h5) { font-size: 1rem; }
.story-content :deep(h6) { font-size: 0.875rem; }

.story-content :deep(p) {
  margin: 0 0 var(--space-3) 0;
  line-height: 1.6;
  color: var(--color-text-primary);
}

.story-content :deep(ul),
.story-content :deep(ol) {
  margin: 0 0 var(--space-3) 0;
  padding-left: var(--space-5);
}

.story-content :deep(li) {
  margin-bottom: var(--space-1);
  line-height: 1.5;
}

.story-content :deep(code) {
  background-color: var(--color-bg-tertiary);
  padding: 0.125rem 0.25rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

.story-content :deep(pre) {
  background-color: var(--color-bg-tertiary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: var(--space-3) 0;
}

.story-content :deep(pre code) {
  background: none;
  padding: 0;
}

.story-content :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  padding-left: var(--space-3);
  margin: var(--space-3) 0;
  font-style: italic;
  color: var(--color-text-secondary);
}

.story-content :deep(a) {
  color: var(--color-primary);
  text-decoration: none;
}

.story-content :deep(a:hover) {
  text-decoration: underline;
}

.story-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--space-4) 0;
}

.loader-container{
  margin: auto;
  padding: 1rem;
}

/* Mobile styles */
@media (max-width: 767px) {
  .story-sidebar {
    width: 100%;
    max-width: 400px;
  }
  
  .sidebar-toggle.mobile-only {
    display: flex;
  }
  
  .save-template-form {
    flex-direction: column;
  }
  
  .version-actions, .template-actions {
    flex-wrap: wrap;
  }
}

/* Tablet styles */
@media (max-width: 1024px) and (min-width: 768px) {
  .story-sidebar {
    width: 350px;
  }
}

.tab {
  padding: var(--space-2) var(--space-4);
  font-size: 0.875rem;
  cursor: pointer;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  transition: all var(--transition-normal);
}

.tab:hover {
  color: var(--color-text-primary);
  background-color: rgba(0, 163, 255, 0.03);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  background-image: linear-gradient(to bottom, rgba(0, 163, 255, 0.05), transparent);
}

.version-item {
  padding: var(--space-3);
  border-bottom: 1px solid rgba(0, 163, 255, 0.05);
  transition: background-color var(--transition-normal);
  position: relative;
}

.version-item:hover {
  background-color: rgba(0, 163, 255, 0.05);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.08), transparent 80%);
}

.version-item.active {
  background-color: rgba(0, 163, 255, 0.08);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.12), transparent 80%);
}
</style> 