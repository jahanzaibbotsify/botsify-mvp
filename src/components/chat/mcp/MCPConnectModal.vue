<script setup lang="ts">
import {PropType, ref, watch, onMounted, computed} from 'vue'
import axios from "axios";
import ToolsList from "./ToolsList.vue";
import {botsifyApi} from "@/services/botsifyApi.ts";
import {useMCPStore} from "@/stores/mcpStore.ts";
import {useBotStore} from "@/stores/botStore.ts";
import { Button } from '@/components/ui';

const props = defineProps({
  server: {
    type: Object as PropType<Record<string, any> | null>,
    default: null
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  systemPrompt: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['close', 'connect', 'quit']);

const mcpStore = useMCPStore();
const description = ref('');
const serverUrl = ref('');
const serverLabel = ref('');
const apiKey = ref('')
const showApiKey = ref(false)
const authType = ref('none');
const file = ref(null);
const isConnecting = ref(false);
const error = ref<string | null>(null);
const alreadyConnected = ref(false);
const connectedServerId = ref<string | null>(null);
const authMethods = [
  {value: 'none', label: 'No Authentication'},
  {value: 'api_key', label: 'API Key'},
  {value: 'bearer_token', label: 'Bearer Token'},
  {value: 'basic_auth', label: 'Basic Authentication'},
  {value: 'oauth', label: 'OAuth Token'},
  {value: 'custom_headers', label: 'Custom Headers'},
];
const serverTools = ref([]);
const customHeaders = ref([{key: '', value: ''}]);
const connectedServers = computed(() => mcpStore.connectedServers);

/**
 * Check if server is already connected and pre-fill form
 */
const checkAndPreFillConnectedServer = () => {
  if (!props.server) return;

  const connectedServer: any = connectedServers.value.find((connectedServer: any) =>
      connectedServer.setting?.server_label === props.server?.name?.toLowerCase().replace(/\s+/g, '_') ||
      connectedServer.setting?.server_label === props.server?.id
  );

  if (connectedServer) {
    alreadyConnected.value = true;
    connectedServerId.value = connectedServer.id;
    /**
     * Pre-fill the form with existing connection data
     */
    apiKey.value = connectedServer.setting?.apikey || '';
    description.value = connectedServer.setting?.server_description || '';
    authType.value = connectedServer.setting?.auth_method || props.server?.authMethod || 'none';
    serverUrl.value = connectedServer.setting?.server_url || '';

    /**
     * For custom servers, also pre-fill URL and label
     */
    if (props.isCustom) {
      serverUrl.value = connectedServer.setting?.server_url || '';
      serverLabel.value = connectedServer.setting?.server_label || '';
    }
  }
};

/**
 * Check if the current server is already connected
 */
const isServerConnected = () => {
  if (!props.server) return false;

  return connectedServers.value.some((connectedServer: any) =>
      connectedServer.setting?.server_label === props.server?.name?.toLowerCase().replace(/\s+/g, '_') ||
      connectedServer.setting?.server_label === props.server?.id
  );
};

/**
 * Add a new custom header
 */
const addHeader = () => {
  customHeaders.value.push({key: '', value: ''})
}

/**
 * Remove a custom header by index
 * @param index
 */
const removeHeader = (index: number) => {
  customHeaders.value.splice(index, 1)
}

const handleFileChange = (e: any) => {
  file.value = e.target.files[0];

  if (file.value && props.server && props.server.id === 'google-sheet') {
    const reader = new FileReader();

    reader.onload = function (e: any) {
      const jsonText = e.target.result;
      apiKey.value = btoa(jsonText);
    };

    reader.readAsText(file.value);
  }
}

/**
 * Get the label for the authentication type
 * @param type
 */
const getAuthLabel = (type: string) => {
  const method = authMethods.find(m => m.value === type);
  if (props.server && !props.server.isCustom) {
    return props.server.authLabel;
  }
  return method ? method.label : '';
}

/**
 * Watch for server prop changes to update authType
 */
watch(
    () => props.server ? props.server.authMethod : undefined,
    (newAuthMethod) => {
      authType.value = newAuthMethod || 'none';
      /**
       * Check if server is already connected when server prop changes
       */
      checkAndPreFillConnectedServer();
    },
    {immediate: true}
);


/**
 * Handle back button click
 */
function handleBack() {
  emit('close')
}

/**
 * Check connection to the server
 * This function is used to validate the connection to the MCP server
 */
async function checkConnection() {
  error.value = ''
  isConnecting.value = true;
  let url: string;
  if (props.server && props.server.id === 'shopify') {
    url = (serverUrl.value.endsWith('/') ? serverUrl.value.slice(0, -1) : serverUrl.value) + (alreadyConnected.value ? '' : '/api/mcp');
  } else {
    url = props.server ? props.server.server_url : serverUrl.value;
  }
  await axios.post('https://mcp.botsify.com/mcp/list_actions', {
    server_url: url,
    headers: buildMCPHeaders(),
  }).then(res => {
    serverTools.value = res.data?.tools.map((item: any) => {
      item.isEnabled = true
      return item;
    });
  }).catch(err => {
    console.error('Connection error:', err);
    if (err?.response?.data?.error.includes('401')) {
      error.value = "Unauthorized: Please check your API key or authentication method."
    } else if (err?.response?.data?.error.includes('404')) {
      error.value = "Server not found. Please check the MCP server URL and try again."
    } else if (err?.response?.data?.error.includes('fetch failed')) {
      error.value = "We couldn't reach the MCP server. Make sure it's running and the URL is correct."
    } else {
      error.value = err?.response?.data?.error || err?.message || 'Failed to connect to the server';
    }
  }).finally(() => {
    isConnecting.value = false;
  })
}

/**
 * Build headers for MCP connection based on authentication type
 * @returns {Record<string, string>}
 */
function buildMCPHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (authType.value === 'none') {
    return headers;
  }

  if (props.isCustom) {
    if (authType.value === 'custom_headers') {
      customHeaders.value.forEach(header => {
        if (header.key && header.value) {
          headers[header.key.trim()] = header.value.trim();
        }
      });
    } else {
      switch (authType.value) {
        case 'bearer_token':
        case 'api_key':
        case 'oauth':
          headers['Authorization'] = `Bearer ${apiKey.value.trim()}`;
          break;
        case 'basic_auth':
          const encoded = btoa(apiKey.value.trim());
          headers['Authorization'] = `Basic ${encoded}`;
          break;
      }
    }
    return headers;
  }

  if (apiKey.value && apiKey.value.trim() && props.server) {
    switch (authType.value) {
      case 'bearer_token':
        if (props.server.id === 'shopify') {
          headers['X-Shopify-Access-Token'] = apiKey.value.trim();
        } else {
          headers['Authorization'] = `Bearer ${apiKey.value.trim()}`;
        }
        break;
      case 'api_key':
        if (props.server.id === 'stripe') {
          headers['Authorization'] = `Bearer ${apiKey.value.trim()}`;
        } else if (props.server.id === 'github') {
          headers['Authorization'] = `token ${apiKey.value.trim()}`;
        } else if (props.server.id === 'notion') {
          headers['Authorization'] = `Bearer ${apiKey.value.trim()}`;
          headers['Notion-Version'] = '2022-06-28';
        } else if (props.server.id === 'slack') {
          headers['Authorization'] = `Bearer ${apiKey.value.trim()}`;
        } else if (props.server.id === 'shopify') {
          headers['X-Shopify-Access-Token'] = apiKey.value.trim();
          headers['Content-Type'] = 'application/json';
        } else {
          headers['X-API-Key'] = apiKey.value.trim();
        }
        break;
      case 'basic_auth':
        const encoded = btoa(apiKey.value.trim());
        headers['Authorization'] = `Basic ${encoded}`;
        break;
      case 'oauth':
        headers['Authorization'] = `Bearer ${apiKey.value.trim()}`;
        break;
      default:
        headers['X-API-Key'] = apiKey.value.trim();
    }
  }

  return headers;
}

/**
 * Add a new server configuration to the MCP
 * @param allowedTools
 */
const addServer = async (allowedTools: string[]) => {
  let url: string;
  if (props.server && props.server.id === 'shopify') {
    url = (serverUrl.value.endsWith('/') ? serverUrl.value.slice(0, -1) : serverUrl.value) + (alreadyConnected.value ? '' : '/api/mcp');
  } else {
    url = props.server ? props.server.server_url : serverUrl.value;
  }
  const mcpPayload = {
    settings: {
      apikey: apiKey.value,
      type: "mcp",
      server_label: props.server ? (props.server.id || props.server.name?.toLowerCase().replace(/\s+/g, '_')) : serverLabel.value,
      server_url: url,
      server_description: description.value,
      headers: buildMCPHeaders(),
      allowed_tools: allowedTools.map((tool: any) => tool.name),
      require_approval: "never",
      is_custom: props.isCustom,
      auth_method: authType.value,
    },
    apikey: useBotStore().apiKey
  };

  if (alreadyConnected.value && connectedServerId.value) {
    const response = await botsifyApi.updateMCPConfiguration(connectedServerId.value, mcpPayload);
    if (!response.success) {
      error.value = response.message;
    } else {
      emit('quit')
    }
  } else {
    const response = await botsifyApi.sendMCPConfigurationJSON(mcpPayload);
    if (!response.success) {
      error.value = response.message;
    } else {
      const connectedServer = response.data;
      // @ts-ignore
      mcpStore.connectedServers.push(connectedServer)
      if (props.isCustom) {
        mcpStore.servers.push({
          id: connectedServer.id,
          name: connectedServer.setting.server_label,
          description: connectedServer.setting.server_description,
          allowed_tools: connectedServer.setting.allowed_tools,
          server_url: connectedServer.setting.server_url,
          icon: 'custom.svg',
          isCustom: connectedServer.setting.is_custom,
          connectionId: connectedServer.id,
        });
      } else {
        const serverIndex = mcpStore.servers.findIndex((s: any) => s.id === connectedServer.setting.server_label);
        if (serverIndex !== -1) {
          mcpStore.servers[serverIndex].connectionId = connectedServer.id;
        }
      }
      mcpStore.connectedMCPs = mcpStore.connectedServers.length;
      emit('quit');
    }
  }
}

// Check for connected server on mount
onMounted(() => {
  checkAndPreFillConnectedServer();
});
</script>

<template>
  <section @click.self="handleBack" tabindex="0" style="position:relative;">
    <div class="text-center">
      <img
          v-if="server && !server.isCustom"
          class="server-icon"
          :src="`/mcp/${server.icon}`"
          :alt="server.name"
      >
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
      <div class="server-title">Connect to {{ server ? server.name : null }} MCP {{ server ? '' : 'Server' }}</div>

      <!-- Connected Status Indicator -->
      <div v-if="isServerConnected()" class="connected-status">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span>Already Connected</span>
      </div>

      <div v-if="!serverTools.length">
        <div class="pt-20" v-if="server && server.name === 'Shopify'">
          <input type="text" id="shopify-domain" v-model="serverUrl" placeholder="Your Shopify Store Base Domain *"
                 required>
          <div class="text-center pt-5">
            <a class="external-link" target="_blank"
               href="https://www.hulkapps.com/blogs/shopify-hub/how-to-find-your-shopify-domain-a-step-by-step-guide">Get
              Your Shopify Store's Base Domain <i class="pi pi-external-link"></i></a>
          </div>
        </div>
        <div v-if="isCustom">
          <div class="pt-20">
            <input
                type="text"
                v-model="serverUrl"
                id="url"
                placeholder="https://mcp.example.com (required)"
            >
          </div>
          <div class="pt-20">
            <input type="text" v-model="serverLabel" id="label" placeholder="Server Label e.g my_mcp_server">
          </div>
        </div>
        <div class="pt-20">
          <input type="text" v-model="description" id="description" placeholder="Description (optional)">
        </div>
        <div class="auth-select-group pt-20" v-if="isCustom">
          <label class="auth-label" for="authType">
            Authentication
            <span class="info-icon">
            <i class="pi pi-info-circle"></i>
          </span>
          </label>
          <div class="select-wrapper">
            <select id="authType" v-model="authType" class="auth-select">
              <option :value="authMethod.value" v-for="authMethod in authMethods" :key="authMethod.value">
                {{ authMethod.label }}
              </option>
            </select>
            <span class="select-arrow">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L10 12L14 8" stroke="#b0b0b0" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round"
              />
            </svg>
          </span>
          </div>
        </div>
        <div class="pt-20" v-if="server && server.id === 'google-sheet'">
          <input type="file" v-on:change="handleFileChange">
          <div class="header-container pt-5" style="font-size: 11px; text-align: justify; margin: auto;">Hint: Upload
            Google Service Account Key. We’ll handle token generation.
          </div>
        </div>
        <div class="pt-20" v-if="authType !== 'none' && authType !== 'custom_headers'">
          <div class="access-token-input">
          <span class="input-icon input-icon-left">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path
                fill-rule="evenodd" clip-rule="evenodd"
                d="M15 4C12.2386 4 10 6.23858 10 9C10 9.50683 10.0751 9.99431 10.2141 10.4529C10.3211 10.8059 10.225 11.1892 9.96418 11.45L5.14645 16.2678C5.05268 16.3615 5 16.4887 5 16.6213V19H7.37868C7.51129 19 7.63847 18.9473 7.73223 18.8536L8.5 18.0858V16.5C8.5 15.9477 8.94772 15.5 9.5 15.5H11.0858L12.55 14.0358C12.8108 13.775 13.1941 13.6789 13.5471 13.7859C14.0057 13.9249 14.4932 14 15 14C17.7614 14 20 11.7614 20 9C20 6.23858 17.7614 4 15 4ZM8 9C8 5.13401 11.134 2 15 2C18.866 2 22 5.13401 22 9C22 12.866 18.866 16 15 16C14.508 16 14.0269 15.9491 13.5622 15.852L12.2071 17.2071C12.0196 17.3946 11.7652 17.5 11.5 17.5H10.5V18.5C10.5 18.7652 10.3946 19.0196 10.2071 19.2071L9.14645 20.2678C8.67761 20.7366 8.04172 21 7.37868 21H4C3.44772 21 3 20.5523 3 20V16.6213C3 15.9583 3.26339 15.3224 3.73223 14.8536L8.14801 10.4378C8.05092 9.97307 8 9.49204 8 9Z"
                fill="currentColor">

            </path>
              <path
                  d="M17.75 8C17.75 8.9665 16.9665 9.75 16 9.75C15.0335 9.75 14.25 8.9665 14.25 8C14.25 7.0335 15.0335 6.25 16 6.25C16.9665 6.25 17.75 7.0335 17.75 8Z"
                  fill="currentColor">
              </path>
            </svg>
          </span>
            <input
                :type="showApiKey ? 'text' : 'password'"
                v-model="apiKey"
                class="access-input"
                :placeholder="`Enter ${getAuthLabel(authType || (server ? server.authMethod : ''))}`"
            />
            <button
                class="input-icon input-icon-right"
                type="button"
                @click="showApiKey = !showApiKey"
                :aria-label="showApiKey ? 'Hide token' : 'Show token'">
              <svg
                  v-if="showApiKey"
                  viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                <path
                    d="M5.91456 7.59106C4.34202 9.04124 3.28878 10.7415 2.77064 11.6971C2.66597 11.8902 2.66597 12.1098 2.77064 12.3029C3.28878 13.2585 4.34202 14.9588 5.91456 16.4089C7.48207 17.8545 9.50584 19 12.0001 19C14.4944 19 16.5182 17.8545 18.0857 16.4089C19.6582 14.9588 20.7114 13.2585 21.2296 12.3029C21.3343 12.1098 21.3343 11.8902 21.2296 11.6971C20.7114 10.7415 19.6582 9.04124 18.0857 7.59105C16.5182 6.1455 14.4944 5 12.0001 5C9.50584 5 7.48207 6.1455 5.91456 7.59106ZM4.5587 6.1208C6.36071 4.45899 8.84593 3 12.0001 3C15.1543 3 17.6395 4.45899 19.4415 6.1208C21.2385 7.77798 22.4153 9.68799 22.9878 10.7438C23.4149 11.5315 23.4149 12.4685 22.9878 13.2562C22.4153 14.312 21.2385 16.222 19.4415 17.8792C17.6395 19.541 15.1543 21 12.0001 21C8.84593 21 6.36071 19.541 4.5587 17.8792C2.76171 16.222 1.5849 14.312 1.01244 13.2562C0.585372 12.4685 0.585371 11.5315 1.01244 10.7438C1.5849 9.688 2.76171 7.77798 4.5587 6.1208ZM12.0001 9.5C10.6194 9.5 9.50011 10.6193 9.50011 12C9.50011 13.3807 10.6194 14.5 12.0001 14.5C13.3808 14.5 14.5001 13.3807 14.5001 12C14.5001 10.6193 13.3808 9.5 12.0001 9.5ZM7.50011 12C7.50011 9.51472 9.51483 7.5 12.0001 7.5C14.4854 7.5 16.5001 9.51472 16.5001 12C16.5001 14.4853 14.4854 16.5 12.0001 16.5C9.51483 16.5 7.50011 14.4853 7.50011 12Z"></path>
              </svg>
              <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                  viewBox="0 0 24 24">
                <path
                    fill-rule="evenodd"
                    d="M2.293 2.293a1 1 0 0 1 1.414 0l18 18a1 1 0 0 1-1.414 1.414l-2.514-2.514C16.204 20.24 14.274 21 12 21c-3.154 0-5.64-1.459-7.441-3.12-1.797-1.658-2.974-3.568-3.547-4.624a2.625 2.625 0 0 1 0-2.513c.578-1.065 1.78-3.017 3.624-4.693L2.293 3.707a1 1 0 0 1 0-1.414Zm3.759 5.173c-1.645 1.473-2.745 3.241-3.281 4.23a.625.625 0 0 0 0 .607c.518.955 1.57 2.656 3.143 4.106C7.482 17.855 9.506 19 12 19c1.65 0 3.09-.5 4.33-1.256l-1.934-1.934A4.502 4.502 0 0 1 8.19 9.604L6.052 7.466Zm3.62 3.62 3.242 3.242a2.5 2.5 0 0 1-3.242-3.242Zm.551-5.886c.56-.128 1.152-.2 1.777-.2 2.494 0 4.518 1.146 6.086 2.591 1.572 1.45 2.625 3.15 3.144 4.106a.627.627 0 0 1-.002.608 17.316 17.316 0 0 1-1.344 2.095 1 1 0 0 0 1.6 1.2 19.327 19.327 0 0 0 1.503-2.342 2.627 2.627 0 0 0 0-2.514c-.572-1.056-1.749-2.966-3.546-4.623C17.64 4.459 15.154 3 12 3c-.779 0-1.52.09-2.223.25a1 1 0 0 0 .446 1.95Z"
                    clip-rule="evenodd"
                >
                </path>
              </svg>
            </button>
          </div>
          <div class="text-center pt-5" v-if="server && server.externalData">
            <a class="external-link" target="_blank" :href="server.externalData.link"> {{ server.externalData.label }}
              <i class="pi pi-external-link"></i></a>
          </div>
        </div>
        <div class="pt-10" v-if="authType === 'custom_headers'">
          <div class="header-container">
            <div
                v-for="(header, index) in customHeaders"
                :key="index"
                class="header-row"
            >
              <input
                  v-model="header.key"
                  placeholder="header"
                  class="header-input"
              />
              <span class="colon">:</span>
              <input
                  v-model="header.value"
                  placeholder="value"
                  class="header-input"
              />
              <button @click="removeHeader(index)" class="remove-btn">×</button>
            </div>

            <button @click="addHeader" class="add-header-btn">
              <span>＋</span> Header
            </button>
          </div>
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <div class="button-row">
          <Button variant="secondary" icon="pi pi-arrow-left" @click="handleBack">Back</Button>
          <Button :disabled="isConnecting" :loading="isConnecting" icon="pi pi-moon" @click="checkConnection">
            Connect
          </Button>
        </div>
      </div>
    </div>
    <div>
      <ToolsList
          :tools="serverTools"
          v-if="serverTools?.length"
          @back="serverTools = []"
          @add="addServer"
          :already-connected="alreadyConnected"
      />
    </div>
  </section>
</template>

<style scoped>
.text-center {
  text-align: center;
}

.server-icon {
  width: 56px;
  height: 56px;
  padding: 12px;
  border: 1px solid rgb(0 0 0 / 6%);
  border-radius: 14px;
  box-shadow: 0 .5px 1px rgba(0, 0, 0, .15), 0 5px 12px -4px rgba(0, 0, 0, .08), 0 0 4px 2px rgba(0, 0, 0, .05);
}

.server-title {
  font-size: 18px;
  font-weight: 500;
  margin-top: 12px;
}

.connected-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 200px;
  position: absolute;
  top: 0;
  right: 0;
}

