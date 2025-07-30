<template>
  <div class="chat-header">
    <div class="chat-header-left">
      <!-- <h2>{{ title }}</h2> -->
      <!-- Dropdown Menu Trigger -->
      <div class=" bot-name-dropdown dropdown-container" id="botNameDropdown" ref="dropdownRef">
        <div class="" title="More actions">
          {{botStore.botName}} 
          <!-- <i class="pi pi-angle-down" style="font-size: 10px; margin-left: 3px;"></i> -->
        </div>
        <div v-if="showBotNameDropdown" class="dropdown-content">
          <button class="dropdown-item" @click="toggleTheme">
            <i :class="themeStore.theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'" style="font-size: 18px;"></i>
            <span>{{ themeStore.theme === 'light' ? 'Night Theme' : 'Light Theme' }}</span>
          </button>
        </div>
      </div>
      <!-- <div @click="handleReset('new')">
         <button class="btn icon-button" :disabled="chatStore.chats[0].messages.length < 2" title="New Chat">
          <i class="pi pi-plus" style="font-size: 15px; "></i>
        </button>
      </div> -->
    </div>
    <div class="chat-actions" >  
      <!-- Deploy/Test AI Buttons -->
      <button 
        class="action-button deploy-button"
        @click="deployAI"
        :disabled="isDeployingAI || !hasPromptContent || chatStore.isAIPromptGenerating"
        :title="!hasPromptContent ? 'Generate prompt content first' : 'Deploy your AI agent'"
      >
        <div class="button-content">
          <i v-if="!isDeployingAI"  class="pi pi-play"></i>
          <div v-else class="loading-spinner"></div>
          <span>{{ isDeployingAI ? 'Deploying...' : 'Deploy Agent' }}</span>
        </div>
      </button>
      <button 
        class="action-button test-button"
        @click="testAI"
        :disabled="isDeployingAI || !hasPromptContent || chatStore.isAIPromptGenerating"
        :title="!hasPromptContent ? 'Generate prompt content first' : 'Test your AI agent'"
      >
        <div class="button-content">
          <i class="pi pi-wrench"></i>
          <span>Test Agent</span>
        </div>
      </button>


      <!-- Dropdown Menu Trigger -->
      <div class="dropdown dropdown-container" id="moreActionsDropdown" ref="dropdownRef">
        <button class="icon-button" title="More actions">
          <i class="pi pi-ellipsis-v" style="font-size: 22px;"></i>
        </button>
        <div v-if="showDropdown" class="dropdown-content">
          <button class="dropdown-item" @click="toggleTheme">
            <i :class="themeStore.theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'" style="font-size: 18px;"></i>
            <span>{{ themeStore.theme === 'light' ? 'Night Theme' : 'Light Theme' }}</span>
          </button>
          <button class="dropdown-item" @click="handleAIPrompt">
            <i class="pi pi-bolt" style="font-size: 18px;"></i>
            <span>AI Prompt</span>
          </button>
          <button :disabled="chatStore.chats[0].messages.length < 2"  class="btn dropdown-item" @click="handleReset('reset')">
            <i class="pi pi-replay" style="font-size: 18px;"></i>
            <span>Clear Conversation</span>
          </button>
        </div>
      </div>
      <!-- Profile Dropdown -->
      <div class="dropdown" ref="profileDropdownRef">
        <button class="icon-button profile-button" @click="toggleProfileDropdown" title="Profile">
          <div class="profile-avatar">
            <img 
              v-if="authStore.user?.avatar" 
              :src="authStore.user.avatar" 
              :alt="authStore.fullName"
              class="avatar-image"
            />
            <i v-else class="pi pi-user"></i>
          </div>
        </button>
        <div v-if="showProfileDropdown" class="dropdown-content">
          <div class="user-info-section">
            <div class="user-name">{{ authStore.fullName || 'User' }}</div>
            <div class="user-email">{{ authStore.user?.email || '' }}</div>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click="openEditProfile">
            <i class="pi pi-user-edit" style="font-size: 18px;"></i>
            <span>Edit Profile</span>
          </button>
          <button class="dropdown-item danger" @click="handleLogout">
            <i class="pi pi-sign-out" style="font-size: 18px;"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
    <CalendlyModal ref="bookMeetingRef"></CalendlyModal>
  </div>

  <!-- Edit Profile Modal -->
  <EditProfileModal 
    :isVisible="showEditProfileModal" 
    @close="showEditProfileModal = false"
    @updated="() => showEditProfileModal = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { botsifyApi } from '@/services/botsifyApi';
