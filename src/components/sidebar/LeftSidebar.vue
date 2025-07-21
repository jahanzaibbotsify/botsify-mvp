<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, defineEmits } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import { useSidebarStore } from '@/stores/sidebarStore';
// import { useWindowSize } from '@vueuse/core';
// import ChatListItem from '@/components/chat/ChatListItem.vue';
import SidebarPricing from './SidebarPricing.vue';
import BookMeeting from '@/components/ui/BookMeeting.vue';
import { BOTSIFY_WEB_URL } from '@/utils/config';


const chatStore = useChatStore();
const sidebarStore = useSidebarStore();
const router = useRouter();
const route = useRoute();
// const { width } = useWindowSize();

const emit = defineEmits(['select-button']);
const selectedNavigationButton = computed(() => {
  const currentPath = route.path.toLowerCase();

  const match = navigationButtons.find((btn) =>
    currentPath.includes(btn.id.toLowerCase())
  );

  return match?.name || null;
});
// const isMobile = computed(() => width.value < 768);
const showNavDropdown = ref(false);
const showHelpDropdown = ref(false);
const bookMeetingRef = ref<InstanceType<typeof BookMeeting> | null>(null)

const navigationButtons = [
  {
    id: `agent/${chatStore.activeChat}`,
    icon: 'pi pi-user',
    name: 'Agent'
  },
  {
    id: 'analytics',
    icon: 'pi pi-chart-bar',
    name: 'Reports & Analytics'
  },
  {
    id: `conversation`,
    icon: 'pi pi-comments',
    name: 'Chat'
  },
  {
    id: 'users',
    icon: 'pi pi-users',
    name: 'Users'
  }
];

const filteredChats = computed(() => {
  return [chatStore.chats[0]];
});

// const createNewChat = () => {
//   const newChat = chatStore.createNewChat();
//   router.push(`/chat/${newChat.id}`);
// };

// const navigateToChat = (chatId: string) => {
//   router.push(`/agent/${chatId}`);
//   if (isMobile.value) {
//     sidebarStore.isOpen r= false;
//   }
// };

const navigateToPage = (pageId: string) => {
  router.push(`/${pageId}`);
}

const toggleNavDropdown = () => {
  showNavDropdown.value = !showNavDropdown.value;
  // Close help dropdown if it's open
  if (showNavDropdown.value) {
    showHelpDropdown.value = false;
  }
};

const toggleHelpDropdown = () => {
  showHelpDropdown.value = !showHelpDropdown.value;
  // Close nav dropdown if it's open
  if (showHelpDropdown.value) {
    showNavDropdown.value = false;
  }
};

const closeNavDropdown = () => {
  showNavDropdown.value = false;
};

const closeHelpDropdown = () => {
  showHelpDropdown.value = false;
};

const closeAllDropdowns = () => {
  showNavDropdown.value = false;
  showHelpDropdown.value = false;
};

// Navigation links for the dropdown with icons
const navLinks = [
  {
    name: 'Legacy Platform',
    url: `${BOTSIFY_WEB_URL}/bot`,
    icon: 'pi pi-check-circle'
  },
  {
    name: 'Video Guide',
    url: `https://www.youtube.com/@Botsify`,
    icon: 'pi pi-video'
  },
  {
    name: 'Documentation',
    url: 'https://botsify.zendesk.com/hc/en-us',
    icon: 'pi pi-book'
  },
  {
    name: 'Developer Hub',
    url: 'https://documenter.getpostman.com/view/13814537/TVmTdF7W#d1e2a194-6d34-4d64-8dff-9628a2dc1077',
    icon: 'pi pi-code'
  },
  {
    name: 'Billing',
    url: `${BOTSIFY_WEB_URL}/account-settings/billing`,
    icon: 'pi pi-credit-card'
  }
];

// Help links for the help dropdown
const helpLinks = [
  {
    name: 'Tutorial',
    url: `https://www.youtube.com/@Botsify`,
    icon: 'pi pi-play-circle'
  },
  {
    name: 'Documentation',
    url: 'https://botsify.zendesk.com/hc/en-us',
    icon: 'pi pi-book'
  },
  {
    name: 'Support',
    action: 'showZen',
    icon: 'pi pi-question-circle'
  }
];

const showZen = () => {
  window.showZen()
  closeAllDropdowns();
  closeHelpDropdown();
}

// Function to open the BookMeeting modal
const openBookMeetingModal = () => {
  if (bookMeetingRef.value) {
    console.log('📦 bookMeetingRef exists')
    bookMeetingRef.value.openModal()
  } else {
    console.warn('❌ bookMeetingRef is null')
  }
  closeNavDropdown();
};

