<script setup lang="ts">
import {ref, computed} from 'vue';

interface ToolInputSchemaProperty {
  type: string;
  description?: string;
}

interface ToolInputSchema {
  properties: Record<string, ToolInputSchemaProperty>;
  required?: string[];
}

interface Tool {
  name: string;
  description?: string;
  isEnabled: boolean;
  input_schema?: ToolInputSchema;
}

interface Props {
  tools: Tool[];
  alreadyConnected: Boolean
}

const props = defineProps<Props>();
defineEmits(['back', 'add']);

const selectedTool = ref<Tool | null>(null);
const showDetails = ref(false);

const toggleTool = (tool: Tool) => {
  tool.isEnabled = !tool.isEnabled;
};

const viewToolDetails = (tool: Tool) => {
  console.log(`Viewing details for tool: ${tool.name}`);
  const details = props.tools?.find((t: Tool) => t.name === tool.name);
  if (details) {
    selectedTool.value = details;
    showDetails.value = true;
  }
};

const backToList = () => {
  showDetails.value = false;
  selectedTool.value = null;
};

const enabledTools = computed(() => {
  return props.tools.filter(tool => tool.isEnabled);
});

const toggleAllTools = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  props.tools.forEach(tool => tool.isEnabled = checked);
};

</script>

<template>
  <div>
    <div class="tools-container">
      <!-- Tools List View -->
      <div v-if="!showDetails" class="tools-list">
        <div class="tools-header">
          <div class="header-checkbox">
            <input
                type="checkbox"
                :checked="enabledTools.length === tools.length"
                @change="toggleAllTools"
                class="tool-checkbox"
            />
          </div>
          <h3 class="tools-title">Tools</h3>
        </div>

        <div class="tools-items">
          <div
              v-for="tool in tools"
              :key="tool.name"
              class="tool-item"
              @click="viewToolDetails(tool)"
          >
            <div class="tool-checkbox-wrapper" @click.stop="toggleTool(tool)">
              <input
                  type="checkbox"
                  :checked="tool.isEnabled"
                  class="tool-checkbox"
              />
            </div>
            <div class="tool-name">{{ tool.name }}</div>
            <div class="tool-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Tool Details View -->
      <div v-else class="tool-details">
        <div class="details-header">
          <button @click="backToList" class="back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
            Back to Tools
          </button>
        </div>

        <div v-if="selectedTool" class="tool-detail-content">
          <div class="tool-detail-header">
            <h2 class="tool-detail-title">{{ selectedTool.name }}</h2>
          </div>

          <div class="tool-detail-section">
            <h3 class="section-title">Description</h3>
            <p class="section-content">{{ selectedTool.description }}</p>
          </div>

          <div class="tool-detail-section" v-if="selectedTool?.input_schema?.properties">
            <h3 class="section-title">Parameters</h3>
            <div class="parameters-list">
              <div
                  v-for="key in Object.keys(selectedTool.input_schema.properties)"
                  :key="key"
                  class="parameter-item"
              >
                <div class="parameter-header">
                  <span class="parameter-name">{{ key }}</span>
                  <span class="parameter-type">{{ selectedTool.input_schema.properties[key].type }}</span>
                  <span v-if="selectedTool.input_schema?.required?.includes(key)" class="required-badge">Required</span>
                </div>
                <p v-if="selectedTool.input_schema.properties[key].description" class="parameter-description">
                  {{ selectedTool.input_schema.properties[key].description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="button-row">
      <button class="back-btn" @click="$emit('back')">
          <span class="icon-left">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path
                d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round"/></svg>
          </span>
        Back
      </button>
      <button class="add-btn" @click="$emit('add', enabledTools)">
        <i v-if="alreadyConnected" class="pi pi-refresh"></i>
        <i v-else class="pi pi-plus"></i>
        {{ alreadyConnected ? 'Update' : 'Add' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tools-container {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 5px;
}

.tools-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tools-header {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.header-checkbox {
  margin-right: var(--space-3);
}

.tools-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.tools-items {
  flex: 1;
  overflow-y: auto;
}

.tool-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.tool-item:hover {
  background-color: var(--color-bg-hover);
}

.tool-item:last-child {
  border-bottom: none;
}

.tool-checkbox-wrapper {
  margin-right: var(--space-3);
}

.tool-checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-tertiary);
  cursor: pointer;
  appearance: none;
  position: relative;
  transition: all var(--transition-normal);
}

.tool-checkbox:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.tool-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.tool-name {
  flex: 1;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  font-family: var(--font-family);
}

.tool-arrow {
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}

/* Tool Details Styles */
.tool-details {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.details-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  max-width: 500px;
  width: 100%;
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: color var(--transition-normal);
}

.back-button:hover {
  color: var(--color-text-primary);
}

.tool-detail-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.tool-detail-header {
  margin-bottom: var(--space-6);
}

.tool-detail-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.tool-detail-section {
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3) 0;
}

.section-content {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.parameters-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.parameter-item {
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.parameter-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.parameter-name {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.parameter-type {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  background-color: var(--color-bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.required-badge {
  font-size: 0.75rem;
  color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.parameter-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.example-item {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
}

.example-code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  display: block;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Scrollbar styling */
.tools-items::-webkit-scrollbar,
.tool-detail-content::-webkit-scrollbar {
  width: 6px;
}

.tools-items::-webkit-scrollbar-track,
.tool-detail-content::-webkit-scrollbar-track {
  background: var(--color-bg-tertiary);
}

.tools-items::-webkit-scrollbar-thumb,
.tool-detail-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.tools-items::-webkit-scrollbar-thumb:hover,
.tool-detail-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #18181b;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0 24px;
  height: 40px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #222226;
}
</style>