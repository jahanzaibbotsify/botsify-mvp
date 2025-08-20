<script setup lang="ts">
import {PublishModalLayout} from "@/components/ui";
import { ref, computed } from "vue";
import { useBotStore } from "@/stores/botStore";

// Define tabs
const tabs = [
  { id: 'publish', label: 'Publish' }
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish');

const emit = defineEmits<{
  back: [];
}>();

// Get bot store for API key
const botStore = useBotStore();

// MCP server configuration
const mcpData = ref({
  type: "mcp",
  server_label: "agentic_bot",
  server_url: "https://mcp.botsify.com/agent/mcp",
  headers: {
    Authorization: `Bearer ${botStore.apiKey || ''}`
  },
  allowed_tools: [
    "getBotResponse"
  //   "updateBotSettings",
  //   "updateBotGeneralSettings",
  //   "getBotsifyChatBotApiKey",
  //   "getTeamMembers",
  //   "toggleBotAccessForTeamMember",
  //   "resendInvitationToTeamMember",
  //   "toggleBotNotificationForTeamMember",
  //   "getTeamMember",
  //   "createTeamMember",
  //   "updateTeamMember",
  //   "deleteTeamMember",
  //   "getOfflineHours",
  //   "setOfflineHours",
  //   "clearBotData",
  //   "getChatBotMenu",
  //   "setChatBotMenu",
  //   "createPageMessage",
  //   "updatePageMessage",
  //   "deletePageMessage",
  //   "getAllPageMessages"
  ],
  require_approval: "never"
});

// Computed property to format MCP data as JSON
const mcpJsonData = computed(() => {
  return JSON.stringify(mcpData.value, null, 2);
});

const openModal = () => {
  modalRef.value?.openModal();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const handleTabChange = (tabId: string) => {
  console.log('Tab changed to:', tabId);
  currentActiveTab.value = tabId;
};

// Copy JSON to clipboard
const copyToClipboard = async () => {
  const textarea = document.createElement('textarea');
  // Decode HTML entities like &lt; and &gt; into < and >
  textarea.innerHTML = mcpJsonData.value;
  const decoded = textarea.value;

  // Copy decoded value
  await navigator.clipboard.writeText(decoded);
  window.$toast.success('Copied!');
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Agent as MCP"
    :tabs="tabs"
    icon="/bots/mcp.png"
    max-width="1200px"
    default-tab="publish"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Tab -->
      <div v-if="activeTab === 'publish'" class="tab-panel">
        <!-- <p class="subtitle">MCP server information</p> -->
        
        <div class="form-section">
          <div class="json-display-section">
            <div class="json-header">
              <h4>MCP server JSON</h4>
              <button 
                class="copy-button"
                @click="copyToClipboard"
                title="Copy to clipboard"
              >
                Copy
              </button>
            </div>
            <div class="json-content">
              <pre class="json-code">{{ mcpJsonData }}</pre>
            </div>
          </div>
        </div>
      </div>
    </template>
    
  </PublishModalLayout>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

.subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.form-section {
  margin-top: 20px;
}

.json-display-section {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
}

.json-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.copy-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.copy-button:hover {
  background-color: var(--color-primary-hover);
}

.copy-button:active {
  background-color: var(--color-primary-active);
}

.json-content {
  padding: var(--space-4);
  max-height: 400px;
  overflow-y: auto;
}

.json-code {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 640px) {
  .json-header {
    padding: var(--space-3);
  }
  
  .json-content {
    padding: var(--space-3);
  }
  
  .json-code {
    font-size: 12px;
  }
}
</style>
