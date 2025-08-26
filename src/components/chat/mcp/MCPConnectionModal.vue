<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, defineAsyncComponent} from 'vue';
import type {MCPServer} from '@/types/mcp.ts';
const ServersList = defineAsyncComponent(() => import('./ServersList.vue'));
const MCPConnectModal = defineAsyncComponent(() => import('./MCPConnectModal.vue'));

defineProps({
  isOpen: Boolean,
  showCustomServer: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);


const isAddNewServer = ref(false);
const selectedServer = ref<MCPServer | null>(null);
const isEdit = ref(false);

/**
 * Closes the modal and resets the state.
 */
function closeModal() {
  selectedServer.value = null;
  isAddNewServer.value = false;
  emit('close');
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeModal();
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});

const selectServer = (payload: any) => {
  const server = payload?.server || payload;
  isEdit.value = !!payload?.isEdit;
  if (server.isCustom && !isEdit.value) {
    isAddNewServer.value = true;
  }
  selectedServer.value = server;
};
</script>


<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal" @keydown="handleKeydown" tabindex="0">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header" v-if="!isAddNewServer && !selectedServer">
        <div class="header-content">
          <h2 class="modal-title">Add MCP server</h2>
        </div>
        <button class="close-button" @click="closeModal" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Server Selection -->
      <div class="modal-body">
        <MCPConnectModal
            v-if="selectedServer || isAddNewServer"
            :server="selectedServer"
            :is-custom="isAddNewServer"
            :is-edit="isEdit"
            @close="selectedServer = null; isAddNewServer = false"
            @quit="() => {
              selectedServer = null; isAddNewServer = false;
              closeModal();
            }"
        />
        <ServersList
            v-else
            @selectServer="selectServer"
            @addNewServer="isAddNewServer = true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-4);
}

.modal-content {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(0, 163, 255, 0.1);
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: var(--space-4) var(--space-4) 0 var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
}

.close-button:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-4);
  overflow-y: auto;
  flex: 1;
}

/* Mobile styles */
@media (max-width: 767px) {
  .modal-overlay {
    padding: var(--space-2);
  }

  .modal-content {
    max-height: 95vh;
  }
}
</style>