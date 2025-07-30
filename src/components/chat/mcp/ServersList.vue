<script setup lang="ts">
import {useMCPStore} from "@/stores/mcpStore.ts";
import {botsifyApi} from "@/services/botsifyApi.ts";
import {computed} from "vue";

const emit = defineEmits(['selectServer', 'addNewServer']);

const mcpStore = useMCPStore();
const mcpServers = computed(() => {
  return mcpStore.servers;
});

/**
 * Disconnect from a MCP server
 * @param server
 */
const disconnectMCP = async (server: any) => {
  const response = await botsifyApi.disconnectMCP(server.connectionId);
  if (response.success) {
    mcpStore.removeServer(server);
  } else {
    console.error('Failed to disconnect from MCP server:', response.message);
  }
};
</script>
<template>
  <section>
    <div class="description">
      <p>
        Connect to MCP (Model Context Protocol) servers to extend your AI's capabilities with external tools and
        data sources.
      </p>
    </div>
    <div class="server-grid">
      <!-- Add new card -->
      <div class="server-card add-new-card" @click.stop="$emit('addNewServer')">
        <div class="server-icon add-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <div class="text-sm text-emphasis add-label">Add new</div>
      </div>
      <!-- Server cards -->
      <div
          v-for="config in mcpServers"
          :key="config.id"
          class="server-card"
          :class="{connected: !!config.connectionId, 'coming-soon': config.comingSoon}"
          @click="config.comingSoon ? null : $emit('selectServer', config)"
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
          <img v-if="!config.isCustom" :src="`/mcp/${config.icon}`" :alt="config.name" width="32" height="32"/>
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

        <!-- Connected Badge -->
        <div v-if="!!config.connectionId" class="connected-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span>Connected</span>
        </div>

        <div v-if="config.connectionId" class="server-actions">
<!--          <button class="edit-button" title="Edit Server">-->
<!--            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"-->
<!--                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">-->
<!--              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>-->
<!--              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>-->
<!--            </svg>-->
<!--          </button>-->
          <button @click.stop="disconnectMCP(config)" class="delete-button" title="Delete Server">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

.server-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.server-card {
  background: var(--color-bg-secondary);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px 12px 12px 16px;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 80px;
  height: 100px;
  min-width: 0;
  box-sizing: border-box;
  position: relative;
}

.server-card.add-new-card {
  border: 1.5px dashed var(--color-primary);
  background: var(--color-bg-tertiary);
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

.server-card .server-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 6px;
}

.server-card .add-label,
.server-card .text-sm {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-primary);
  text-align: left;
  margin-top: 0;
  margin-left: 0;
  padding-left: 0;
}

.server-card .text-sm {
  color: var(--color-text-primary);
}

.connected-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-success);
  color: white;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
  box-shadow: var(--shadow-sm);
}

.coming-soon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
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

@media (max-width: 767px) {
  .server-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .server-card {
    min-height: 100px;
    padding: 20px 12px;
  }
}

.server-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-2);
}

.edit-button, .delete-button {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-1);
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
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-error);
}
</style>