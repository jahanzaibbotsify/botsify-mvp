<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '../../stores/chatStore';
import { useSidebarStore } from '../../stores/sidebarStore';
import { useWindowSize } from '@vueuse/core';
import ChatListItem from '../chat/ChatListItem.vue';
import SidebarPricing from './SidebarPricing.vue';

const chatStore = useChatStore();
const sidebarStore = useSidebarStore();
const router = useRouter();
const { width } = useWindowSize();

const isMobile = computed(() => width.value < 768);
const showNavDropdown = ref(false);

const filteredChats = computed(() => {
  return chatStore.chats;
});

const createNewChat = () => {
  const newChat = chatStore.createNewChat();
  router.push(`/chat/${newChat.id}`);
};

const navigateToChat = (chatId: string) => {
  router.push(`/chat/${chatId}`);
  if (isMobile.value) {
    sidebarStore.isOpen = false;
  }
};

const toggleNavDropdown = () => {
  showNavDropdown.value = !showNavDropdown.value;
};

const closeNavDropdown = () => {
  showNavDropdown.value = false;
};

// Navigation links for the dropdown with icons
const navLinks = [
  { 
    name: 'Chatbot Platform', 
    url: 'https://botsify.com/chatbot-platform',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
  },
  { 
    name: 'Vocallify', 
    url: 'https://vocallify.com/',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`
  },
  { 
    name: 'Book a Demo', 
    url: 'https://botsify.com/book-demo',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
  },
  { 
    name: 'Pricing', 
    url: 'https://botsify.com/pricing',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
  }
];

// Open external link
const openExternalLink = (url: string) => {
  window.open(url, '_blank');
  closeNavDropdown();
};

// Close dropdown when clicking outside
const dropdownRef = ref<HTMLElement | null>(null);
const menuButtonRef = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownRef.value && 
    menuButtonRef.value && 
    !dropdownRef.value.contains(event.target as Node) && 
    !menuButtonRef.value.contains(event.target as Node)
  ) {
    showNavDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Get current hostname to check active state
const getCurrentHostname = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return '';
};

// Check if a link is active by comparing with current URL
const isLinkActive = (url: string) => {
  if (typeof window !== 'undefined') {
    const linkUrl = new URL(url);
    const currentHostname = getCurrentHostname();
    
    // Compare hostnames and paths
    return (
      linkUrl.hostname === currentHostname &&
      window.location.pathname.startsWith(linkUrl.pathname)
    );
  }
  return false;
};
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
          <button class="new-chat-button primary" @click="createNewChat">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Chat</span>
          </button>
          
          <!-- 3-dot menu button -->
          <div class="dropdown-container">
            <button ref="menuButtonRef" class="menu-button" @click.stop="toggleNavDropdown" title="Navigation Menu">
              <img width="16" height="16" src="https://img.icons8.com/tiny-glyph/16/menu-2.png" alt="menu-2"/>
            </button>
            
            <!-- Navigation dropdown -->
            <div ref="dropdownRef" v-if="showNavDropdown" class="nav-dropdown">
              <div class="dropdown-arrow"></div>
              <div 
                v-for="link in navLinks" 
                :key="link.url" 
                class="nav-item" 
                :class="{ 'active': isLinkActive(link.url) }"
                @click="openExternalLink(link.url)"
              >
                <div class="nav-item-icon" v-html="link.icon"></div>
                <span>{{ link.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="chat-list">
      <ChatListItem
        v-for="chat in filteredChats"
        :key="chat.id"
        :chat="chat"
        :isActive="chat.id === chatStore.activeChat"
        @click="navigateToChat(chat.id)"
      />
      
      <div v-if="filteredChats.length === 0" class="no-results">
        <p>No chats found</p>
      </div>
    </div>

    <!-- Sidebar Pricing (keeping this at the bottom) -->
    <SidebarPricing />
  </aside>
</template>

<style scoped>
.left-sidebar {
  width: 280px;
  min-width: 280px;
  height: 100%;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid rgba(0, 163, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  z-index: var(--z-fixed);
  box-shadow: 4px 0 10px rgba(0, 163, 255, 0.05);
  background-image: 
    radial-gradient(circle at left top, rgba(0, 163, 255, 0.15), transparent 70%),
    radial-gradient(circle at left bottom, rgba(0, 163, 255, 0.10), transparent 50%);
}

.sidebar-header {
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 163, 255, 0.08);
  background: linear-gradient(to right, rgba(0, 163, 255, 0.08), rgba(0, 163, 255, 0) 80%);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
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
  transform: scale(1.02);
}

.logo-icon {
  height: 32px;
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
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.new-chat-button:hover {
  background-color: var(--color-primary-hover);
}

.menu-button {
  background-color: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
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
  background-color: rgba(0, 163, 255, 0.1);
  color: var(--color-primary);
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
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 163, 255, 0.1);
  border: 1px solid rgba(0, 163, 255, 0.1);
  z-index: var(--z-dropdown);
  overflow: hidden;
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
  filter: drop-shadow(0 -2px 2px rgba(0, 163, 255, 0.1));
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  cursor: pointer;
  color: var(--color-text-primary);
  transition: all var(--transition-normal);
  border-bottom: 1px solid rgba(0, 163, 255, 0.05);
}

.nav-item:last-child {
  border-bottom: none;
}

.nav-item:hover {
  background-color: rgba(0, 163, 255, 0.05);
}

.nav-item.active {
  background-color: rgba(0, 163, 255, 0.08);
  color: var(--color-primary);
}

.nav-item-icon {
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item.active .nav-item-icon {
  color: var(--color-primary);
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2) var(--space-3);
  position: relative;
}

.no-results {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-secondary);
}

.sidebar-footer {
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.settings-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background-color var(--transition-normal), color var(--transition-normal);
  margin-top: var(--space-3);
}

.settings-link:hover, .settings-link.active {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
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
    max-height: 24px;
  }
  
  .nav-dropdown {
    width: 180px;
  }
}
</style>