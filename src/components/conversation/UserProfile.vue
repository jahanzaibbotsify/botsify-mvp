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
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.detail-value {
  color: var(--color-text-primary);
  font-size: 0.875rem;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}
</style> 