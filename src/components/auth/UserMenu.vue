<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const showDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleLogout = () => {
  userStore.logout();
  showDropdown.value = false;
};
</script>

<template>
  <div class="user-menu">
    <button class="user-button" @click="toggleDropdown">
      <div v-if="userStore.isAuthenticated" class="user-avatar">
        <img 
          :src="userStore.user?.avatar" 
          :alt="userStore.user?.name"
          class="avatar-image"
        />
      </div>
      <div v-else class="user-avatar default-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    </button>
    
    <div v-if="showDropdown" class="dropdown">
      <div v-if="userStore.isAuthenticated">
        <div class="user-info">
          <p class="user-name">{{ userStore.user?.name }}</p>
          <p class="user-email">{{ userStore.user?.email }}</p>
        </div>
        
        <div class="dropdown-divider"></div>
        
        <router-link to="/profile" class="dropdown-item">Profile</router-link>
        <router-link to="/pricing" class="dropdown-item">
          Subscription
          <span class="plan-badge">{{ userStore.user?.plan }}</span>
        </router-link>
        <router-link to="/settings" class="dropdown-item">Settings</router-link>
        
        <div class="dropdown-divider"></div>
        
        <button @click="handleLogout" class="dropdown-item text-error">
          Logout
        </button>
      </div>
      <div v-else>
        <router-link to="/login" class="dropdown-item">Login</router-link>
        <router-link to="/signup" class="dropdown-item">Sign Up</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.user-button {
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-avatar {
  background-color: var(--color-bg-tertiary);
  transition: background-color var(--transition-normal);
}

.user-button:hover .default-avatar {
  background-color: var(--color-bg-hover);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-2);
  width: 240px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
}

.user-info {
  padding: var(--space-3);
}

.user-name {
  font-weight: 500;
  margin: 0;
}

.user-email {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: var(--space-1) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color var(--transition-normal);
}

.dropdown-item:hover {
  background-color: var(--color-bg-hover);
}

.plan-badge {
  font-size: 0.75rem;
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  text-transform: capitalize;
}

.text-error {
  color: var(--color-error);
}
</style>