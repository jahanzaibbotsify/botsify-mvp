<script setup lang="ts">
import {useMCPStore} from "@/stores/mcpStore.ts";
import {botsifyApi} from "@/services/botsifyApi.ts";
import {computed, onMounted, ref, watch} from "vue";

const emit = defineEmits(['selectServer', 'addNewServer']);

const mcpStore = useMCPStore();
// Tabs: All, Connected
const activeTab = ref<'all' | 'connected'>('all');

const allServers = computed(() => mcpStore.servers);

// Build one card per actual connection so duplicates are visible
const connectedCards = computed(() => {
  const baseServers = mcpStore.servers;
  return (mcpStore.connectedServers as any[]).map((conn: any) => {
    const label = conn?.setting?.server_label;
    const name = conn?.setting?.server_name;
    const isCustom = !!conn?.setting?.is_custom;
    const base = baseServers.find((s: any) => s.id === label);
    return {
      id: name || label,
      name: isCustom ? (conn?.setting?.server_label || 'Custom') : (name || base?.name || label),
      description: conn?.setting?.server_description || base?.description || '',
      icon: isCustom ? 'custom.svg' : (`${name?.toLowerCase()?.replaceAll(' ', '-')}.svg` || base?.icon || ''),
      isCustom,
      server_url: conn?.setting?.server_url || base?.server_url,
      server_label: label,
      connectionId: conn?.id,
      comingSoon: false,
    } as any;
  });
});

const mcpServers = computed(() => {
  return activeTab.value === 'connected' ? connectedCards.value : allServers.value;
});

/**
 * Disconnect from a MCP server
 * @param server
 */
const disconnectMCP = async (server: any) => {
  const response = await botsifyApi.disconnectMCP(server.connectionId);
  if (response.success) {
    mcpStore.removeServer(server);
    mcpStore.connectedMCPs = mcpStore.connectedServers.length;
  } else {
    console.error('Failed to disconnect from MCP server:', response.message);
  }
};

// Initialize MCP store when component is mounted
onMounted(async () => {
  await mcpStore.setIntialize();
});

const iconSrcMap = ref<Record<string, string>>({});

const preloadIcon = (config: any) => {
  if (!config || config.isCustom) return;
  const id = config.id || config.name;
  if (!id || iconSrcMap.value[id] !== undefined) return;
  const url = `/mcp/${config.icon}`;
  const img = new Image();
  img.onload = () => {
    iconSrcMap.value = { ...iconSrcMap.value, [id]: url };
  };
  img.onerror = () => {
    iconSrcMap.value = { ...iconSrcMap.value, [id]: '' };
  };
  img.src = url;
};

