<script setup lang="ts">
import { ref, watch } from 'vue'
import { UserAttribute } from '@/types/user';
import { userApi } from '@/services/userApi'
import { User } from '@/types/user';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Input, Button } from '@/components/ui';
import ModalLayout from '@/components/ui/ModalLayout.vue';

const props = defineProps<{
  attributes: UserAttribute[]
  user?: User // Add user ID for API calls
}>()

// Debug logging
const emit = defineEmits<{
  close: []
  update: [attributes: UserAttribute[]]
}>()

const localAttributes = ref<UserAttribute[]>([...props.attributes])
const editingId = ref<number | null>(null)
const loading = ref<boolean>(false)
const errorMessage = ref<string>('')
const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)

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
        localAttributes.value = localAttributes.value.filter(attr => attr.id !== id)
        emit('update', localAttributes.value)

        window.$toast.success(`Attribute deleted successfully!`)
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
  modalRef.value?.closeModal()
  emit('close')
}

// Watch for changes in props.attributes and update local state
watch(() => props.attributes, (newAttributes) => {
  localAttributes.value = [...newAttributes]
}, { immediate: true })

// Expose methods for parent component
defineExpose({
  openModal: () => modalRef.value?.openModal(),
  closeModal: () => modalRef.value?.closeModal()
})
</script>

<template>
  <ModalLayout 
    ref="modalRef"
    title="User Attributes"
    max-width="850px"
    @close="handleClose"
  >
    <div class="attributes-content">
      <Table>
        <TableHead>
          <TableHeader>KEY</TableHeader>
          <TableHeader>VALUE</TableHeader>
          <TableHeader>ACTIONS</TableHeader>
        </TableHead>
        
        <TableBody>
          <!-- Loading skeleton -->
          <TableRow v-if="loading" v-for="i in 3" :key="`skeleton-${i}`" skeleton>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="actions"></TableCell>
          </TableRow>
          
          <!-- Empty state -->
          <TableRow v-else-if="localAttributes.length === 0" noData>
            <TableCell noData colspan="3">
              <div class="empty-state">
                <i class="pi pi-file-o"></i>
                <p>No attributes found for this user.</p>
              </div>
            </TableCell>
          </TableRow>
          
          <!-- Attribute rows -->
          <TableRow v-else v-for="attribute in localAttributes" :key="attribute.id">
            <TableCell>
              <Input
                v-if="editingId === attribute.id"
                v-model="attribute.new_key"
                type="text"
                placeholder="Enter new key"
                @keyup.enter="saveEdit(attribute.id)"
                @keyup.escape="cancelEdit"
              />
              <span v-else>{{ attribute.key }}</span>
            </TableCell>
            <TableCell>
              <Input
                v-if="editingId === attribute.id"
                v-model="attribute.new_value"
                type="text"
                placeholder="Enter new value"
                @keyup.enter="saveEdit(attribute.id)"
                @keyup.escape="cancelEdit"
              />
              <span v-else>{{ attribute.value }}</span>
            </TableCell>
            <TableCell>
              <div v-if="editingId === attribute.id" class="action-buttons">
                <Button 
                  variant="primary"
                  size="small"
                  @click="saveEdit(attribute.id)"
                  :loading="loading"
                  :disabled="loading"
                >
                  Save
                </Button>
                <Button 
                  variant="error-outline"
                  size="small"
                  @click="cancelEdit"
                  :disabled="loading"
                >
                  Cancel
                </Button>
              </div>
              <div v-else class="action-buttons">
                <Button 
                  variant="primary-outline"
                  size="small"
                  icon="pi pi-pencil"
                  iconOnly
                  @click="startEdit(attribute.id)"
                  :disabled="loading"
                  title="Edit attribute"
                />
                <Button 
                  variant="error-outline"
                  size="small"
                  icon="pi pi-trash"
                  iconOnly
                  @click="deleteAttribute(attribute.id)"
                  :disabled="loading"
                  title="Delete attribute"
                />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </ModalLayout>
</template>

<style scoped>
.attributes-content {
  position: relative;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-style: italic;
}

.empty-state i {
  font-size: 2rem;
  opacity: 0.5;
}
</style>