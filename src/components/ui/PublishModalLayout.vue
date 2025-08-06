<script setup lang="ts">
import ModalLayout from "./ModalLayout.vue";
import { ref, watch, readonly } from "vue";

interface Tab {
  id: string;
  label: string;
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


const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null);
const activeTab = ref(props.defaultTab || props.tabs[0]?.id || '');

defineSlots<{
  default(props: { activeTab: string; tabs: Tab[] }): any;
  actions(): any;
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
  modalRef.value?.openModal();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  closeModal();
  emit('back');
};

const handleClose = () => {
  emit('close');
};

const handleTabChange = (tabId: string) => {
  if (activeTab.value !== tabId) {
    activeTab.value = tabId;
    emit('tab-change', tabId);
  }
};

// Expose methods and reactive properties
defineExpose({ 
  openModal, 
  closeModal, 
  activeTab: readonly(activeTab)
});
</script>

<template>
  <ModalLayout
    ref="modalRef"
    :title="title"
    :icon="icon"
    :max-width="maxWidth"
    @close="handleClose"
  >
    <div class="bot-modal-content">
      <!-- Tabs Header - Only show when there are multiple tabs -->
      <div v-if="tabs.length > 1" class="tabs-header">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
          @click="handleTabChange(tab.id)"
          :aria-selected="activeTab === tab.id"
          role="tab"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content Slot -->
      <div class="tab-content" role="tabpanel">
        <slot name="default" :activeTab="activeTab" :tabs="tabs" />
      </div>

      <!-- Footer with Back Button and Actions -->
      <div class="modal-footer">
        <button 
          class="back-btn" 
          @click="handleBack"
          type="button"
          aria-label="Go back to previous screen"
        >
          <i class="pi pi-arrow-left"></i>
          Back
        </button>
        <div class="actions-slot">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </ModalLayout>
</template>

<style scoped>
/* CSS Variables fallbacks */
:root {
  --color-border: #e5e7eb;
  --color-text-secondary: #6b7280;
  --color-text-primary: #111827;
  --color-primary: #3b82f6;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --radius-md: 8px;
  --transition-normal: 0.2s ease-in-out;
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
  margin-bottom: 20px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  background: transparent;
  position: relative;
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

.tab-button:hover {
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

.tab-content {
  flex: 1;
  min-height: 200px;
  margin-bottom: 20px;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

.modal-footer {
  border-top: 1px solid var(--color-border, #e5e7eb);
  padding-top: 16px;
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.actions-slot {
  display: flex;
  gap: var(--space-2, 8px);
  align-items: center;
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

  .tabs-header {
    margin-bottom: 16px;
    padding-bottom: 0;
  }
  
  .tab-button {
    padding: 10px 12px;
    font-size: 13px;
    min-width: 120px;
  }
  
  .tab-content {
    margin-bottom: 16px;
    min-height: 180px;
  }
  
  .modal-footer {
    padding-top: 12px;
  }
}

@media (max-width: 480px) {
  .bot-modal-content {
    min-height: 250px;
  }
  
  .tabs-header {
    margin-bottom: 12px;
  }
  
  .tab-button {
    padding: 8px 10px;
    font-size: 12px;
    min-width: 100px;
  }
  
  .tab-content {
    min-height: 160px;
    margin-bottom: 12px;
  }
  
  .modal-footer {
    padding-top: 10px;
  }
  

}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .tab-button {
    border: 1px solid transparent;
  }
  
  .tab-button:hover,
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