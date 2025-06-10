<script setup lang="ts">
import { ref } from 'vue';
import CodeBlock from './CodeBlock.vue';

const props = defineProps<{
  code: string;
  language: string;
  filename?: string;
}>();

const copied = ref(false);

const copyCode = () => {
  navigator.clipboard.writeText(props.code);
  copied.value = true;
  
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};

const downloadCode = () => {
  const blob = new Blob([props.code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = props.filename || `code-snippet.${props.language}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="code-viewer">
    <div class="viewer-header">
      <h3 class="filename">{{ filename || `Code Snippet.${language}` }}</h3>
      <div class="viewer-actions">
        <button class="action-button" @click="copyCode">
          <span v-if="copied">Copied!</span>
          <span v-else>Copy Code</span>
        </button>
        <button class="action-button" @click="downloadCode">Download</button>
      </div>
    </div>
    
    <div class="viewer-content">
      <CodeBlock :code="code" :language="language" />
    </div>
  </div>
</template>

<style scoped>
.code-viewer {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
}

.viewer-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.filename {
  margin: 0 0 var(--space-2);
  font-size: 1rem;
  word-break: break-all;
}

.viewer-actions {
  display: flex;
  gap: var(--space-2);
}

.action-button {
  font-size: 0.8125rem;
  padding: var(--space-1) var(--space-3);
}

.viewer-content {
  overflow: hidden;
}
</style>