input {
  max-width: 300px;
  width: 100%;
  background: white;
  padding: 10px 12px;
  height: 38px;
}

.pt-20 {
  padding-top: 20px;
}

.access-token-input {
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 0 8px;
  height: 40px;
  max-width: 300px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
}

.access-input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  padding: 0 8px;
  color: var(--color-text-primary);
  height: 38px;
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  color: #b0b0b0;
  cursor: pointer;
}

.input-icon-left {
  margin-right: 4px;
}

.input-icon-right {
  margin-left: 4px;
}

.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px auto 0 auto;
  max-width: 500px;
  width: 100%;
}

.auth-select-group {
  margin: 0 auto;
  max-width: 300px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.auth-label {
  color: var(--color-text-primary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  color: #b0b0b0;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
}

.auth-select {
  width: 100%;
  font-size: 1rem;
  padding: 10px 36px 10px 12px;
  border-radius: 10px;
  border: 1.5px solid #e0e0e0;
  color: var(--color-text-primary);
  margin-top: 2px;
  appearance: none;
  outline: none;
  transition: border-color 0.2s;
}

.auth-select:focus {
  border-color: var(--color-primary);
}

.header-container {
  max-width: 300px;
  margin: 20px auto;
}

.header-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
}

.header-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-right: 5px;
  flex: 1;
}

.colon {
  margin: 0 5px;
  font-weight: bold;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 0 8px;
}

.remove-btn:hover {
  color: #ff4d4f;
}

.add-header-btn {
  width: 100%;
  background-color: #eee;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-header-btn:hover {
  background-color: #ddd;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--color-error);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  max-width: 300px;
  width: 100%;
  margin: 10px auto;
}

.error-message svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.external-link {
  font-size: 12px;
}

.pt-5 {
  padding-top: 5px;
}
</style>