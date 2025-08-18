<script setup lang="ts">
import {computed, ref, onMounted, onUnmounted} from 'vue';
import {useAuthStore} from "@/stores/authStore";
import {useRouter} from "vue-router";

const authStore = useAuthStore();
const showDropdown = ref(false);
const isLoggingOut = ref(false);
const router = useRouter();
const rootRef = ref<HTMLDivElement | null>(null);

const currentUser = computed(() => authStore.user as any);

const userInitial = computed(() => {
  if (currentUser.value?.name) {
    return currentUser.value.name.charAt(0).toUpperCase();
  }
  return '';
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleOutsideClick = (event: MouseEvent) => {
  if (!rootRef.value) return;
  const target = event.target as Node;
  if (!rootRef.value.contains(target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

const handleLogout = async () => {
  try {
    isLoggingOut.value = true;
    await authStore.logout();
    showDropdown.value = false;
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<template>
  <div class="user-menu" ref="rootRef">
    <button class="user-button" @click="toggleDropdown">
      <div v-if="authStore.isAuthenticated" class="user-avatar">
        <template v-if="currentUser?.avatar">
          <img
              :src="currentUser.avatar"
              :alt="currentUser.name"
              class="avatar-image"
          />
        </template>
        <template v-else>
          <span class="avatar-initial">{{ userInitial }}</span>
        </template>
      </div>
      <div v-else class="user-avatar default-avatar">
        <i class="pi pi-user"></i>
      </div>
    </button>
    
    <div v-if="showDropdown" class="dropdown enhanced-dropdown">
      <div v-if="authStore.isAuthenticated">
        <div class="user-info user-info-enhanced">
          <div class="avatar-ring">
            <div v-if="currentUser?.avatar">
              <img :src="currentUser.avatar" :alt="currentUser.name" class="avatar-image enhanced-avatar" />
            </div>
            <div v-else class="avatar-initial enhanced-avatar">{{ userInitial }}</div>
          </div>
          <div class="user-details">
            <p class="user-name">{{ currentUser?.name }}</p>
            <p class="user-email">{{ currentUser?.email }}</p>
            <span v-if="currentUser?.subs?.stripe_plan" class="plan-badge plan-badge-enhanced">{{ currentUser.subs.stripe_plan }}</span>
          </div>
        </div>
        <div class="dropdown-divider"></div>
        <button @click="handleLogout" class="dropdown-item text-error enhanced-logout" :disabled="isLoggingOut">
          <i v-if="isLoggingOut" class="pi pi-spin pi-spinner" style="margin-right:8px;"></i>
          <i v-else class="pi pi-sign-out" style="margin-right:8px;"></i>
          {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
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

/* Force perfect circle for all avatar variants and outline */
.user-avatar, .avatar-image, .avatar-initial, .avatar-ring, .enhanced-avatar {
  border-radius: 50% !important;
}

.default-avatar {
  background-color: var(--color-bg-tertiary);
  transition: background-color var(--transition-normal);
}

.user-button:hover .default-avatar {
  background-color: var(--color-bg-hover);
}

.user-button:focus,
.user-button:focus-visible {
  outline: none;
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
  width: 290px;
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
  color: black;
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

.avatar-initial {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.enhanced-dropdown {
  box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 1.5px 6px rgba(0,163,255,0.08);
  border: none;
  background: linear-gradient(135deg, var(--color-bg-primary) 80%, var(--color-primary) 120%);
  padding: var(--space-3) 0 var(--space-3) 0;
  min-width: 260px;
}

.user-info-enhanced {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4) var(--space-2) var(--space-4);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--color-bg-secondary);
  box-shadow: var(--shadow-sm);
}

.avatar-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary) 60%, var(--color-accent) 100%);
  padding: 2px;
  box-shadow: 0 0 0 2px var(--color-bg-primary);
}

.enhanced-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  object-fit: cover;
  background: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.plan-badge-enhanced {
  margin-top: 2px;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 500;
  border-radius: var(--radius-full);
  padding: 2px 10px;
  display: inline-block;
  letter-spacing: 0.5px;
  box-shadow: 0 1px 4px rgba(0,163,255,0.08);
}

.enhanced-logout {
  color: var(--color-error);
  font-weight: 600;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  margin: 0 var(--space-2);
  background: var(--color-bg-tertiary);
  transition: background-color var(--transition-normal);
}

.enhanced-logout:hover {
  background: var(--color-bg-hover);
}
</style>