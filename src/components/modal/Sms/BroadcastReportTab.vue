<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import { Table, TableHead, TableBody, TableHeader, TableCell, Badge,  Input, Button, DateRange, Pagination } from "@/components/ui";
import { formatDate } from "@/utils";
import { PaginationData } from "@/types";
import TableRow from "@/components/ui/TableRow.vue";

defineEmits<{
  'page-change': [page: number];
}>();

const publishStore = usePublishStore();

// Reactive data
const searchQuery = ref('');

// Set default date range: end date as today, start date as 1 month before
const getDefaultDateRange = () => {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  
  return {
    start: oneMonthAgo.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0]
  };
};

const dateRange = ref(getDefaultDateRange());


// Computed properties for SMS templates resource
const currentPage = ref(1);
const itemsPerPage = 20; // Match the API per_page default

// Add local pagination data
const paginationData = ref<PaginationData | null>(null);

// Computed properties for SMS templates resource
const smsReportData = computed(() => publishStore.smsReport.data?.data?.messages?.data || []);

const totalPages = computed(() => {
  if (paginationData.value) {
    return Math.ceil(paginationData.value.total / paginationData.value.perPage);
  }
  return 1;
});

// Stats cards data
const statsCards = ref([
  { 
    title: 'SENT', 
    value: 0, 
    icon: 'pi pi-send',
    color: 'var(--color-primary, #3b82f6)',
    bgColor: 'rgba(59, 130, 246, 0.1)'
  },
  { 
    title: 'DELIVERED', 
    value: 0, 
    icon: 'pi pi-check-circle',
    color: 'var(--color-secondary, #10b981)',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  { 
    title: 'FAILED', 
    value: 0, 
    icon: 'pi pi-times-circle',
    color: 'var(--color-error, #ef4444)',
    bgColor: 'rgba(239, 68, 68, 0.1)'
  }
]);


// Sync report when loaded
const loadReport = async (page = 1) => {
  try {
    const result = await publishStore.smsReport.load(page, itemsPerPage, searchQuery.value, dateRange.value.start, dateRange.value.end);
    if (result?.data?.messages) {
      paginationData.value = {
        page: result.data.messages.page || page,
        perPage: result.data.messages.per_page || itemsPerPage,
        total: result.data.messages.total || 0,
        to: result.data.messages.to || 0,
        prev_page_url: result.data.messages.prev_page_url || null,
      };

      currentPage.value = result.data.messages.page || page;

      // update stats
      statsCards.value[0].value = result.data.sent || 0;
      statsCards.value[1].value = result.data.delivered || 0;
      statsCards.value[2].value = result.data.failed || 0;
    }
  } catch (err) {
    console.error("Failed to load report:", err);
  }
};

const handlePageChange = (page: number) => {
  loadReport(page);
};

// Helper functions
const getStatusVariant = (message: any) => {
  if (message.failed > 0) return 'error';
  if (message.delivered > 0) return 'success';
  if (message.sent > 0) return 'primary';
  return 'warning';
};

const getStatusText = (message: any) => {
  if (message.failed > 0) return 'Failed';
  if (message.delivered > 0) return 'Delivered';
  if (message.sent > 0) return 'Sent';
  return 'Pending';
};

const truncateMessage = (message: string) => {
  if (!message) return '';
  if (message.length <= 200) return message;
  return message.substring(0, 200) + '...';
};

const applyFilter = () => {
  // Invalidate SMS broadcast report cache to force fresh data
  publishStore.smsReport.invalidate();
  loadReport(1);
}


// Load data on mount
onMounted(() => {
  loadReport(1)
});
</script>

<template>
  <div class="tab-panel">
    <h3>SMS report</h3>
    <p class="subtitle">View SMS delivery analytics and reports</p>
    
        <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <Input 
          v-model="searchQuery"
          searchable
          icon-position="left"
          placeholder="Search by template name or number..."
        />
      </div>
      
      <div class="filter-group">
        <DateRange
          v-model="dateRange"
          label="Date Range"
          placeholder="Select date range"
        />
      </div>
      
      <div class="filter-group">
        <Button
          variant="primary"
          size="medium"
          :loading="publishStore.smsReport.loading"
          @click="applyFilter"
        >
          {{ publishStore.smsReport.loading ? 'Filtering...' : 'Apply filters' }}
        </Button>
      </div>
    </div>
    <!-- Stats Cards -->
    <div class="stats-section">
      <div 
        v-for="card in statsCards" 
        :key="card.title"
        class="stat-card"
        :style="{ '--card-color': card.color, '--card-bg': card.bgColor }"
      >
        <div class="stat-icon">
          <i :class="card.icon"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-label">{{ card.title }}</div>
        </div>
      </div>
    </div>
    <!-- Messages Table -->
    <div class="table-section">
      <Table>
        <TableHead>
          <TableHeader width="80px">Status</TableHeader>
          <TableHeader width="150px">Number</TableHeader>
          <TableHeader width="200px">Message</TableHeader>
          <TableHeader width="200px">Failure reason</TableHeader>
          <TableHeader width="80px">Sent at</TableHeader>
        </TableHead>
        <TableBody>
          <!-- Loading State -->
          <TableRow v-if="publishStore.smsReport.loading" v-for="i in 5" :key="`loading-${i}`">
            <TableCell :isLoading="true" skeletonType="badge"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
          </TableRow>

          <!-- Empty State -->
          <TableRow v-else-if="!smsReportData.length">
            <TableCell :noData="true" colspan="5">
              <div class="empty-state">
                <div class="empty-icon">
                  <i class="pi pi-inbox"></i>
                </div>
                <h4>No SMS broadcast found</h4>
                <p>No SMS broadcast have been sent yet. Start sending broadcast to see them here.</p>
              </div>
            </TableCell>
          </TableRow>

          <!-- Data State -->
          <TableRow v-else v-for="message in smsReportData" :key="message.id">
            <TableCell>
              <Badge :variant="getStatusVariant(message)" size="small">
                {{ getStatusText(message) }}
              </Badge>
            </TableCell>
            <TableCell>{{ message.number }}</TableCell>
            <TableCell>{{ truncateMessage(message.message) }}</TableCell>
            <TableCell>{{ message.failure_reason || '-' }}</TableCell>
            <TableCell>{{ formatDate(message.sent_time) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="agent-pagination-section">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="paginationData?.total || 0"
        :items-per-page="20"
        :show-page-info="false"
        :disabled="publishStore.smsReport.loading"
        @page-change="handlePageChange"
      />
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

.filter-group:last-child {
  flex: 0 0 auto;
}

/* Stats Cards */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all var(--transition-normal, 0.2s ease);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full, 9999px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  color: var(--card-color);
}

.stat-icon i {
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary, #111827);
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  font-weight: 500;
}

/* Table Section */
.table-section {
  margin-top: 24px;
}



/* Empty State */
.empty-row {
  border-bottom: none;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-radius: var(--radius-full, 9999px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary, #9ca3af);
}

.empty-icon i {
  font-size: 24px;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>