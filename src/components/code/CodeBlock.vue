<script setup lang="ts">
import { onMounted, ref } from 'vue';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';

// Register common languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);

const props = defineProps<{
  code: string;
  language: string;
}>();

const codeRef = ref<HTMLElement | null>(null);
const copied = ref(false);

onMounted(() => {
  if (codeRef.value) {
    hljs.highlightElement(codeRef.value);
  }
});

const copyCode = () => {
  navigator.clipboard.writeText(props.code);
  copied.value = true;
  
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="language">{{ language }}</span>
      <button class="copy-button" @click="copyCode">
        <span v-if="copied">Copied!</span>
        <span v-else>Copy</span>
      </button>
    </div>
    <pre class="code-pre"><code ref="codeRef" :class="language">{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block {
  border-radius: var(--radius-md);
  overflow: hidden;
  margin: 0;
  background-color: #282c34; /* Matching highlight.js atom-one-dark theme */
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background-color: #21252b;
  color: #abb2bf;
  font-size: 0.8125rem;
  border-bottom: 1px solid #181a1f;
}

.language {
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 500;
}

.copy-button {
  padding: var(--space-1) var(--space-2);
  font-size: 0.75rem;
  border-radius: var(--radius-sm);
  background-color: transparent;
  border: 1px solid #4b5263;
  color: #abb2bf;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.copy-button:hover {
  background-color: #4b5263;
  color: white;
}

.code-pre {
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

code {
  font-size: 0.875rem;
  padding: var(--space-3);
  display: block;
}
</style>