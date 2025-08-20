<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import { axiosInstance } from '@/utils/axiosInstance'
import { getCurrentApiKey } from '@/utils/apiKeyUtils'
import DateRange from '@/components/ui/DateRange.vue'

interface StatsResponse {
  hours_saved?: number
  incoming_messages?: number
  outgoing_messages?: number
  total_users?: number
}

const loading = ref<boolean>(false)

// UI date range (YYYY-MM-DD) defaults to last 1 month
const uiDateRange = ref<{ start: string; end: string }>({
  start: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
  end: dayjs().format('YYYY-MM-DD')
})
const stats = ref<Required<StatsResponse>>({
  hours_saved: 0,
  incoming_messages: 0,
  outgoing_messages: 0,
  total_users: 0
})

const fetchStats = async () => {
  try {
    loading.value = true
    const startDate = uiDateRange.value.start
      ? dayjs(uiDateRange.value.start).startOf('day').toISOString()
      : dayjs().subtract(1, 'month').startOf('day').toISOString()
    const endDate = uiDateRange.value.end
      ? dayjs(uiDateRange.value.end).endOf('day').toISOString()
      : dayjs().endOf('day').toISOString()

    const response = await axiosInstance.get('/v1/analytics-stats', {
      params: {
        apikey: getCurrentApiKey(),
        dateRange: JSON.stringify({ startDate, endDate })
      }
    });
    const data: StatsResponse = response?.data?.data || {}
    stats.value = {
      hours_saved: Number(data.hours_saved) || 0,
      incoming_messages: Number(data.incoming_messages) || 0,
      outgoing_messages: Number(data.outgoing_messages) || 0,
      total_users: Number(data.total_users) || 0
    }
  } catch (error) {
    // Silently fail; keep zeros
    console.error('Failed to load analytics stats', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)

const onDateChange = (value: { start: string; end: string }) => {
  uiDateRange.value = value
  fetchStats()
}

const cards = computed(() => [
  {
    key: 'total_users',
    label: 'Total Users',
    value: stats.value.total_users,
    icon: 'pi pi-users'
  },
  {
    key: 'incoming_messages',
    label: 'Total Incoming Messages',
    value: stats.value.incoming_messages,
    icon: 'pi pi-inbox'
  },
  {
    key: 'outgoing_messages',
    label: 'Total Outgoing Messages',
    value: stats.value.outgoing_messages,
    icon: 'pi pi-send'
  },
  {
    key: 'hours_saved',
    label: 'Total Hours Save (estimated)',
    value: stats.value.hours_saved,
    icon: 'pi pi-clock'
  }
])
</script>

<template>
  <div class="stats-toolbar">
    <div class="date-range">
      <DateRange :model-value="uiDateRange" @update:model-value="onDateChange" />
    </div>
  </div>

  <div class="stats-cards">
    <div v-for="card in cards" :key="card.key" class="stat-card">
      <div class="stat-content">
        <div class="stat-text">
          <div class="stat-label">{{ card.label }}</div>
          <div class="stat-value">
            <span v-if="!loading">{{ card.value.toLocaleString() }}</span>
            <span v-else class="skeleton-line"></span>
            <span v-if="card.key === 'hours_saved' && !loading" class="unit">hrs</span>
          </div>
        </div>
        <div class="stat-icon">
          <i :class="card.icon"></i>
        </div>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.stats-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.date-range {
  width: 280px;
  min-width: 240px;
}

.date-range :deep(.vue3-date-time-picker) {
  height: 44px;
  width: 100%;
}

.date-range :deep(.vue3-date-time-picker input) {
  height: 44px;
  padding: 12px 16px;
  font-size: 13px;
  width: 100%;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.stat-card {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.stat-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-value {
  color: var(--color-text-primary);
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.unit {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  background-color: transparent;
  flex: 0 0 64px;
  min-width: 64px;
  min-height: 64px;
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
}

.stat-icon i {
  font-size: 1.5rem;
}

.skeleton-line {
  display: inline-block;
  width: 80px;
  height: 20px;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06));
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats-toolbar {
    justify-content: flex-start;
  }
}

@media (max-width: 767px) {
  .stats-cards {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
  .date-range {
    width: 100%;
  }
}
</style>