import { BOTSIFY_WEB_URL } from '@/utils/config';
import { useChatStore } from '@/stores/chatStore';
import { useWhitelabelStore } from '@/stores/whitelabelStore';
import { useBotStore } from '@/stores/botStore';
import { useRoleStore } from '@/stores/roleStore';
import CalendlyModal from '@/components/ui/CalendlyModal.vue';

import EditProfileModal from '@/components/auth/EditProfileModal.vue';

interface Props {
  chatId: string,
  title: string;
  hasPromptContent: boolean;
  latestPromptContent: string;
}

const props = defineProps<Props>();
const chatStore = useChatStore();
const botStore = useBotStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const showDropdown = ref(false);

const showProfileDropdown = ref(false);
const showEditProfileModal = ref(false);
const profileDropdownRef = ref<HTMLDivElement | null>(null);

const showBotNameDropdown = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);
const lastOpenedDropdownId = ref<string | undefined>('');
const bookMeetingRef = ref<InstanceType<typeof CalendlyModal> | null>(null)

const emit = defineEmits<{
  toggleStorySidebar: [];
}>();

const isDeployingAI = ref(false);
const whitelabelStore = useWhitelabelStore();
const roleStore = useRoleStore();


function toggleTheme() {
  themeStore.setTheme(themeStore.theme === 'light' ? 'dark' : 'light');
}

function handleAIPrompt() {
  emit('toggleStorySidebar');
}

async function testAI() {
  if (!props.hasPromptContent) {
    window.$toast.error('No prompt content available to deploy. Please generate some content first.');
    return;
  }
  const apiKey = botStore.apiKey;

  let url = `https://${BOTSIFY_WEB_URL}/web-bot/agent/${apiKey}?testagent=true`;
  if (whitelabelStore.isWhitelabelClient && whitelabelStore.maskUrl) {
    url = `${whitelabelStore.maskUrl}/web-bot/agent/${botStore.apiKey}?testagent=true`;

  }
  window.open(url, '_blank');
}

function deployAI() {

  if (!roleStore.hasSubscription) {

    bookMeetingRef.value?.openModal();
    return;
  }

  if (!props.hasPromptContent) {
    window.$toast.error('No prompt content available to deploy. Please generate some content first.');
    return;
  }
  window.$confirm({

    // text: "Do you really want to deploy your AI agent? This will make it available for use.",

    confirmButtonText: "Yes, Deploy it!",
    cancelButtonText: "No, Cancel",
    animation: false,
  }, async () => {
    await deploying(props.latestPromptContent);
  });
}

async function deploying(content: string){
  isDeployingAI.value = true;
  try {
    const result = await botsifyApi.deployAiAgent(
      chatStore.activeAiPromptVersion?.version_id ?? 0,
      chatStore.createAiPromptVersionName()
    );
    if (result.success) {
      window.$toast.success(`🚀 ${result.message}`);
      chatStore.updateStory(props.chatId, content, true);
      chatStore.updateActivePromptVersionId(result.data.version.id);
    } else {
      window.$toast.error(`Deployment failed: ${result.message}`);
    }
  } catch (error) {
    window.$toast.error('An unexpected error occurred during deployment.');
  } finally {
    isDeployingAI.value = false;
  }
}

function handleReset(type: string) {
  let confirmButtonText = 'Yes';
  if (type === 'reset') {
    confirmButtonText += ' clear it!';
  }
  window.$confirm({
    confirmButtonText: confirmButtonText,
    text: "Clearing the conversation is irreversible!"
  }, async() => {
    chatStore.clearChatMessages()
  });
}

