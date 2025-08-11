<script setup lang="ts">
import { ref, watch } from 'vue'
import { UserAttribute } from '@/types/user';
import { userApi } from '@/services/userApi'
import { User } from '@/types/user';

const props = defineProps<{
  attributes: UserAttribute[]
  user?: User // Add user ID for API calls
}>()

// Debug logging
console.log('Attributes component props:', props)

const emit = defineEmits<{
  close: []
  update: [attributes: UserAttribute[]]
}>()

const localAttributes = ref<UserAttribute[]>([...props.attributes])
const editingId = ref<number | null>(null)
const loading = ref<boolean>(false)
const errorMessage = ref<string>('')

const startEdit = (id: number): void => {
  editingId.value = id
  
  // Pre-fill the new_key and new_value with current values
  const attribute = localAttributes.value.find(attr => attr.id === id)
  if (attribute) {
    attribute.new_key = attribute.key
    attribute.new_value = attribute.value
  }
}

const cancelEdit = (): void => {
  editingId.value = null
  // Reset to original values
  localAttributes.value = [...props.attributes]
  errorMessage.value = ''
}

const saveEdit = async (id: number): Promise<void> => {
  if (!props.user?.id) {
    console.error('User ID is required for updating attributes')
    window.$toast.error('Error: User ID is missing. Please try again.')
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const attributeToUpdate = localAttributes.value.find(attr => attr.id === id)
    if (!attributeToUpdate) {
      throw new Error('Attribute not found')
    }

    // Prepare the attribute update payload
    const updatePayload = [{
      id: attributeToUpdate.id,
      entity_id: attributeToUpdate.entity_id,
      key: attributeToUpdate.key,
      value: attributeToUpdate.value,
      new_key: attributeToUpdate.new_key || attributeToUpdate.key,
      new_value: attributeToUpdate.new_value || attributeToUpdate.value
    }]

    const response = await userApi.updateUserAttributes([props.user?.id], updatePayload)

    if (response.success && response.data) {
      const updateData = response.data
      
      if (updateData.status === "success" || updateData.success) {
        // Update the local attribute with new values
        const index = localAttributes.value.findIndex(attr => attr.id === id)
        if (index !== -1) {
          localAttributes.value[index] = {
            ...localAttributes.value[index],
            key: attributeToUpdate.new_key || attributeToUpdate.key,
            value: attributeToUpdate.new_value || attributeToUpdate.value
          }
        }
        
        editingId.value = null
        emit('update', localAttributes.value)
        
        // Show success message
        window.$toast.success(`Attribute updated successfully! Updated: ${updateData.updated_count || 1} attribute(s)`)
      } else {
        throw new Error(updateData.message || 'Update failed')
      }
    } else {
      throw new Error(response.message || 'Update failed')
    }
  } catch (error) {
    console.error('Error updating attribute:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update attribute'
    window.$toast.error(`Failed to update attribute: ${errorMessage.value}`)
  } finally {
    loading.value = false
  }
}

const deleteAttribute = (id: number) => {
  const userId = props.user?.id 
  const userFbId = props.user?.fbId

  if (!userId || !userFbId) {
    console.error('User ID is required for deleting attributes')
    window.$toast.error('Error: User ID is missing. Please try again.')
    return
  }

  window.$confirm({
    text: 'Are you sure you want to delete this attribute?',
  }, async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await userApi.deleteUserAttribute(userFbId, id)

      if (response.success && response.data) {
        const deleteData = response.data

        if (deleteData.success) {
          localAttributes.value = localAttributes.value.filter(attr => attr.id !== id)
          emit('update', localAttributes.value)

          window.$toast.success(
            `Attribute deleted successfully! Deleted: ${deleteData.deleted_count || 1} attribute(s)`
          )
        } else {
          throw new Error(deleteData.message || 'Delete failed')
        }
      } else {
        throw new Error(response.message || 'Delete failed')
      }
    } catch (error) {
      console.error('Error deleting attribute:', error)
      errorMessage.value = error instanceof Error ? error.message : 'Failed to delete attribute'
      window.$toast.error(`Failed to delete attribute: ${errorMessage.value}`)
    } finally {
      loading.value = false
    }
  })
}


const handleClose = (): void => {
  emit('close')
}

