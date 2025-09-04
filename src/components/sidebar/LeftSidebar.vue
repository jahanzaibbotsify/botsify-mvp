<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useRoleStore } from '@/stores/roleStore';
import { storeToRefs } from 'pinia'
import { useWhitelabelStore } from '@/stores/whitelabelStore'
import BookMeetingModal from '@/components/modal/BookMeetingModal.vue';
import CalendlyModal from '@/components/modal/CalendlyModal.vue';
import { showZen } from '@/utils/zendesk';
import { useBotStore } from '@/stores/botStore';
import { Button, ManageBilling, Dropdown, DropdownItem } from '../ui';
import { BOTSIFY_WEB_URL } from '@/utils/config';
import { getWebUrl } from '@/utils';

const sidebarStore = useSidebarStore();
const botStore = useBotStore();
const roleStore = useRoleStore();
const router = useRouter();
const route = useRoute();
const whitelabelStore = useWhitelabelStore()
const { isConfigured, companyName, logo, isPortalEnabled } = storeToRefs(whitelabelStore)
// const { width } = useWindowSize();

const emit = defineEmits(['select-button']);
const selectedNavigationButton = computed(() => {
  const currentPath = route.path.toLowerCase();

  const match = navigationButtons.value.find((btn) =>
    currentPath.includes(btn.id.toLowerCase())
  );

  return match?.name || null;
});

const bookMeetingModalRef = ref<InstanceType<typeof BookMeetingModal> | null>(null)
const calendlyModalRef = ref<InstanceType<typeof CalendlyModal> | null>(null)

const navigationButtons = computed(() => {
  const buttons = [
    {
      id: `agent/${botStore.apiKey}`,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM14.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path fill-rule="evenodd" d="M12 1a1 1 0 0 1 1 1v.5h4a3 3 0 0 1 3 3V9a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V5.5a3 3 0 0 1 3-3h4V2a1 1 0 0 1 1-1ZM7 4.5h10a1 1 0 0 1 1 1V9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5.5a1 1 0 0 1 1-1Z" clip-rule="evenodd"></path><path d="M6 21c0-.974.551-1.95 1.632-2.722C8.71 17.508 10.252 17 12 17c1.749 0 3.29.508 4.369 1.278C17.449 19.05 18 20.026 18 21a1 1 0 1 0 2 0c0-1.788-1.016-3.311-2.469-4.35-1.455-1.038-3.414-1.65-5.53-1.65-2.118 0-4.077.611-5.532 1.65C5.016 17.69 4 19.214 4 21a1 1 0 1 0 2 0Z"></path></svg>',
      name: 'Agent',
      permission: 'access_agent_page' as const,
      requiresSubscription: false // Agent is always available
    },
    {
      id: 'data-analysis',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h2v18H3V3Zm6 6h2v12H9V9Zm6-4h2v16h-2V5Zm6 8h-2v8h2v-8Z"/></svg>',
      name: 'Analytics',
      permission: 'view_analytics' as const,
      requiresSubscription: true
    },
    {
      id: `conversation`,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 4a8 8 0 0 0-5.687 13.627 1 1 0 0 1 .147 1.217L5.766 20H12a8 8 0 1 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10H4a1 1 0 0 1-.857-1.515l1.218-2.03A9.964 9.964 0 0 1 2 12Z" clip-rule="evenodd"></path><path d="M9.25 12a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm4 0a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm4 0a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"></path></svg>',
      name: 'Chat',
      permission: 'view_chats_page' as const,
      requiresSubscription: true // Conversation requires subscription
    },
    {
      id: 'users',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M10.5 8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12 5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM3 9.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm1-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm16 2a1 1 0 1 0 0 2 1 1 0 0 1-2 0Zm-3 1a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM8 18c0-.974.438-1.684 1.142-2.185C9.876 15.293 10.911 15 12 15c1.09 0 2.124.293 2.858.815.704.5 1.142 1.21 1.142 2.185a1 1 0 1 0 2 0c0-1.692-.812-2.982-1.983-3.815C14.876 13.373 13.411 13 12 13c-1.41 0-2.876.373-4.017 1.185C6.812 15.018 6 16.308 6 18a1 1 0 1 0 2 0Zm-3.016-3.675a1 1 0 0 1-.809 1.16C2.79 15.732 2 16.486 2 17.5a1 1 0 1 1-2 0c0-2.41 1.978-3.655 3.825-3.985a1 1 0 0 1 1.16.81Zm14.84 1.16a1 1 0 1 1 .351-1.97C22.022 13.845 24 15.09 24 17.5a1 1 0 1 1-2 0c0-1.014-.79-1.768-2.175-2.015Z" clip-rule="evenodd"></path></svg>',
      name: 'Audience',
      permission: 'view_user_attributes' as const,
      requiresSubscription: true // Users requires subscription
    }
  ];

  // Filter buttons based on user permissions and subscription status
  return buttons.filter(button => {
    // Check if user has permission
    const hasPermission = roleStore.hasPermission(button.permission);
    
    // If button doesn't require subscription, only check permission
    return hasPermission;
  });
});