function toggleProfileDropdown() {
  showProfileDropdown.value = !showProfileDropdown.value;
  if (showProfileDropdown.value) {
    showDropdown.value = false; // Close other dropdown
  }
}

function openEditProfile() {
  showEditProfileModal.value = true;
  showProfileDropdown.value = false;
}

function handleLogout() {
  showProfileDropdown.value = false;
  window.$confirm({
    confirmButtonText: "Yes, Logout!",
    text: "Are you sure you want to logout?"
  }, async() => {
    authStore.logout();
  });
}

function handleClickOutside(event: Event) {
  closeAllDropdowns();

  const target = event.target as HTMLElement;
  const currentSelectedDropdownId = target.closest('.dropdown-container')?.id;

  if (lastOpenedDropdownId.value !== currentSelectedDropdownId) {
    if (target.closest('#botNameDropdown')) {
      showBotNameDropdown.value = !showBotNameDropdown.value;
    }else if (target.closest('#moreActionsDropdown')) {
      showDropdown.value = !showDropdown.value;
    }
    lastOpenedDropdownId.value = currentSelectedDropdownId;
  }else{
    lastOpenedDropdownId.value = '';

  }
  if (showProfileDropdown.value && profileDropdownRef.value && !profileDropdownRef.value.contains(target)) {
    showProfileDropdown.value = false;
  }
}


function closeAllDropdowns() {
  showBotNameDropdown.value = false;
  showDropdown.value = false;
}

// Add/remove event listener when dropdown is toggled
watch([showDropdown, showProfileDropdown], ([newDropdownVal, newProfileDropdownVal]) => {
  if (newDropdownVal || newProfileDropdownVal) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// Clean up on component unmount
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// function handleMouseLeave() {
//   setTimeout(() => {
//     showDropdown.value = false;
//   }, 5000); // 100ms delay
// }
</script>

<style scoped>
.chat-header {
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-bg-secondary);
  /* z-index: var(--z-sticky); */
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* border-radius: var(--radius-lg) var(--radius-lg) 0 0; */
  box-shadow: 0 4px 15px rgba(0, 163, 255, 0.08);
  border: 1px solid rgba(0, 163, 255, 0.1);
}

.chat-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.chat-header-left {
  display: flex;
  gap: 5px;
}

.icon-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.bot-name-dropdown .icon-button {
  width: max-content;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-normal);
  cursor: pointer;
  border: none;
  height: 50px;
  min-height: 40px;
  max-height: 40px;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.test-button {
  background-color: var(--color-warning);
  color: white;
}

.test-button:hover:not(:disabled) {
  background-color: var(--color-warning-hover, #e6a700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.deploy-button {
  background-color: var(--color-success);
  color: white;
}

.deploy-button:hover:not(:disabled) {
  background-color: var(--color-success-hover, #16a34a);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  top: 110%;
  background-color: var(--color-bg-primary);
  min-width: 210px;
  box-shadow: var(--shadow-md), 0 4px 15px rgba(0, 163, 255, 0.08);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 163, 255, 0.1);
  z-index: var(--z-dropdown);
  overflow: hidden;
  padding: var(--space-2) 0;
  padding: 5px;
}

#botNameDropdown .dropdown-content {
  left: 0%
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  text-align: left;
  padding: var(--space-2) var(--space-4);
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background-color var(--transition-fast);
}


.btn:disabled {
  color: gray;
  cursor: not-allowed;
}

.dropdown-item:hover {
  background-color: rgba(98, 0, 255, 0.05);
  background-image: linear-gradient(to right, rgba(153, 0, 255, 0.08), transparent 80%);
}

.dropdown-item.danger {
  color: var(--color-error);
}

.dropdown-item.danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* Profile Button and Dropdown Styles */
.profile-button {
  padding: var(--space-1);
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--color-border);
}

.profile-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-full);
}

.profile-avatar i {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.profile-button:hover .profile-avatar {
  border-color: var(--color-primary);
}

.user-info-section {
  padding: var(--space-3) var(--space-4);
}

.user-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  margin-bottom: var(--space-1);
}

.user-email {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: var(--space-2) 0;
}
</style> 