// Watch for changes in props.attributes and update local state
watch(() => props.attributes, (newAttributes) => {
  localAttributes.value = [...newAttributes]
}, { immediate: true })
</script>

<template>
  <div class="attributes-overlay">
    <div class="attributes-modal">
      <div class="attributes-header">
        <h3>User Attributes</h3>
        <button class="close-btn" @click="handleClose">
          <i class="pi pi-times" />
        </button>
      </div>

      <!-- Error Message -->
      <!-- <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div> -->

      <div class="attributes-content">
        <div class="attributes-table">
          <div class="table-header">
            <div class="header-cell">KEY</div>
            <div class="header-cell">VALUE</div>
            <div class="header-cell">ACTION</div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Processing...</p>
          </div>

          <!-- Existing Attributes -->
          <div
            v-for="attribute in localAttributes"
            :key="attribute.id"
            class="table-row"
            :class="{ editing: editingId === attribute.id }"
          >
            <div class="table-cell">
              <input
                v-if="editingId === attribute.id"
                v-model="attribute.new_key"
                type="text"
                class="attribute-input"
                placeholder="Enter new key"
                @keyup.enter="saveEdit(attribute.id)"
                @keyup.escape="cancelEdit"
              />
              <span v-else>{{ attribute.key }}</span>
            </div>
            <div class="table-cell">
              <input
                v-if="editingId === attribute.id"
                v-model="attribute.new_value"
                type="text"
                class="attribute-input"
                placeholder="Enter new value"
                @keyup.enter="saveEdit(attribute.id)"
                @keyup.escape="cancelEdit"
              />
              <span v-else>{{ attribute.value }}</span>
            </div>
            <div class="table-cell">
              <div v-if="editingId === attribute.id" class="action-buttons">
                <button 
                  class="save-btn" 
                  @click="saveEdit(attribute.id)"
                  :disabled="loading"
                >
                  <span v-if="loading" class="mini-spinner"></span>
                  Save
                </button>
                <button 
                  class="cancel-btn" 
                  @click="cancelEdit"
                  :disabled="loading"
                >
                  Cancel
                </button>
              </div>
              <div v-else class="action-buttons">
                <button 
                  class="edit-btn" 
                  @click="startEdit(attribute.id)"
                  :disabled="loading"
                >
                  <i class="pi pi-pen-to-square"></i>
                </button>
                <button 
                  class="delete-btn" 
                  @click="deleteAttribute(attribute.id)"
                  :disabled="loading"
                >
                  <i class="pi pi-trash" />
                </button>
              </div>
            </div>
          </div>

          <!-- No Attributes Message -->
          <div v-if="localAttributes.length === 0 && !loading" class="no-attributes">
            <p>No attributes found for this user.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attributes-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  background-image: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.attributes-modal {
  width: 90%;
  max-width: 600px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-border);
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.attributes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(to right, rgba(0, 163, 255, 0.05), transparent);
}

.attributes-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  padding: var(--space-1);
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.close-btn:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
}

.error-message {
  background-color: var(--color-error);
  color: white;
  padding: 12px 24px;
  font-size: 14px;
  border-bottom: 1px solid var(--color-border);
}

.attributes-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  position: relative;
}

.attributes-table {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-bg-tertiary);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.mini-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 120px;
  background-color: var(--color-primary);
  color: white;
}

.header-cell {
  padding: var(--space-3) var(--space-4);
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 120px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.editing {
  background-color: var(--color-bg-secondary);
}

.table-cell {
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.attribute-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-normal);
}

.attribute-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 163, 255, 0.2);
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  width: 100%;
}

.edit-btn, .delete-btn {
  background: transparent;
  border: none;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.edit-btn {
  color: var(--color-primary);
}

.edit-btn:hover:not(:disabled) {
  background-color: var(--color-bg-tertiary);
}

.edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  color: var(--color-error);
}

.delete-btn:hover:not(:disabled) {
  background-color: var(--color-bg-tertiary);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn {
  background-color: var(--color-primary);
  opacity: 0.9;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

.save-btn:hover:not(:disabled) {
  opacity: 1;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: var(--color-error);
  opacity: 0.9;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  opacity: 1;
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-attributes {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .attributes-modal {
    width: 95%;
    margin: 20px;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr 100px;
  }
  
  .header-cell,
  .table-cell {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>