// Help links for the help dropdown
const navLinks = computed(() => {
  // @ts-ignore
  if (isConfigured.value) {
    // For whitelabel clients, show only Support
    return [
      {
        name: 'Support',
        action: 'showZen',
        icon: 'pi pi-question-circle'
      }
    ];
  }
  // For regular Botsify clients, show all links
  return [
    ...(botStore.isLegacyEnabled ? [{
      name: 'Legacy Platform',
      url: `${getWebUrl()}/bot`,
      icon: 'pi pi-check-circle'
    }] : []),
    {
      name: 'Tutorials',
      url: 'https://www.youtube.com/@Botsify',
      icon: 'pi pi-play-circle'
    },
    {
      name: 'API Documentation',
      url: 'https://documenter.getpostman.com/view/13814537/TVmTdF7W#d1e2a194-6d34-4d64-8dff-9628a2dc1077',
      icon: 'pi pi-code'
    },
    {
      name: 'Documentation',
      url: 'https://botsify.zendesk.com/hc/en-us',
      icon: 'pi pi-book'
    },
  ...(!roleStore.isLiveChatAgent
    ? [{
        name: 'Book a Meeting',
        action: 'bookMeeting',
        icon: 'pi pi-calendar'
      }]
    : []),
    {
      name: 'Support',
      action: 'showZen',
      icon: 'pi pi-question-circle'
    }
  ];
});

const navigateToPage = (pageId: string) => {
  // Role-based navigation logic
  if (roleStore.isLiveChatAgent) {
    // Live chat agents can only access conversation page
    if (pageId.startsWith('agent/') || pageId === 'users' || pageId === 'agent') {
      router.push('/conversation');
      return;
    }
  }
  
  router.push(`/${pageId}`);
}

// Function to open the BookMeeting modal
const openBookMeetingModal = () => {
  bookMeetingModalRef.value?.openModal()
};

const handleCalendly = () => {
  if (calendlyModalRef.value) {
    calendlyModalRef.value.openModal()
  }
}

// Open external link
const openExternalLink = (url: string) => {
  window.open(url, '_blank');
};

// Handle item click
const handleItemClick = (item: any) => {
  if (item.action === 'showZen') {
    showZen();
  } else if (item.action === 'bookMeeting') {
    openBookMeetingModal();
  } else if (item.url) {
    openExternalLink(item.url);
  }
};

const openPartnerPortal = () => {
  if (isPortalEnabled.value) {
    window.open(`${BOTSIFY_WEB_URL}/partner`, '_blank');
  }
};
</script>

