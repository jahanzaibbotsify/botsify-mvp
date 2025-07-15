<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue'
import UserAttributes from './Attributes.vue'
import { User, UserAttribute } from '@/types/user'

const props = defineProps<{
  users: User[]
  selectAll: boolean
}>()

const showAttributes = ref<boolean>(false)
// Sample attributes data
const userAttributes = ref<UserAttribute[]>([
  { id: 1, key: 'referrer_domain', value: 'csv' },
  { id: 2, key: 'utm_source', value: 'facebook' },
  { id: 3, key: 'campaign_id', value: '12345' }
])

const emit = defineEmits<{
  'update:selectAll': [value: boolean]
  'update:userSelected': [userId: number]
  'goToConversation': [userId: number]
  'userClick': [user: User]
}>()

const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const toggleSelectAll = (): void => {
  emit('update:selectAll', !props.selectAll)
}

const handleUserSelect = (userId: number): void => {
  emit('update:userSelected', userId)
}

const handleShowAttributes = (userId: number): void => {
  console.log('showAttributes', userId)
  showAttributes.value = true
}

const handleCloseAttributes = (): void => {
  showAttributes.value = false
}


const handleUpdateAttributes = (attributes: UserAttribute[]): void => {
  userAttributes.value = attributes
}

const goToConversation = (userId: number): void => {
  emit('goToConversation', userId)
}

const handleRowClick = (user: User): void => {
  emit('userClick', user)
}
</script>

<template>
  <div class="table-container">
    <table class="users-table">
      <thead>
        <tr>
          <th>
            <input 
              type="checkbox" 
              :checked="selectAll" 
              @change="toggleSelectAll"
            >
          </th>
          <th>NAME</th>
          <th>LOCALE</th>
          <th>SOURCE</th>
          <th>CREATED AT</th>
          <th>COUNTRY</th>
          <th>OS</th>
          <th>PHONE</th>
          <th></th>
          <th>STATUS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="users.length === 0" class="no-data-row">
          <td colspan="10" class="no-data-cell">
            <div class="no-data-content">
              <div class="no-data-icon">📄</div>
              <div class="no-data-text">No data found</div>
              <div class="no-data-subtext">Try adjusting your search or filter criteria</div>
            </div>
          </td>
        </tr>
        <tr 
          v-for="user in users" 
          :key="user.id"
          class="clickable-row"
          @click="handleRowClick(user)"
        >
          <td>
            <input
              @click.stop
              type="checkbox" 
              :checked="user.selected"
              @change="handleUserSelect(user.id)"
            >
          </td>
          <td>
            <div class="user-info">
              <div class="user-avatar">{{ getUserInitials(user.name) }}</div>
              <div class="user-details">
                <div class="user-name">{{ user.name }}</div>
                <div 
                  class="user-attributes" 
                  @click.stop
                  @click="handleShowAttributes(user.id)"
                >
                  Show Attributes
                </div>
              </div>
            </div>
          </td>
          <td>{{ user.locale || '-' }}</td>
          <td>{{ user.source }}</td>
          <td>{{ user.createdAt }}</td>
          <td>{{ user.country }}</td>
          <td>{{ user.os }}</td>
          <td>{{ user.phone }}</td>
          <td>
            <button 
              v-if="user.hasConversation" 
              class="conversation-btn"
              @click.stop
              @click="goToConversation(user.id)"
            >
              Go to Conversation
            </button>
          </td>
          <td>
            <span class="status-badge" :class="user.status.toLowerCase()">
              {{ user.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- User Attributes Modal -->
    <UserAttributes
      v-if="showAttributes"
      :attributes="userAttributes"
      @close="handleCloseAttributes"
      @update="handleUpdateAttributes"
    />
  </div>
</template>

<style scoped>
.table-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 300px;
  max-height: 60vh;
  overflow-y: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  min-height: 300px;
}

.users-table th {
  background-color: var(--color-primary);
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
}

.users-table td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
  background-color: white;
}

.users-table tr:hover td {
  background-color: #f8f9fa;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f8f9fa !important;
}

.no-data-row {
  height: 200px;
}

.no-data-row:hover td {
  background-color: white !important;
}

.no-data-cell {
  text-align: center;
  vertical-align: middle;
  border-bottom: none !important;
  height: 200px;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
}

.no-data-icon {
  font-size: 48px;
  opacity: 0.3;
  margin-bottom: 8px;
}

.no-data-text {
  font-size: 18px;
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 4px;
}

.no-data-subtext {
  font-size: 14px;
  color: #9ca3af;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background-color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #212529;
}

.user-attributes {
  font-size: 12px;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.2s;
}

.user-attributes:hover {
  text-decoration: underline;
  color: var(--color-primary);
}

.conversation-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.conversation-btn:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.active {
  background-color: var(--color-success);
  color: white;
}

.status-badge.inactive {
  background-color: var(--color-error);
  color: white;
}

@media (max-width: 768px) {
  .users-table {
    font-size: 12px;
  }
  
  .users-table th,
  .users-table td {
    padding: 8px;
  }
}
</style>