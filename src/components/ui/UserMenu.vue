<script setup lang="ts">
import {computed, ref} from 'vue';
import {useAuthStore} from "@/stores/authStore";
import {useRouter} from "vue-router";
import { Button, ManageBilling, Dropdown, DropdownItem } from '.';
import { useRoleStore } from '@/stores/roleStore';
import EditProfileModal from '@/components/modal/EditProfileModal.vue';
import Badge from './Badge.vue';

const authStore = useAuthStore();
const isLoggingOut = ref(false);
const router = useRouter();
const roleStore = useRoleStore();
const editProfileModalRef = ref<InstanceType<typeof EditProfileModal> | null>(null);

const currentUser = computed(() => authStore.user as any);

const userInitial = computed(() => {
  if (currentUser.value?.name) {
    return currentUser.value.name.charAt(0).toUpperCase();
  }
  return '';
});

const handleLogout = async () => {
  try {
    isLoggingOut.value = true;
    await authStore.logout();
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    isLoggingOut.value = false;
  }
};

const openEditProfile = () => {
  editProfileModalRef.value?.openModal();
};
</script>

<template>
  <Dropdown position="bottom-right" class="user-menu">
    <template #trigger>
      <button class="user-button">
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
    </template>

    <template #content>
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
            <Badge v-if="currentUser?.subs?.stripe_plan" variant="secondary" size="small">{{ currentUser.subs.stripe_plan }}</Badge>
          </div>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-actions">
          <Button @click="openEditProfile" variant="secondary" size="small" icon="pi pi-user-edit">Profile</Button>
          <ManageBilling v-if="roleStore.canManageBillingWithSubscription" size="small" />
          <Button @click="handleLogout" :disabled="isLoggingOut" :loading="isLoggingOut" variant="error" size="small" icon="pi pi-sign-out">
            Logout
          </Button>
        </div>
      </div>
      <div v-else>
        <DropdownItem @click="router.push('/login')">
          <template #icon>
            <i class="pi pi-sign-in"></i>
          </template>
          Login
        </DropdownItem>
        <DropdownItem @click="router.push('/signup')">
          <template #icon>
            <i class="pi pi-user-plus"></i>
          </template>
          Sign Up
        </DropdownItem>
      </div>
    </template>
  </Dropdown>
  
  <EditProfileModal ref="editProfileModalRef" />
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

.dropdown-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  width: 320px;
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

.user-info-enhanced {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4) var(--space-2) var(--space-4);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
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
</style>