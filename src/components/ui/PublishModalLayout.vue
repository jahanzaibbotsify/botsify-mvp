<script setup lang="ts">
import { ref, watch, readonly, watchEffect, onUnmounted } from "vue";
import Button from "./Button.vue";

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  title: string;
  tabs: Tab[];
  maxWidth?: string;
  defaultTab?: string;
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: '600px',
  defaultTab: ''
});

const emit = defineEmits<{
  back: [];
  'tab-change': [tabId: string];
  close: [];
}>();

const showModal = ref(false);
const activeTab = ref(props.defaultTab || props.tabs[0]?.id || '');

defineSlots<{
  default(props: { activeTab: string; tabs: Tab[] }): any;
}>();

// Watch for prop changes
watch(() => props.defaultTab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    activeTab.value = newTab;
  }
});

// Watch for tabs changes and reset active tab if needed
watch(() => props.tabs, (newTabs) => {
  if (newTabs.length > 0 && !newTabs.find(tab => tab.id === activeTab.value)) {
    activeTab.value = newTabs[0].id;
  }
}, { deep: true });

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleBack = () => {
  closeModal();
  emit('back');
};

// const handleClose = () => {
//   emit('close');
// };

const handleTabChange = (tabId: string) => {
  // Check if the tab is disabled
  const tab = props.tabs.find(t => t.id === tabId);
  if (tab?.disabled) {
    return; // Don't allow switching to disabled tabs
  }
  
  if (activeTab.value !== tabId) {
    activeTab.value = tabId;
    emit('tab-change', tabId);
  }
};

const handleOverlayClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains('modal-overlay')) {
    closeModal();
  }
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showModal.value) {
    closeModal();
  }
};

// Add/remove escape key listener when modal opens/closes
watchEffect(() => {
  if (showModal.value) {
    document.addEventListener('keydown', handleEscapeKey);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', handleEscapeKey);
    // Restore body scroll when modal is closed
    document.body.style.overflow = '';
  }
});

// Cleanup on component unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey);
  document.body.style.overflow = '';
});

// Expose methods and reactive properties
defineExpose({ 
  openModal, 
  closeModal, 
  activeTab: readonly(activeTab)
});
</script>

<template>
  <div v-if="showModal" class="modal-overlay" @click="handleOverlayClick">
    <div 
      class="modal-content" 
      :style="{ maxWidth: props.maxWidth }"
      @click.stop
    >
      <div class="modal-header">
        <div class="modal-header-left">
           
            <!-- Back Button -->
            <i
              class="pi pi-arrow-left"
              @click="handleBack"
              style="cursor: pointer;"
            />
          <img v-if="icon" :src="icon" width="28" height="28" alt="logo" class="modal-logo" />
          <h2>{{ props.title }}</h2>
        </div>
       
        
        <!-- Close Button -->
        <Button 
          variant="secondary"
          size="small"
          icon="pi pi-times"
          icon-only
          @click="closeModal"
        />
      </div>
      
      <div class="modal-body">
        <div class="bot-modal-content">
          <!-- Header with Tabs -->
          <div class="tabs-header">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="tab-button"
              :class="{ 
                active: activeTab === tab.id,
                disabled: tab.disabled 
              }"
              @click="handleTabChange(tab.id)"
              :aria-selected="activeTab === tab.id"
              :disabled="tab.disabled"
              role="tab"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content Slot -->
          <div class="tab-content" role="tabpanel">
            <slot name="default" :activeTab="activeTab" :tabs="tabs" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  background-image: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-content {
  width: 90%;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-border);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(to right, rgba(0, 163, 255, 0.05), transparent);
  gap: var(--space-3);
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-4);
}

.bot-modal-content {
  display: flex;
  flex-direction: column;
  min-height: 300px;
  width: 100%;
  box-sizing: border-box;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  background: transparent;
  position: relative;
  margin-bottom: 20px;
}

.tabs-header::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.tab-button {
  background: none;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
  border-bottom: 2px solid transparent;
  transition: all var(--transition-normal, 0.2s ease-in-out);
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
  font-family: inherit;
  line-height: 1.4;
  min-width: fit-content;
  border-radius: 0;
}

.tab-button:hover:not(.disabled) {
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border-radius: 6px 6px 0 0;
}

.tab-button:focus {
  outline: 0;
}

.tab-button:focus:not(:focus-visible) {
  outline: none;
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
  background: transparent;
}

.tab-button.active:hover {
  background: transparent;
  color: var(--color-primary);
}

.tab-button.disabled {
  color: var(--color-text-tertiary, #9ca3af);
  cursor: not-allowed;
  opacity: 0.6;
}

.tab-button.disabled:hover {
  background: transparent;
  color: var(--color-text-tertiary, #9ca3af);
}

.tab-content {
  flex: 1;
  min-height: 200px;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

/* Loading state */
.tab-content:empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary, #6b7280);
  font-style: italic;
}

.tab-content:empty::after {
  content: "Loading...";
}

/* Animation for tab switching */
.tab-content > * {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .bot-modal-content {
    min-height: 280px;
  }
  
  .modal-header {
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  
  .modal-header-left {
    order: 1;
    flex: 1 1 100%;
    margin-bottom: var(--space-2);
  }
  
  .tabs-header {
    padding-bottom: 0;
    width: 100%;
  }
  
  .tab-button {
    padding: 10px 12px;
    font-size: 13px;
    min-width: 120px;
  }
  
  .tab-content {
    min-height: 180px;
  }
}

@media (max-width: 480px) {
  .bot-modal-content {
    min-height: 250px;
  }
  
  .modal-header {
    padding: var(--space-3);
  }
  
  .tab-button {
    padding: 8px 10px;
    font-size: 12px;
    min-width: 100px;
  }
  
  .tab-content {
    min-height: 160px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .tab-button {
    border: 1px solid transparent;
  }
  
  .tab-button:hover:not(.disabled),
  .tab-button.active {
    border-color: currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .tab-button,
  .tab-content > * {
    transition: none;
    animation: none;
  }
}

/* Dark mode support (if you use it) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-border: #374151;
    --color-text-secondary: #9ca3af;
    --color-text-primary: #f9fafb;
    --color-primary: #60a5fa;
    --color-bg-secondary: #1f2937;
    --color-bg-tertiary: #111827;
  }
}
</style>