// Open external link
const openExternalLink = (url: string) => {
  window.open(url, '_blank');
  closeAllDropdowns();
  closeHelpDropdown();
};

// Handle help item click
const handleHelpItemClick = (item: any) => {
  if (item.action === 'showZen') {
    showZen();
  } else if (item.url) {
    openExternalLink(item.url);
  }
};

// Close dropdown when clicking outside
const dropdownRef = ref<HTMLElement | null>(null);
const helpDropdownRef = ref<HTMLElement | null>(null);
const menuButtonRef = ref<HTMLElement | null>(null);
const helpButtonRef = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  
  // Check if click is outside nav dropdown
  const isOutsideNavDropdown = dropdownRef.value && 
    !dropdownRef.value.contains(target) && 
    menuButtonRef.value && 
    !menuButtonRef.value.contains(target);
    
  // Check if click is outside help dropdown
  const isOutsideHelpDropdown = helpDropdownRef.value && 
    !helpDropdownRef.value.contains(target) && 
    helpButtonRef.value && 
    !helpButtonRef.value.contains(target);

  if (isOutsideNavDropdown) {
    showNavDropdown.value = false;
  }
  
  if (isOutsideHelpDropdown) {
    showHelpDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Get current hostname to check active state
// const getCurrentHostname = () => {
//   if (typeof window !== 'undefined') {
//     return window.location.hostname;
//   }
//   return '';
// };

// Check if a link is active by comparing with current URL
const isLinkActive = (url: string) => {
  try {
    const currentPath = window.location.pathname;
    // Handle relative or same-origin paths
    if (url.startsWith('/')) {
      return currentPath.startsWith(url);
    }

    // Parse full external URLs
    const linkUrl = new URL(url);
    const isSameHost = linkUrl.hostname === window.location.hostname;
    return isSameHost && currentPath.startsWith(linkUrl.pathname);
  } catch (e) {
    return false;
  }
};

// const selectNavigationButton = (name: string) => {
//   selectedNavigationButton.value = name;
//   emit('select-button', name);
// };
</script>

<template>
  <aside class="left-sidebar scrollbar" :class="{ 'open': sidebarStore.isOpen }">
    <div class="sidebar-header">
      <div class="header-content">
        <div class="app-title-container">
          <!-- Botsify Logo with link to botsify.com -->
          <a href="https://botsify.com" target="_blank" class="logo-link">
            <img src="https://botsify.com/assets/img/logos/logo/logo-color-600w.webp" alt="Botsify" class="logo-icon" />
          </a>
        </div>
        <div class="sidebar-actions">

          <!-- 3-dot menu button -->
          <div class="dropdown-container">
            <button ref="menuButtonRef" class="menu-button" @click.stop="toggleNavDropdown" title="Navigation Menu">
              <img width="16" height="16" src="https://img.icons8.com/tiny-glyph/16/menu-2.png" alt="menu-2" />
            </button>

            <!-- Navigation dropdown -->
            <div ref="dropdownRef" v-if="showNavDropdown" class="nav-dropdown">
              <div class="dropdown-arrow"></div>
              <div v-for="link in navLinks" :key="link.url" class="nav-item"
                :class="{ 'active': isLinkActive(link.url) }" @click="openExternalLink(link.url)">
                <div class="nav-item-icon">
                  <i :class="link.icon"></i>
                </div>
                <span>{{ link.name }}</span>
              </div>


              <div class="nav-item" role="button" @click="openBookMeetingModal">
                <div class="nav-item-icon">
                  <i class="pi pi-calendar"></i>
                </div>
                <span>Book a Meeting</span>
              </div>

              <div class="nav-item" id="showWidget" @click="showZen()">
                <div class="nav-item-icon">
                  <i class="pi pi-question-circle"></i>
                </div>
                <span>Support</span>
              </div>
            </div>
          </div>
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
              <i :class="btn.icon" style="font-size: 1.5em;"></i>
              <!-- <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg> -->
              <span>{{ btn.name }}</span>
            </button>
            <!-- ...existing menu button code... -->
          </div>
        </template>
        <!-- <ChatListItem v-for="chat in filteredChats" :key="chat.id" :chat="chat"
        :isActive="chat.id === chatStore.activeChat" @click="navigateToChat(chat.id)" /> -->


        <div v-if="filteredChats.length === 0" class="no-results">
          <p>No chats found</p>
        </div>

      </div>
      <div class="help-container">
        <div class="dropdown-container">
          <button ref="helpButtonRef" class="navigation-button help-button" @click.stop="toggleHelpDropdown">
            <span>
              <i class="pi pi-question-circle" style="font-size: 1.5em;"></i>
            </span>
            <span>Help</span>
          </button>

          <!-- Help dropdown -->
          <div ref="helpDropdownRef" v-if="showHelpDropdown" class="help-dropdown">
            <div class="dropdown-arrow"></div>
            <div v-for="item in helpLinks" :key="item.name" class="nav-item"
              @click="handleHelpItemClick(item)">
              <div class="nav-item-icon">
                <i :class="item.icon"></i>
              </div>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar Pricing (keeping this at the bottom) -->
    <SidebarPricing />
    <BookMeeting ref="bookMeetingRef"></BookMeeting>
    <User ref="userRef"></User>
  </aside>
</template>



<style scoped>
.left-sidebar {
  width: 230px;
  min-width: 230px;
  height: 100%;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid rgba(0, 163, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: all var(--transition-normal);
}

.logo-link:hover {
  opacity: 0.9;
}

.logo-icon {
  height: 34px;
  width: auto;
}

.sidebar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.new-chat-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: 0.875rem;
  white-space: nowrap;
  min-width: fit-content;
  background-color: transparent;
  color: var(--color-text-primary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.new-chat-button:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border);
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
  /* border-radius: 8px;
  border: 1px solid var(--color-border); */
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

/* Help container and dropdown */
.help-container {
  position: relative;
}

.help-button {
  position: relative;
}

.help-dropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 180px;
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  z-index: var(--z-dropdown);
  overflow: hidden;
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .help-dropdown {
  background-color: #262626;
  border-color: #404040;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.help-dropdown .dropdown-arrow {
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid var(--color-bg-primary);
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .help-dropdown .dropdown-arrow {
  border-top-color: #262626;
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .new-chat-button {
  color: #e5e5e5;
  border-color: #404040;
}

[data-theme="dark"] .new-chat-button:hover {
  background-color: #2a2a2a;
  border-color: #525252;
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
  color: var(--color-text-secondary);
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

.dropdown-container {
  position: relative;
}

.nav-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  width: 200px;
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  z-index: var(--z-dropdown);
  overflow: hidden;
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .nav-dropdown {
  background-color: #262626;
  border-color: #404040;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dropdown-arrow {
  position: absolute;
  top: -8px;
  right: 14px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--color-bg-primary);
  filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.1));
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .dropdown-arrow {
  border-bottom-color: #262626;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary);
  transition: all var(--transition-normal);
  border-bottom: 1px solid var(--color-border);
}

.nav-item:last-child {
  border-bottom: none;
}

.nav-item:hover {
  background-color: var(--color-bg-hover);
}

.nav-item.active {
  background-color: var(--color-bg-active);
  color: var(--color-text-primary);
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .nav-item {
  color: #e5e5e5;
  border-bottom-color: #404040;
}

[data-theme="dark"] .nav-item:hover {
  background-color: #2a2a2a;
}

[data-theme="dark"] .nav-item.active {
  background-color: #2a2a2a;
  color: #ffffff;
}

.nav-item-icon {
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.nav-item.active .nav-item-icon {
  color: var(--color-text-primary);
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .nav-item-icon {
  color: #a3a3a3;
}

[data-theme="dark"] .nav-item.active .nav-item-icon {
  color: #ffffff;
}

/* .chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--space-2);
  position: relative;
} */

.no-results {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-secondary);
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .no-results {
  color: #a3a3a3;
}

.sidebar-footer {
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
  background-color: transparent;
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .sidebar-footer {
  border-top-color: #404040;
}

.settings-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: 8px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background-color var(--transition-normal), color var(--transition-normal);
  margin-top: var(--space-3);
}

.settings-link:hover,
.settings-link.active {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .settings-link {
  color: #a3a3a3;
}

[data-theme="dark"] .settings-link:hover,
[data-theme="dark"] .settings-link.active {
  background-color: #2a2a2a;
  color: #e5e5e5;
}

.settings-link svg {
  flex-shrink: 0;
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

  .new-chat-button span {
    display: none;
  }

  .new-chat-button {
    padding: var(--space-2);
    min-width: 36px;
    min-height: 36px;
  }

  .logo-icon {
    max-height: 34px;
  }

  .nav-dropdown,
  .help-dropdown {
    width: 180px;
  }
}
</style>