<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserFilters from '@/components/user/Filters.vue'
import UserTable from '@/components/user/Table.vue'
import { ActionType } from '@/types/user'
import { useUserStore } from '@/stores/userStore'
import { useRoleStore } from '@/stores/roleStore'

// Use the router
const router = useRouter()

// Use the user store
const userStore = useUserStore()
const roleStore = useRoleStore()

// Watch for action changes
watch(() => userStore.selectedAction, (newAction) => {
  if (newAction) {
    // Check permissions for editor role
    if (roleStore.isEditor) {
      // Editors cannot perform certain actions
      const restrictedActions: ActionType[] = ['delete', 'delete_conversation', 'activate', 'deactivate'];
      if (restrictedActions.includes(newAction)) {
        window.$toast.error('You do not have permission to perform this action.');
        userStore.selectedAction = ''
        return;
      }
    }
    
    if (userStore.selectedUsersCount > 0) {
      // Show confirmation dialog with SweetAlert2
      const actionText = getActionText(newAction)
      const userCount = userStore.selectedUsersCount
      const userText = userCount === 1 ? 'user' : 'users'
      const actionCap = actionText.charAt(0).toUpperCase() + actionText.slice(1);
      window.$confirm({
        text: `Are you sure you want to ${actionText} ${userCount} ${userText}?`,
        confirmButtonText: `Yes, ${actionCap} it!`
      }, async() => {
        const selectedUserIds = userStore.users
          .filter(user => user.selected)
          .map(user => user.id)
        await userStore.executeUserAction(newAction, selectedUserIds)
        window.$toast({
          message: '${actionCap} successfully.',
          type: 'success',
        });
      });
      userStore.selectedAction = ''
    } else {
      // Show notification for no users selected
      window.$toast.error('Please select at least 1 user to perform this action.')
      userStore.selectedAction = ''
    }
  }
})

// Helper function to get action text
const getActionText = (action: ActionType): string => {
  const actionMap: Record<ActionType, string> = {
    'activate': 'activate',
    'deactivate': 'deactivate', 
    'delete': 'delete',
    'test': 'make test',
    'export': 'export',
    'delete_conversation': 'delete conversation for',
    '': ''
  }
  return actionMap[action] || action
}

// Load data when component mounts
onMounted(() => {
  // Prevent live chat agents from accessing this page
  if (roleStore.isLiveChatAgent) {
    router.push('/conversation');
    return;
  }
  
  userStore.fetchUsers()
})
</script>

<template>
  <div class="user-view">
    <div class="page-header">
      <h1>User Management</h1>
      <p>Manage users, view attributes, and perform bulk actions.</p>
    </div>

    <!-- Main User Management View --> 
    <div class="user-content"> 
      <!-- Filters and Controls -->
      <UserFilters />

      <!-- Users Table -->
      <UserTable />
    </div>
  </div>
</template>

<style scoped>
.user-view {
  background-color: var(--color-bg-primary);
}

.page-header {
  background-color: var(--color-bg-secondary);
  padding: var(--space-4) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.page-header h1 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.page-header p {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.user-content {
  padding: var(--space-4) var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .user-content {
    padding: var(--space-3) var(--space-4);
  }
  
  .page-header {
    padding: var(--space-4) var(--space-4) var(--space-3);
  }
}

@media (max-width: 768px) {
  .user-content {
    padding: var(--space-2) var(--space-3);
  }
  
  .page-header {
    padding: var(--space-3) var(--space-3) var(--space-2);
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .page-header p {
    font-size: 0.875rem;
  }
}
</style> 