watch(mcpServers, (list) => {
  (list || []).forEach(preloadIcon);
}, { immediate: true, deep: true });
</script>
<template>
  <section>
    <!-- Tabs + Action -->
    <div class="tabs-row">
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >All</button>
        <button
          class="tab"
          :class="{ active: activeTab === 'connected' }"
          @click="activeTab = 'connected'"
        >Connected</button>
      </div>
      <div class="actions">
        <button class="primary" @click.stop="$emit('addNewServer')">+ Server</button>
      </div>
    </div>

    <div class="description">
      <p>
        Connect to MCP (Model Context Protocol) servers to extend your AI's capabilities with external tools and
        data sources.
      </p>
    </div>
    <!-- Empty state for Connected tab -->
    <div v-if="activeTab === 'connected' && mcpServers.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="15" x2="16" y2="15"></line>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </div>
      <div class="empty-title">No connected servers</div>
      <div class="empty-subtitle">Connect an MCP server to start using external tools.</div>
    </div>

    <div v-else class="server-grid">
      <!-- Server cards -->
      <div
          v-for="config in mcpServers"
          :key="config.id"
          class="server-card"
          :class="{ connected: activeTab === 'connected' && !!config.connectionId, 'coming-soon': config.comingSoon }"
          @click="config.comingSoon ? null : $emit('selectServer', { server: config, isEdit: activeTab === 'connected' })"
      >
        <!-- Blur overlay for coming soon cards -->
        <div v-if="config.comingSoon" class="coming-soon-overlay">
          <div class="coming-soon-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            <span>Coming Soon</span>
          </div>
        </div>
        
        <div class="server-icon">
          <img
            v-if="!config.isCustom && iconSrcMap[config.id || config.name]"
            :src="iconSrcMap[config.id || config.name]"
            :alt="config.name"
            width="32"
            height="32"
          />
          <svg
              v-else
              class="server-icon"
              data-v-c7408702=""
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24" height="24"
              color="#000000" fill="none"
          >
            <path
                data-v-c7408702=""
                d="M3.49994 11.7501L11.6717 3.57855C12.7762 2.47398 14.5672 2.47398 15.6717 3.57855C16.7762 4.68312 16.7762 6.47398 15.6717 7.57855M15.6717 7.57855L9.49994 13.7501M15.6717 7.57855C16.7762 6.47398 18.5672 6.47398 19.6717 7.57855C20.7762 8.68312 20.7762 10.474 19.6717 11.5785L12.7072 18.543C12.3167 18.9335 12.3167 19.5667 12.7072 19.9572L13.9999 21.2499"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path
                data-v-c7408702=""
                d="M17.4999 9.74921L11.3282 15.921C10.2237 17.0255 8.43272 17.0255 7.32823 15.921C6.22373 14.8164 6.22373 13.0255 7.32823 11.921L13.4999 5.74939"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            >
            </path>
          </svg>
        </div>
        <div class="text-sm text-emphasis">
          <div>{{ config.name }}</div>
        </div>
        <div class="server_label" v-if="activeTab === 'connected'">{{ config.server_label }}</div>

        <div v-if="activeTab === 'connected' && config.connectionId" class="server-actions">
          <button class="edit-button" title="Edit server" @click.stop="$emit('selectServer', { server: config, isEdit: true })">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button @click.stop="disconnectMCP(config)" class="delete-button" title="Delete Server">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tabs Row */
.tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-1) var(--space-3) var(--space-1);
}

.tabs {
  display: inline-flex;
  gap: var(--space-2);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: 4px;
}

.tab {
  appearance: none;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-secondary);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}

.tab.active {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.actions {
  display: flex;
  align-items: center;
}

.server_label {
  font-size: 14px ;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-6) var(--space-4);
  color: var(--color-text-secondary);
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-3);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
}

.empty-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.empty-subtitle {
  font-size: 0.875rem;
  margin-bottom: var(--space-3);
}

.server-card.connected {
  border-color: var(--color-success);
  background: rgba(34, 197, 94, 0.05);
}

.server-card.coming-soon {
  cursor: not-allowed;
  opacity: 0.7;
  filter: blur(0.5px);
}

.server-card.coming-soon:hover {
  transform: none;
  border-color: var(--color-border);
}

.server-card.add-new-card .add-icon {
  background: var(--color-bg-primary);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.server-card .add-label {
  color: var(--color-primary);
}

/* Connected badge styles removed per requirements */

.coming-soon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.coming-soon-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: white;
  text-align: center;
}

.coming-soon-content svg {
  width: 32px;
  height: 32px;
  opacity: 0.9;
  color: var(--color-primary);
}

.coming-soon-content span {
  font-size: 0.875rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  color: white;
}

.server-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-2);
}

.edit-button, .delete-button{
  border-radius: var(--radius-sm);
  padding: var(--space-1);
}

.edit-button {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.edit-button {
  color: var(--color-primary);
}

.edit-button:hover {
  background: rgba(0, 163, 255, 0.1);
  border-color: var(--color-primary);
}

.delete-button {
  color: var(--color-error);
}

.delete-button:hover {
  background-color: var(--color-bg-secondary);
  /* transform: scale(1.1); */
}
</style>