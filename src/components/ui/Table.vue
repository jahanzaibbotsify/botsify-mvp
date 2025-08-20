<script setup lang="ts">
interface Props {
  selectable?: boolean
  selectAll?: boolean
  onSelectAll?: (checked: boolean) => void
  onRowClick?: (row: any) => void
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  selectable: false,
  selectAll: false,
  clickable: false
})

defineEmits<{
  'select-all': [checked: boolean]
  'row-click': [row: any]
}>()

// const handleSelectAll = (event: Event) => {
//   const target = event.target as HTMLInputElement
//   emit('select-all', target.checked)
// }

// const handleRowClick = (row: any) => {
//   if (props.clickable) {
//     emit('row-click', row)
//   }
// }
</script>

<template>
  <div class="table-container">
    <div class="table-scroll-container">
      <table class="data-table">
        <slot />
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  position: relative;
}

.table-scroll-container {
  overflow-x: auto;
  max-height: 50vh;
  overflow-y: auto;
  background-color: var(--color-bg-secondary);
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.table-scroll-container::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.table-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  transition: filter 0.3s ease;
}

.data-table th {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  white-space: nowrap;
  border-bottom: 2px solid var(--color-border);
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  position: relative;
}

.data-table th.sortable:hover {
  background-color: #f1f5f9;
}

.data-table th.sortable::after {
  content: '↕';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  opacity: 0.7;
}

.data-table th.sortable.asc::after {
  content: '↑';
  opacity: 1;
}

.data-table th.sortable.desc::after {
  content: '↓';
  opacity: 1;
}

.data-table td {
  padding: 16px 12px;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
  background-color: var(--color-bg-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-table tr:hover td {
  background-color: var(--color-bg-hover);
}

.data-table tr.clickable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.data-table tr.clickable:hover {
  background-color: var(--color-bg-hover) !important;
}



@media (max-width: 768px) {
  .data-table {
    font-size: 14px;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 8px;
  }
  
  .data-table th {
    font-size: 12px;
  }
  
  .data-table td {
    font-size: 14px;
  }
}
</style> 