<script setup lang="ts">
import { ref, computed } from "vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

const emit = defineEmits<{
  'filter-report': [filters: any];
}>();

// Reactive data
const selectedPeriod = ref('7d');
const selectedStatus = ref('all');

// Sample report data
const reportData = ref([
  {
    id: 1,
    message: 'Welcome Campaign',
    recipients: 150,
    delivered: 142,
    read: 89,
    status: 'completed',
    sentAt: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    message: 'Product Launch',
    recipients: 200,
    delivered: 195,
    read: 156,
    status: 'completed',
    sentAt: '2024-01-14 14:20:00'
  },
  {
    id: 3,
    message: 'Weekly Newsletter',
    recipients: 300,
    delivered: 287,
    read: 201,
    status: 'completed',
    sentAt: '2024-01-13 09:15:00'
  }
]);

// Computed properties
const filteredReports = computed(() => {
  let filtered = reportData.value;
  
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(report => report.status === selectedStatus.value);
  }
  
  return filtered;
});

const totalRecipients = computed(() => {
  return filteredReports.value.reduce((sum, report) => sum + report.recipients, 0);
});

const totalDelivered = computed(() => {
  return filteredReports.value.reduce((sum, report) => sum + report.delivered, 0);
});

const totalRead = computed(() => {
  return filteredReports.value.reduce((sum, report) => sum + report.read, 0);
});

const readRate = computed(() => {
  return totalDelivered.value > 0 ? ((totalRead.value / totalDelivered.value) * 100).toFixed(1) : '0';
});



const filterReport = () => {
  emit('filter-report', {
    period: selectedPeriod.value,
    status: selectedStatus.value
  });
};

// Expose methods for parent component
defineExpose({
  filterReport
});
</script>

<template>
  <div class="tab-panel">
    <h3>Broadcast Report</h3>
    <p class="subtitle">View broadcast analytics and reports</p>
    
    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="period-filter">Time Period</label>
        <select id="period-filter" v-model="selectedPeriod" class="form-input">
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="status-filter">Status</label>
        <select id="status-filter" v-model="selectedStatus" class="form-input">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      
      <button class="filter-button" @click="filterReport">
        Apply Filters
      </button>
    </div>

    <!-- Summary Stats -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-value">{{ totalRecipients }}</div>
        <div class="stat-label">Total Recipients</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalDelivered }}</div>
        <div class="stat-label">Delivered</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalRead }}</div>
        <div class="stat-label">Read</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ readRate }}%</div>
        <div class="stat-label">Read Rate</div>
      </div>
    </div>

    <!-- Report Table -->
    <div class="report-table">
      <div class="table-header">
        <div class="header-cell">Message</div>
        <div class="header-cell">Recipients</div>
        <div class="header-cell">Delivered</div>
        <div class="header-cell">Read</div>
        <div class="header-cell">Status</div>
        <div class="header-cell">Sent At</div>
      </div>
      
      <div 
        v-for="report in filteredReports" 
        :key="report.id"
        class="table-row"
      >
        <div class="cell">{{ report.message }}</div>
        <div class="cell">{{ report.recipients }}</div>
        <div class="cell">{{ report.delivered }}</div>
        <div class="cell">{{ report.read }}</div>
        <div class="cell">
          <span class="status-badge" :class="report.status">
            {{ report.status }}
          </span>
        </div>
        <div class="cell">{{ report.sentAt }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-panel {
  padding: 0;
}

.tab-panel h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: end;
}

.filter-group {
  flex: 1;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-family: inherit;
  transition: border-color var(--transition-normal, 0.2s ease);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-button {
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background var(--transition-normal, 0.2s ease);
}

.filter-button:hover {
  background: var(--color-primary-hover, #2563eb);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.report-table {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  margin-bottom: 24px;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.header-cell {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary, #111827);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  transition: background var(--transition-normal, 0.2s ease);
}

.table-row:hover {
  background: var(--color-bg-secondary, #f9fafb);
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-primary, #111827);
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.completed {
  background: var(--color-secondary, #10b981);
  color: white;
}

.status-badge.pending {
  background: var(--color-warning, #f59e0b);
  color: white;
}

.status-badge.failed {
  background: var(--color-error, #ef4444);
  color: white;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .report-table {
    font-size: 12px;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .header-cell,
  .cell {
    padding: 8px 12px;
  }
}
</style> 