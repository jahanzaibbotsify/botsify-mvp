<template>
  <div class="user-profile-content">
    <div class="detail-item">
      <span class="detail-label">Source:</span>
      <span class="detail-value">{{ user?.source || 'Facebook' }}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Last Converse:</span>
      <span class="detail-value">{{ user?.lastConverse || '0000-00-00 00:00:00' }}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Phone:</span>
      <span class="detail-value">{{ user?.phone || '1234567890' }}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Country:</span>
      <span class="detail-value">{{ user?.country || 'United States' }}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">OS:</span>
      <span class="detail-value">{{ user?.os || 'N/A' }}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Last Page:</span>
      <span class="detail-value">{{ user?.lastPage || '' }}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">UID:</span>
      <span class="detail-value">{{ user?.fbid || '8962630583802781' }}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Currently Assigned To:</span>
      <span class="detail-value">{{ user?.assignedTo || '' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExtendedChat } from '@/types'

interface Props {
  user?: ExtendedChat | null
}

defineProps<Props>()
</script>

<style scoped>
.user-profile-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.user-profile-content::-webkit-scrollbar {
  width: 6px;
}

.user-profile-content::-webkit-scrollbar-track {
  background: transparent;
}

.user-profile-content::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 3px;
}

.user-profile-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-tertiary);
}

.detail-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.detail-value {
  color: var(--color-text-primary);
  font-size: 0.75rem;
  text-align: right;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 