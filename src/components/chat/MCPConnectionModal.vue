<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useMCPStore } from '@/stores/mcpStore';
import type { MCPServer, CustomMCPServerForm } from '@/types/mcp';

const props = defineProps({
  isOpen: Boolean,
  showCustomServer: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const mcpStore = useMCPStore();

const selectedServer = ref<MCPServer | null>(null);
const apiKey = ref('');
const customSystemPrompt = ref('');
const isConnecting = ref(false);
const error = ref<string | null>(null);
const connectionSuccess = ref(false);
const showApiKeyInput = ref(false);
const showAllServers = ref(false);
const showCustomServerForm = ref(false);
const editingCustomServer = ref<string | null>(null);

// Shopify custom fields
const shopifyDomain = ref('');
const shopifyAuthMethod = ref('none');

const customServerForm = ref<CustomMCPServerForm>({
  name: '',
  description: '',
  category: 'Custom',
  icon: '🔗',
  connectionUrl: '',
  authMethod: 'api_key',
  authLabel: 'API Key',
  features: []
});

const newFeature = ref('');

const authMethods = [
  { value: 'none', label: 'No Authentication' },
  { value: 'api_key', label: 'API Key' },
  { value: 'bearer_token', label: 'Bearer Token' },
  { value: 'basic_auth', label: 'Basic Authentication' },
  { value: 'oauth', label: 'OAuth Token' }
];

const categories = [
  'Custom', 'Development', 'Productivity', 'Communication',
  'Storage', 'Database', 'System', 'Research', 'Data', 'API'
];

const displayedServers = computed(() =>
  showAllServers.value ? mcpStore.servers : mcpStore.servers.filter(p => p.isPopular)
);

const selectedServerConfig = computed(() => {
  if (!selectedServer.value) return null;
  return mcpStore.servers.find(config => config.id === selectedServer.value?.id);
});

const isServerConnected = computed(() => selectedServerConfig.value?.connection?.isConnected || false);

const defaultSystemPrompt = computed(() => {
  if (!selectedServer.value) return '';
  return mcpStore.generateDefaultSystemPrompt(selectedServer.value);
});

const isCustomServerFormValid = computed(() => {
  const f = customServerForm.value;
  return f.name.trim() && f.description.trim() && f.connectionUrl.trim() &&
    (f.authMethod === 'none' || f.authLabel.trim());
});

watch(() => props.isOpen, (val) => {
  if (val && props.showCustomServer) {
    showAddCustomServer();
  }
});

function selectServer(server: MCPServer) {
  selectedServer.value = server;
  showApiKeyInput.value = true;
  error.value = null;

  const existing = mcpStore.servers.find(s => s.id === server.id)?.connection;
  apiKey.value = existing?.apiKey || '';
  customSystemPrompt.value = existing?.systemPrompt || defaultSystemPrompt.value;
  
  // Set Shopify custom fields from server data
  if (server.id === 'shopify') {
    shopifyDomain.value = server.domain || '';
    shopifyAuthMethod.value = server.authMethod || 'none';
  }
}

function goBack() {
  selectedServer.value = null;
  showApiKeyInput.value = false;
  showCustomServerForm.value = false;
  editingCustomServer.value = null;
  error.value = null;
  apiKey.value = '';
  customSystemPrompt.value = '';
  shopifyDomain.value = '';
  shopifyAuthMethod.value = 'none';
  resetCustomServerForm();
}

function showAddCustomServer() {
  showCustomServerForm.value = true;
  editingCustomServer.value = null;
  resetCustomServerForm();
}

function editCustomServer(server: MCPServer) {
  showCustomServerForm.value = true;
  editingCustomServer.value = server.id;
  customServerForm.value = {
    name: server.name,
    description: server.description,
    category: server.category,
    icon: server.icon || '🔗',
    connectionUrl: server.connectionUrl || '',
    authMethod: server.authMethod || 'api_key',
    authLabel: server.authLabel || 'API Key',
    features: [...server.features]
  };
}

function resetCustomServerForm() {
  customServerForm.value = {
    name: '',
    description: '',
    category: 'Custom',
    icon: '🔗',
    connectionUrl: '',
    authMethod: 'api_key',
    authLabel: 'API Key',
    features: []
  };
  newFeature.value = '';
}

function addFeature() {
  const val = newFeature.value.trim();
  if (val && !customServerForm.value.features.includes(val)) {
    customServerForm.value.features.push(val);
    newFeature.value = '';
  }
}

function removeFeature(index: number) {
  customServerForm.value.features.splice(index, 1);
}

function saveCustomServer() {
  if (!isCustomServerFormValid.value) return;

  try {
    if (editingCustomServer.value) {
      mcpStore.updateCustomServer(editingCustomServer.value, customServerForm.value);
    } else {
      mcpStore.addCustomServer(customServerForm.value);
    }
    goBack();
  } catch (err: any) {
    error.value = err.message || 'Failed to save custom server';
  }
}

async function deleteCustomServer(serverId: string) {
  if(!confirm(`Are you sure you want to delete the custom server? This action cannot be undone.`)) return;
  try {
    await mcpStore.deleteCustomServer(serverId);
    goBack();
  } catch (err: any) {
    error.value = 'Failed to delete server: ' + err.message;
  }
}

async function connectToServer() {
  const server = selectedServer.value;
  if (!server) return;

  // const connection = mcpStore.servers.find(s => s.id === server.id)?.connection;

  // Shopify-specific validation
  if (server.id === 'shopify') {
    if (!shopifyDomain.value.trim()) {
      error.value = 'Shopify domain is required';
      return;
    }
    if (shopifyAuthMethod.value !== 'none' && !apiKey.value.trim()) {
      error.value = `${getShopifyAuthLabel()} is required for this authentication method`;
      return;
    }
  } else {
    // Standard validation for other servers
    if (server.apiKeyRequired && !apiKey.value.trim()) {
      error.value = 'API key is required for this server';
      return;
    }
    if (server.isCustom && !server.connectionUrl?.trim()) {
      error.value = 'Connection URL is required for custom servers';
      return;
    }
  }

  isConnecting.value = true;
  error.value = null;
  connectionSuccess.value = false;

  try {
    // For Shopify, pass the domain and auth method as additional parameters
    if (server.id === 'shopify') {
      await mcpStore.connectServer(server.id, apiKey.value, customSystemPrompt.value, {
        domain: shopifyDomain.value.trim(),
        authMethod: shopifyAuthMethod.value
      });
    } else {
      await mcpStore.connectServer(server.id, apiKey.value, customSystemPrompt.value);
    }
    connectionSuccess.value = true;
    goBack();
  } catch (err: any) {
    error.value = err.message || 'Failed to connect to the server';
  } finally {
    isConnecting.value = false;
  }
}

async function disconnectFromServer() {
  if (!selectedServer.value) return;

  try {
    await mcpStore.disconnectServer(selectedServer.value.id);
    goBack();
  } catch (err: any) {
    error.value = 'Failed to disconnect: ' + err.message;
  }
}

// Shopify helper methods
function getShopifyAuthLabel(): string {
  switch (shopifyAuthMethod.value) {
    case 'bearer_token':
      return 'Access Token';
    case 'api_key':
      return 'API Key';
    default:
      return 'Authentication';
  }
}

function closeModal() {
  selectedServer.value = null;
  showApiKeyInput.value = false;
  showCustomServerForm.value = false;
  editingCustomServer.value = null;
  error.value = null;
  connectionSuccess.value = false;
  apiKey.value = '';
  customSystemPrompt.value = '';
  shopifyDomain.value = '';
  shopifyAuthMethod.value = 'none';
  showAllServers.value = false;
  resetCustomServerForm();
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
</script>


<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal" @keydown="handleKeydown" tabindex="0">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <button v-if="showApiKeyInput || showCustomServerForm" class="back-button" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h2>
            <span v-if="showApiKeyInput">Connect to {{ selectedServer?.name }}</span>
            <span v-else-if="showCustomServerForm">{{ editingCustomServer ? 'Edit' : 'Add' }} Custom Server</span>
            <span v-else>Connect MCP Servers</span>
          </h2>
        </div>
        <button class="close-button" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Custom Server Form -->
      <div v-if="showCustomServerForm" class="modal-body">
        <div class="description">
          <p>{{ editingCustomServer ? 'Edit your custom MCP server configuration.' : 'Add a new custom MCP server with your own URL and authentication settings.' }}</p>
        </div>

        <form @submit.prevent="saveCustomServer" class="custom-server-form">
          <div class="form-row">
            <div class="input-group">
              <label for="serverName">Server Name *</label>
              <input
                id="serverName"
                v-model="customServerForm.name"
                type="text"
                placeholder="My Custom Server"
                required
              />
            </div>
            
            <div class="input-group">
              <label for="serverIcon">Icon</label>
              <input
                id="serverIcon"
                v-model="customServerForm.icon"
                type="text"
                placeholder="🔗"
                maxlength="2"
              />
            </div>
          </div>

          <div class="input-group">
            <label for="serverDescription">Description *</label>
            <textarea
              id="serverDescription"
              v-model="customServerForm.description"
              rows="2"
              placeholder="What does this server do?"
              required
            ></textarea>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label for="serverCategory">Category</label>
              <select id="serverCategory" v-model="customServerForm.category">
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>

          <div class="input-group">
            <label for="connectionUrl">Connection URL *</label>
            <input
              id="connectionUrl"
              v-model="customServerForm.connectionUrl"
              type="url"
              placeholder="https://api.example.com/mcp"
              required
            />
            <small class="input-help">The MCP server endpoint URL</small>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label for="authMethod">Authentication Method</label>
              <select id="authMethod" v-model="customServerForm.authMethod">
                <option v-for="method in authMethods" :key="method.value" :value="method.value">
                  {{ method.label }}
                </option>
              </select>
            </div>

            <div v-if="customServerForm.authMethod !== 'none'" class="input-group">
              <label for="authLabel">Authentication Label</label>
              <input
                id="authLabel"
                v-model="customServerForm.authLabel"
                type="text"
                placeholder="API Key"
              />
              <small class="input-help">Label for the authentication field</small>
            </div>
          </div>

          <div class="input-group">
            <label>Features</label>
            <div class="features-input">
              <div class="add-feature">
                <input
                  v-model="newFeature"
                  type="text"
                  placeholder="Add a feature..."
                  @keydown.enter.prevent="addFeature"
                />
                <button type="button" @click="addFeature" :disabled="!newFeature.trim()">
                  Add
                </button>
              </div>
              <div v-if="customServerForm.features.length > 0" class="features-list">
                <div v-for="(feature, index) in customServerForm.features" :key="index" class="feature-item">
                  <span>{{ feature }}</span>
                  <button type="button" @click="removeFeature(index)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="goBack">
              Cancel
            </button>
            <button type="submit" class="save-button" :disabled="!isCustomServerFormValid">
              {{ editingCustomServer ? 'Update Server' : 'Add Server' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Server Selection -->
      <div v-else-if="!showApiKeyInput" class="modal-body">
        <div class="description">
          <p>Connect to MCP (Model Context Protocol) servers to extend your AI's capabilities with external tools and data sources.</p>
        </div>

        <!-- Connected Servers -->
        <div v-if="mcpStore.connectedServers.length > 0" class="connected-section">
          <h3>Connected Servers</h3>
          <div class="server-grid">
            <div 
              v-for="config in mcpStore.connectedServers" 
              :key="config.id"
              class="server-card connected"
              @click="selectServer(config)"
            >
              <div class="server-icon">{{ config.icon }}</div>
              <div class="server-info">
                <h4>{{ config.name }}</h4>
                <p>{{ config.description }}</p>
                <div class="server-status">
                  <span class="status-dot connected"></span>
                  <span>Connected</span>
                </div>
              </div>
              <div v-if="config.isCustom" class="server-actions">
                <button class="edit-button" @click.stop="editCustomServer(config)" title="Edit Server">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Servers -->
        <div class="available-section">
          <div class="section-header">
            <h3>{{ showAllServers ? 'All Servers' : 'Popular Servers' }}</h3>
            <div class="header-actions">
              <button class="toggle-button" @click="showAllServers = !showAllServers">
                {{ showAllServers ? 'Show Popular' : 'Show All' }}
              </button>
            </div>
          </div>
          
          <div class="server-grid">
            <div 
              v-for="config in displayedServers" 
              :key="config.id"
              class="server-card"
              :class="{ connected: config.connection?.isConnected }"
              @click="selectServer(config)"
            >
              <div class="server-icon">{{ config.icon }}</div>
              <div class="server-info">
                <h4>{{ config.name }}</h4>
                <p>{{ config.description }}</p>
                <div class="server-meta">
                  <span class="category">{{ config.category }}</span>
                  <span v-if="config.apiKeyRequired" class="api-key-required">
                    {{ config.authLabel || 'Auth Required' }}
                  </span>
                </div>
                <div class="server-features">
                  <span v-for="feature in config.features.slice(0, 2)" :key="feature" class="feature-tag">
                    {{ feature }}
                  </span>
                  <span v-if="config.features.length > 2" class="feature-more">
                    +{{ config.features.length - 2 }} more
                  </span>
                </div>
              </div>
              <div v-if="config.isCustom" class="server-actions">
                <button class="edit-button" @click.stop="editCustomServer(config)" title="Edit Server">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="delete-button" @click.stop="deleteCustomServer(config.id)" title="Delete Server">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- API Key Input -->
      <div v-else class="modal-body">
        <div class="server-details">
          <div class="server-header">
            <div class="server-icon large">{{ selectedServer?.icon }}</div>
            <div class="server-title">
              <h3>{{ selectedServer?.name }}</h3>
              <p>{{ selectedServer?.description }}</p>
              <div v-if="selectedServer?.connectionUrl" class="connection-url">
                <span>URL: {{ selectedServer.connectionUrl }}</span>
              </div>
            </div>
          </div>

          <div class="connection-status" v-if="isServerConnected">
            <div class="status-indicator connected">
              <span class="status-dot"></span>
              <span>Already Connected</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="connectToServer" class="connection-form">
          <!-- Shopify Custom Fields -->
          <div v-if="selectedServer?.id === 'shopify'" class="shopify-custom-fields">
            <!-- Domain Input -->
            <div class="input-group">
              <label for="shopifyDomain">Shopify Domain *</label>
              <input
                id="shopifyDomain"
                v-model="shopifyDomain"
                type="text"
                placeholder="your-store.myshopify.com"
                :disabled="isConnecting"
                required
              />
              <small class="input-help">
                Enter your Shopify store domain (e.g., mystore.myshopify.com)
              </small>
            </div>

            <!-- Authentication Method -->
            <div class="input-group">
              <label for="shopifyAuthMethod">Authentication Method</label>
              <select id="shopifyAuthMethod" v-model="shopifyAuthMethod" :disabled="isConnecting">
                <option value="none">No Authentication</option>
                <option value="bearer_token">Bearer Token</option>
                <option value="api_key">API Key</option>
              </select>
              <small class="input-help">
                Choose how to authenticate with your Shopify store
              </small>
            </div>

            <!-- API Key/Token Input (conditional) -->
            <div v-if="shopifyAuthMethod !== 'none'" class="input-group">
              <label for="shopifyApiKey">{{ getShopifyAuthLabel() }}</label>
              <input
                id="shopifyApiKey"
                v-model="apiKey"
                type="password"
                :placeholder="`Enter your ${getShopifyAuthLabel().toLowerCase()}...`"
                :disabled="isConnecting"
                required
              />
              <small class="input-help">
                This {{ getShopifyAuthLabel().toLowerCase() }} will be used to authenticate with your Shopify store.
              </small>
            </div>
          </div>

          <!-- Standard API Key Input for other servers -->
          <div v-else-if="selectedServer?.apiKeyRequired" class="input-group">
            <label for="apiKey">{{ selectedServer?.authLabel || 'API Key' }}</label>
            <input
              id="apiKey"
              v-model="apiKey"
              type="password"
              :placeholder="`Enter your ${selectedServer?.authLabel?.toLowerCase() || 'API key'}...`"
              :disabled="isConnecting"
              required
            />
            <small class="input-help">
              This {{ selectedServer?.authLabel?.toLowerCase() || 'API key' }} will be used to authenticate with {{ selectedServer?.name }}.
            </small>
          </div>

          <!-- System Prompt -->
          <div class="input-group system-prompt-hidden">
            <label for="systemPrompt">System Prompt (Optional)</label>
            <textarea
              id="systemPrompt"
              v-model="customSystemPrompt"
              rows="8"
              placeholder="Enter custom system prompt or leave blank for default..."
              :disabled="isConnecting"
            ></textarea>
            <small class="input-help">
              This prompt will be added to the AI's system instructions when using {{ selectedServer?.name }}.
            </small>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {{ error }}
          </div>

          <!-- Connection Success -->
          <div v-if="connectionSuccess" class="success-status">
            <div class="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="status-text">
              <strong>Successfully connected to {{ selectedServer?.name }}!</strong>
              <small>Server endpoint validated and configuration saved. Closing in a moment...</small>
            </div>
          </div>

          <!-- Connection Status -->
          <div v-if="isConnecting" class="connection-status">
            <div class="loading-spinner"></div>
            <div class="status-text">
              <strong>Pinging {{ selectedServer?.name }} server...</strong>
              <small>Validating API credentials with the actual server endpoint. This may take a few seconds.</small>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button v-if="isServerConnected" type="button" class="disconnect-button" @click="disconnectFromServer">
              Disconnect
            </button>
            <button type="submit" class="connect-button" :disabled="isConnecting || (selectedServer?.apiKeyRequired && !apiKey.trim())">
              <span v-if="isConnecting">
                <div class="button-spinner"></div>
                Connecting...
              </span>
              <span v-else>{{ isServerConnected ? 'Update Connection' : 'Connect' }}</span>
            </button>
          </div>
        </form>
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
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to right, rgba(0, 163, 255, 0.05), transparent);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.back-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
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

.description {
  margin-bottom: var(--space-4);
}

.description p {
  color: var(--color-text-secondary);
  margin: 0;
}

.connected-section {
  margin-bottom: var(--space-6);
}

.available-section {
  margin-bottom: var(--space-4);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.section-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.add-custom-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.add-custom-button:hover {
  background: var(--color-primary-hover);
}

.toggle-button {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  cursor: pointer;
}

.toggle-button:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.server-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-3);
}

.server-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  gap: var(--space-3);
  position: relative;
}

.server-card:hover {
  border-color: rgba(0, 163, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 163, 255, 0.1);
}

.server-card.connected {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.05);
}

.server-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.server-icon.large {
  font-size: 2.5rem;
  width: 64px;
  height: 64px;
}

.server-info {
  flex: 1;
  min-width: 0;
}

.server-info h4 {
  margin: 0 0 var(--space-1);
  font-size: 1rem;
  font-weight: 600;
}

.server-info p {
  margin: 0 0 var(--space-2);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.server-meta {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.category {
  background: rgba(0, 163, 255, 0.1);
  color: var(--color-primary);
  padding: 2px var(--space-1);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.api-key-required {
  background: rgba(255, 193, 7, 0.1);
  color: #f59e0b;
  padding: 2px var(--space-1);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.server-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.feature-tag {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  padding: 2px var(--space-1);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.feature-more {
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
  font-style: italic;
}

.server-status {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.875rem;
  color: var(--color-success);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
}

.status-dot.connected {
  background: var(--color-success);
}

.server-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  position: absolute;
  top: var(--space-2);
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

.server-details {
  margin-bottom: var(--space-4);
}

.server-header {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.server-title h3 {
  margin: 0 0 var(--space-1);
  font-size: 1.25rem;
  font-weight: 600;
}

.server-title p {
  margin: 0 0 var(--space-1);
  color: var(--color-text-secondary);
}

.connection-url {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
  font-family: monospace;
  background: var(--color-bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  word-break: break-all;
}

.connection-status {
  margin-bottom: var(--space-3);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}

.status-indicator.connected {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.connection-form, .custom-server-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.input-group label {
  font-weight: 500;
  color: var(--color-text-primary);
}

.input-group input,
.input-group textarea,
.input-group select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  font-family: inherit;
  transition: border-color var(--transition-normal);
}

.input-group input:focus,
.input-group textarea:focus,
.input-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-group textarea {
  resize: vertical;
  min-height: 120px;
  font-family: monospace;
  font-size: 0.875rem;
}

.input-help {
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
}

.features-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.add-feature {
  display: flex;
  gap: var(--space-2);
}

.add-feature input {
  flex: 1;
}

.add-feature button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.add-feature button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.feature-item button {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--radius-sm);
}

.feature-item button:hover {
  color: var(--color-error);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--color-error, #ef4444);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
  font-size: 0.875rem;
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.error-message svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.connection-status {
  background: rgba(0, 163, 255, 0.1);
  border: 1px solid rgba(0, 163, 255, 0.3);
  color: var(--color-primary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.status-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.status-text strong {
  font-weight: 600;
  font-size: 0.875rem;
}

.status-text small {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 163, 255, 0.2);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

.button-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: var(--space-1);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.connect-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.connect-button span {
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.connect-button, .save-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.connect-button:hover:not(:disabled), .save-button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.disconnect-button, .cancel-button {
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.cancel-button {
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.disconnect-button:hover {
  background: var(--color-error);
  color: white;
}

.cancel-button:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* Hide system prompt section */
.system-prompt-hidden {
  display: none !important;
}

/* Shopify custom fields */
.shopify-custom-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.shopify-custom-fields .input-group {
  margin-bottom: 0;
}

/* Mobile styles */
@media (max-width: 767px) {
  .modal-overlay {
    padding: var(--space-2);
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .server-grid {
    grid-template-columns: 1fr;
  }
  
  .server-header {
    flex-direction: column;
    text-align: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
    gap: var(--space-1);
  }
}

.success-status {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: var(--color-success, #22c55e);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.success-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--color-success, #22c55e);
}
</style> 