<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { UserAttribute } from '@/types/user';

const props = defineProps<{
  attributes: UserAttribute[]
}>()

const emit = defineEmits<{
  close: []
  update: [attributes: UserAttribute[]]
}>()

const localAttributes = ref<UserAttribute[]>([...props.attributes])
const editingId = ref<number | null>(null)
const newAttribute = ref<{ key: string; value: string }>({ key: '', value: '' })
const isAddingNew = ref<boolean>(false)

const startEdit = (id: number): void => {
  editingId.value = id
}

const cancelEdit = (): void => {
  editingId.value = null
  // Reset to original values
  localAttributes.value = [...props.attributes]
}

const saveEdit = (id: number): void => {
  editingId.value = null
  emit('update', localAttributes.value)
}

const deleteAttribute = (id: number): void => {
  localAttributes.value = localAttributes.value.filter(attr => attr.id !== id)
  emit('update', localAttributes.value)
}

const startAddNew = (): void => {
  isAddingNew.value = true
  newAttribute.value = { key: '', value: '' }
}

const cancelAddNew = (): void => {
  isAddingNew.value = false
  newAttribute.value = { key: '', value: '' }
}

const saveNewAttribute = (): void => {
  if (newAttribute.value.key.trim() && newAttribute.value.value.trim()) {
    const newId = Math.max(...localAttributes.value.map(attr => attr.id), 0) + 1
    localAttributes.value.push({
      id: newId,
      key: newAttribute.value.key.trim(),
      value: newAttribute.value.value.trim()
    })
    emit('update', localAttributes.value)
    isAddingNew.value = false
    newAttribute.value = { key: '', value: '' }
  }
}

const handleClose = (): void => {
  emit('close')
}
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

      <div class="attributes-content">
        <div class="attributes-table">
          <div class="table-header">
            <div class="header-cell">KEY</div>
            <div class="header-cell">VALUE</div>
            <div class="header-cell">ACTION</div>
          </div>

          <!-- Add New Attribute Row -->
          <div v-if="isAddingNew" class="table-row editing">
            <div class="table-cell">
              <input
                v-model="newAttribute.key"
                type="text"
                placeholder="Enter key"
                class="attribute-input"
                @keyup.enter="saveNewAttribute"
                @keyup.escape="cancelAddNew"
              />
            </div>
            <div class="table-cell">
              <input
                v-model="newAttribute.value"
                type="text"
                placeholder="Enter value"
                class="attribute-input"
                @keyup.enter="saveNewAttribute"
                @keyup.escape="cancelAddNew"
              />
            </div>
            <div class="table-cell">
              <div class="action-buttons">
                <button class="save-btn" @click="saveNewAttribute">
                  Save
                </button>
                <button class="cancel-btn" @click="cancelAddNew">
                  Cancel
                </button>
              </div>
            </div>
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
                v-model="attribute.key"
                type="text"
                class="attribute-input"
                @keyup.enter="saveEdit(attribute.id)"
                @keyup.escape="cancelEdit"
              />
              <span v-else>{{ attribute.key }}</span>
            </div>
            <div class="table-cell">
              <input
                v-if="editingId === attribute.id"
                v-model="attribute.value"
                type="text"
                class="attribute-input"
                @keyup.enter="saveEdit(attribute.id)"
                @keyup.escape="cancelEdit"
              />
              <span v-else>{{ attribute.value }}</span>
            </div>
            <div class="table-cell">
              <div v-if="editingId === attribute.id" class="action-buttons">
                <button class="save-btn" @click="saveEdit(attribute.id)">
                  Save
                </button>
                <button class="cancel-btn" @click="cancelEdit">
                  Cancel
                </button>
              </div>
              <div v-else class="action-buttons">
                <button class="edit-btn" @click="startEdit(attribute.id)">
                  <i class="pi pi-pencil" />
                </button>
                <button class="delete-btn" @click="deleteAttribute(attribute.id)">
                  <i class="pi pi-trash" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Button -->
        <div v-if="!isAddingNew" class="add-section">
          <button class="add-btn" @click="startAddNew">
            <i class="pi pi-plus" />
            Add New Attribute
          </button>
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.attributes-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.attributes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.attributes-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.close-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #e9ecef;
}

.attributes-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.attributes-table {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 120px;
  background-color: #4285f4;
  color: white;
}

.header-cell {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 120px;
  border-bottom: 1px solid #e9ecef;
  background-color: white;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.editing {
  background-color: #f8f9ff;
}

.table-cell {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #212529;
}

.attribute-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.attribute-input:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  width: 100%;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn {
  color: #4285f4;
}

.edit-btn:hover {
  background-color: #e3f2fd;
}

.delete-btn {
  color: #dc3545;
}

.delete-btn:hover {
  background-color: #ffebee;
}

.save-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background-color: #3367d6;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #c82333;
}

.add-section {
  margin-top: 16px;
  text-align: center;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #218838;
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