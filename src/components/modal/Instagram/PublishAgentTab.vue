<script setup lang="ts">
import { ref } from "vue";
import { usePublishStore } from "@/stores/publishStore";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'create-new-page': [];
  'refresh-page-permission': [];
  'remove-page-permission': [];
  'connect-account': [];
}>();

const publishStore = usePublishStore();

// Account data - this would come from API in real implementation
const accounts = ref([
  {
    id: '123456789',
    name: 'My Business Account',
    is_bot_account: true,
    status: 'connected',
    botName: 'agent1'
  },
  {
    id: '987654321',
    name: 'Marketing Account',
    is_bot_account: false,
    status: 'disconnected',
    botName: null
  }
]);

const isLoading = ref(false);

// Actions
const createNewAccount = () => {
  // Redirect to Instagram new account creation
  window.open('https://www.instagram.com/accounts/emailsignup/', '_blank');
  emit('create-new-page');
};

const connectAccount = async (accountId: string) => {
  isLoading.value = true;
  try {
    console.log('Connecting account:', accountId);
    // Add actual connect logic here
    // Update account status to connected
    const account = accounts.value.find(a => a.id === accountId);
    if (account) {
      account.is_bot_account = true;
      account.status = 'connected';
      account.botName = 'agent1';
    }
  } catch (error) {
    console.error('Failed to connect account:', error);
  } finally {
    isLoading.value = false;
  }
};

const disconnectAccount = async (accountId: string) => {
  isLoading.value = true;
  try {
    console.log('Disconnecting account:', accountId);
    // Add actual disconnect logic here
    // Update account status to disconnected
    const account = accounts.value.find(a => a.id === accountId);
    if (account) {
      account.is_bot_account = false;
      account.status = 'disconnected';
      account.botName = null;
    }
  } catch (error) {
    console.error('Failed to disconnect account:', error);
  } finally {
    isLoading.value = false;
  }
};

const refreshAccountPermissions = async () => {
  isLoading.value = true;
  try {
    console.log('Refreshing account permissions');
    const result = await publishStore.refreshPagePermission('all');
    
    if (result.success) {
      console.log('Account permissions refreshed successfully');
    } else {
      console.error('Failed to refresh account permissions:', result.error);
    }
  } catch (error) {
    console.error('Failed to refresh account permissions:', error);
  } finally {
    isLoading.value = false;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'var(--color-secondary, #10b981)';
    case 'disconnected':
      return 'var(--color-text-tertiary, #9ca3af)';
    case 'error':
      return 'var(--color-error, #ef4444)';
    default:
      return 'var(--color-text-tertiary, #9ca3af)';
  }
};

// Expose methods for parent component
defineExpose({
  accounts,
  isLoading
});
</script>

<template>
  <div class="tab-panel">
    <h3>Instagram Integration</h3>
    <p class="subtitle">Connect your Instagram accounts to enable Instagram bot functionality</p>

    <!-- Empty State -->
    <div v-if="accounts.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <i class="pi pi-instagram"></i>
        </div>
        <h4>No Instagram Accounts Found</h4>
        <p>Connect your Instagram account to manage your accounts and enable Instagram bot functionality.</p>
        <button 
          class="connect-account-btn"
          @click="emit('connect-account')"
          :disabled="isLoading"
        >
          <i class="pi pi-link"></i>
          Connect Instagram Account
        </button>
      </div>
    </div>

    <!-- Accounts List -->
    <div v-else>
      <!-- Header Actions -->
      <div class="header-actions">
        <button 
          class="refresh-btn"
          @click="refreshAccountPermissions"
          :disabled="isLoading"
        >
          <i class="pi pi-refresh"></i>
          {{ isLoading ? 'Refreshing...' : 'Refresh Accounts' }}
        </button>
        <button 
          class="create-account-btn"
          @click="createNewAccount"
          :disabled="isLoading"
        >
          <i class="pi pi-plus"></i>
          Create New Account
        </button>
      </div>

      <!-- Accounts List -->
      <div class="accounts-list">
        <div 
          v-for="account in accounts" 
          :key="account.id"
          class="account-card"
        >
          <div class="account-info">
            <div class="account-name">{{ account.name }}</div>
            <div class="account-id">ID: {{ account.id }}</div>
            <div v-if="account.is_bot_account && account.botName" class="bot-connection">
              Connected to {{ account.botName }}
            </div>
          </div>
          
          <div class="account-status">
            <span 
              class="status-badge"
              :style="{ backgroundColor: getStatusColor(account.status) }"
            >
              {{ account.status }}
            </span>
          </div>
          
          <div class="account-actions">
            <button 
              v-if="!account.is_bot_account"
              class="action-btn primary"
              @click="connectAccount(account.id)"
              :disabled="isLoading"
            >
              <i class="pi pi-link"></i>
              Connect
            </button>
            
            <button 
              v-else
              class="action-btn secondary"
              @click="disconnectAccount(account.id)"
              :disabled="isLoading"
            >
              <i class="pi pi-unlink"></i>
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

.subtitle {
  margin: 0 0 20px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary, #6b7280);
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h4 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
}

.connect-account-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: var(--color-primary, #3b82f6);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal, 0.2s ease);
}

.connect-account-btn:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.connect-account-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.connect-account-btn i {
  font-size: 12px;
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.refresh-btn,
.create-account-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
}

.refresh-btn:hover:not(:disabled),
.create-account-btn:hover:not(:disabled) {
  background: var(--color-bg-tertiary, #f3f4f6);
  border-color: var(--color-primary, #3b82f6);
}

.refresh-btn:disabled,
.create-account-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn i,
.create-account-btn i {
  font-size: 12px;
}

/* Accounts List */
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  transition: border-color var(--transition-normal, 0.2s ease);
}

.account-card:hover {
  border-color: var(--color-primary, #3b82f6);
}

.account-info {
  flex: 1;
}

.account-name {
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  font-size: 16px;
  margin-bottom: 4px;
}

.account-id {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-bottom: 4px;
}

.bot-connection {
  font-size: 12px;
  color: var(--color-primary, #3b82f6);
  font-weight: 500;
}

.account-status {
  margin-right: 16px;
}

.account-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
}

.action-btn.primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.action-btn.secondary {
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
  border: 1px solid var(--color-border, #e5e7eb);
}

.action-btn.secondary:hover:not(:disabled) {
  background: var(--color-bg-hover, #f1f5f9);
  border-color: var(--color-primary, #3b82f6);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn i {
  font-size: 12px;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
  }
  
  .account-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .account-status {
    margin-right: 0;
  }
  
  .account-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 