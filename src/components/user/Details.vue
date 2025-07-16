<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { User } from '@/types/user'

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  back: []
  updateUser: [user: User]
}>()

const activeTab = ref<'overview' | 'notes' | 'activity'>('overview')
const isEditing = ref<boolean>(false)
const editedUser = ref<User>({ ...props.user })

const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const handleBack = (): void => {
  emit('back')
}

const handleSave = (): void => {
  emit('updateUser', editedUser.value)
  isEditing.value = false
}

const handleCancel = (): void => {
  editedUser.value = { ...props.user }
  isEditing.value = false
}

const toggleUserStatus = (): void => {
  editedUser.value.status = editedUser.value.status === 'Active' ? 'Inactive' : 'Active'
}
</script>



<template>
  <div class="user-details">
    <!-- Header with Back Button -->
    <div class="details-header">
      <button class="back-btn" @click="handleBack">
        <i class="pi pi-arrow-left" />
        Back to Users
      </button>
    </div>

    <div class="details-content">
      <!-- Left Sidebar -->
      <div class="details-sidebar">
        <div class="user-profile">
          <div class="user-avatar-large">
            {{ getUserInitials(user.name) }}
          </div>
          <h2 class="user-name">{{ user.name }}</h2>
          <button 
            class="status-btn"
            :class="user.status.toLowerCase()"
            @click="toggleUserStatus"
          >
            {{ user.status.toUpperCase() }}
          </button>
        </div>

        <nav class="details-nav">
          <button 
            class="nav-item"
            :class="{ active: activeTab === 'overview' }"
            @click="activeTab = 'overview'"
          >
            <i class="pi pi-eye" />
            Overview
          </button>
          <button 
            class="nav-item"
            :class="{ active: activeTab === 'notes' }"
            @click="activeTab = 'notes'"
          >
            <i class="pi pi-file-edit" />
            Save Note
          </button>
          <button 
            class="nav-item"
            :class="{ active: activeTab === 'activity' }"
            @click="activeTab = 'activity'"
          >
            <i class="pi pi-chart-line" />
            Activity
          </button>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="details-main">
        <!-- Name Section -->
        <div class="name-section">
          <div class="name-header">
            <label class="field-label">Name</label>
            <button 
              v-if="!isEditing"
              class="save-btn"
              @click="isEditing = true"
            >
              Edit
            </button>
            <div v-else class="edit-actions">
              <button class="save-btn" @click="handleSave">Save</button>
              <button class="cancel-btn" @click="handleCancel">Cancel</button>
            </div>
          </div>
          <input 
            v-if="isEditing"
            v-model="editedUser.name"
            type="text" 
            class="name-input editing"
          />
          <input 
            v-else
            :value="user.name"
            type="text" 
            class="name-input"
            readonly
          />
        </div>

        <!-- About Section -->
        <div class="about-section">
          <div class="section-header">
            <h3>About</h3>
          </div>
          
          <div class="about-grid">
            <div class="about-item">
              <label class="about-label">fbid</label>
              <span class="about-value">8961607923947215</span>
            </div>
            <div class="about-item">
              <label class="about-label">City, Country</label>
              <span class="about-value">{{ user.country }}</span>
            </div>
            <div class="about-item">
              <label class="about-label">Email</label>
              <span class="about-value">{{ user.name.toLowerCase().replace(' ', '_') }}@test.com</span>
            </div>
            <div class="about-item">
              <label class="about-label">Phone</label>
              <span class="about-value">{{ user.phone_number }}</span>
            </div>
            <div class="about-item">
              <label class="about-label">Timezone</label>
              <span class="about-value">0</span>
            </div>
            <div class="about-item">
              <label class="about-label">Gender</label>
              <span class="about-value">N/A</span>
            </div>
            <div class="about-item">
              <label class="about-label">Source</label>
              <span class="about-value">{{ user.type }}</span>
            </div>
            <div class="about-item">
              <label class="about-label">OS</label>
              <span class="about-value">{{ user.os }}</span>
            </div>
            <div class="about-item">
              <label class="about-label">Last Converse</label>
              <span class="about-value">{{ user.created_at }}</span>
            </div>
            <div class="about-item">
              <label class="about-label">Last Page</label>
              <span class="about-value">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-details {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.details-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  background-color: white;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--color-text-secondary);
}

.details-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.details-sidebar {
  width: 280px;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-profile {
  text-align: center;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  background-color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 24px;
  margin: 0 auto 16px;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}

.status-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.status-btn.active {
  background-color: var(--color-success);
  color: white;
}

.status-btn.inactive {
  background-color: var(--color-error);
  color: white;
}

.details-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.nav-item:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-secondary);
}

.nav-item.active {
  background-color: var(--color-success);
  color: white;
}

.details-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.name-section {
  margin-bottom: 24px;
}

.name-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  margin-right: auto;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.save-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background-color: var(--color-primary-hover);
}

.cancel-btn {
  background-color: var(--color-error);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.name-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 16px;
  background-color: #f8f9fa;
}

.name-input.editing {
  background-color: white;
}

.name-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.about-section {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  background-color: var(--color-primary);
  color: white;
  padding: 16px 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 20px;
}

.about-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.about-item:nth-child(odd) {
  padding-right: 20px;
}

.about-item:nth-child(even) {
  padding-left: 20px;
  border-left: 1px solid var(--color-border);
}

.about-label {
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.about-value {
  font-size: 14px;
  color: #212529;
  font-weight: 500;
}

.attributes-section {
  padding: 20px;
  border-top: 1px solid var(--color-border);
}

.attributes-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.attributes-btn:hover {
  background-color: var(--color-primary-hover);
}

@media (max-width: 768px) {
  .details-content {
    flex-direction: column;
  }
  
  .details-sidebar {
    width: 100%;
    padding: 16px;
  }
  
  .about-grid {
    grid-template-columns: 1fr;
  }
  
  .about-item:nth-child(even) {
    padding-left: 0;
    border-left: none;
  }
}
</style>