<template>
  <aside class="left-sidebar scrollbar" :class="{ 'open': sidebarStore.isOpen }">
    <div class="sidebar-header">
      <div class="header-content">
        <div class="app-title-container">
          <!-- Whitelabel or Botsify Logo with link -->
            <img
              v-if="isConfigured && logo"
              :src="logo"
              :alt="companyName || 'Logo'"
              class="logo-icon"
            />
            <img
              v-else
              src="/logo.png"
              alt="Botsify"
              class="logo-icon"
            />
        </div>

        <div class="sidebar-actions">
          <!-- 3-dot menu button -->
          <Dropdown position="bottom-left" class="nav-dropdown-container" :use-portal="true">
            <template #trigger>
              <button class="menu-button" title="Navigation Menu">
                <i class="pi pi-ellipsis-v"></i>
              </button>
            </template>

            <template #content>
              <DropdownItem 
                v-for="item in navLinks" 
                :key="item.name" 
                @click="handleItemClick(item)"
              >
                <template #icon>
                  <i :class="item.icon"></i>
                </template>
                <span>{{ item.name }}</span>
              </DropdownItem>
            </template>
          </Dropdown>
        </div>
      </div>
    </div>

    <div class="navigation-container">
      <div class=" chat-list">
        <template v-for="btn of navigationButtons">
          <div class="">
            <!-- New Chat Button -->
            <button @click="navigateToPage(btn.id)" class="navigation-button"
              :class="{ 'selectedNavigationButton': selectedNavigationButton === btn.name }">
              <span v-html="btn.icon"></span>
              <span>{{ btn.name }}</span>
            </button>
          </div>
        </template>
      </div>
    </div>

    <div v-if="roleStore.canManageBillingWithSubscription" class="sidebar-pricing">
        <!-- Partner Portal Button for Whitelabel Users -->
        <Button 
          v-if="isPortalEnabled" 
          class="sidebar-button" 
          @click="openPartnerPortal"
          variant="success"
          icon="pi pi-external-link"
          iconPosition="right"
        >
          Partner Portal
        </Button>

        <ManageBilling v-else customClass="sidebar-button" iconPosition="right" />
    </div>
    <div v-else-if="roleStore.isLiveChatAgent" class="sidebar-pricing">
        <Button class="sidebar-button" @click="navigateToPage('select-agent')" icon="pi pi-cog" iconPosition="right">
          Manage Agents
        </Button>
    </div>
    <div v-else class="sidebar-pricing">
        <Button class="sidebar-button" @click="handleCalendly" icon="pi pi-calendar" iconPosition="right">
          Book Demo
        </Button>
    </div>
    <BookMeetingModal ref="bookMeetingModalRef"></BookMeetingModal>
    <CalendlyModal ref="calendlyModalRef"></CalendlyModal>
  </aside>
</template>

<style scoped>
.sidebar-pricing {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.left-sidebar {
  width: 230px;
  min-width: 230px;
  height: 100%;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid rgba(0, 163, 255, 0.1);
  display: flex;
  flex-direction: column;
  /* overflow-y: auto; */
  position: relative;
  box-shadow: 4px 0 10px rgba(0, 163, 255, 0.05);
  background-image:
    radial-gradient(circle at left top, rgba(0, 163, 255, 0.15), transparent 70%),
    radial-gradient(circle at left bottom, rgba(0, 163, 255, 0.10), transparent 50%);
}

/* Desktop collapse functionality */
@media (min-width: 768px) {
  .left-sidebar:not(.open) {
    width: 0;
    min-width: 0;
    overflow: hidden;
    border-right: none;
  }
}

/* Override for ChatGPT-style dark mode with blue shade */
[data-theme="dark"] .left-sidebar {
  background: linear-gradient(135deg, #1a1f2e 0%, #171717 50%, #1a1c24 100%) !important;
  border-right-color: #303030;
}

/* Light mode with subtle blue tint */
[data-theme="light"] .left-sidebar {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%) !important;
  border-right-color: #e2e8f0;
}

.sidebar-header {
  padding: var(--space-3) var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: none;
  background: transparent;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
}

.app-title-container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.logo-icon {
  height: 35px;
  width: auto;
  background: transparent;
  object-fit: contain;
}

.sidebar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.navigation-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 10px;
}

.navigation-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: 0.875rem;
  white-space: nowrap;
  min-width: fit-content;
  background-color: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
}

.navigation-button:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border);
}

.selectedNavigationButton {
  background-color: var(--color-bg-active);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.menu-button {
  background-color: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
  transition: all var(--transition-normal);
  margin-left: var(--space-2);
}

.menu-button:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .menu-button {
  color: #a3a3a3;
}

[data-theme="dark"] .menu-button:hover {
  background-color: #2a2a2a;
  color: #e5e5e5;
}

.nav-dropdown-container {
  position: relative;
}

/* Mobile styles */
@media (max-width: 767px) {
  .left-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 85%;
    max-width: 320px;
    transform: translateX(-100%);
    box-shadow: var(--shadow-lg);
    transition: transform var(--transition-normal);
  }

  .left-sidebar.open {
    transform: translateX(0);
  }

  .logo-icon {
    max-height: 34px;
  }
}
</style>