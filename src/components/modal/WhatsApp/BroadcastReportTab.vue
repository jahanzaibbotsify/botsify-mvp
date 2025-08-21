<script setup lang="ts">
import { ref, computed } from "vue";
import { Input, Badge, DateRange, Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Button, Pagination } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import { formatDate } from "@/utils";
import { onMounted } from "vue";
import { PaginationData } from "@/types";

// Store
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

// Local pagination state since it's now managed internally
const currentPage = ref(1);
const itemsPerPage = 20;

// Add local pagination data
const paginationData = ref<PaginationData | null>(null);

// API data
const whatsappReportData = computed(() => publishStore.whatsappReport.data?.data?.messages?.data || []);

const totalPages = computed(() => {
  if (paginationData.value) {
    return Math.ceil(paginationData.value.total / paginationData.value.perPage);
  }
  return 1;
});

// Stats data
const stats = ref({
  sent: 0,
  delivered: 0,
  read: 0,
  failed: 0
});

// Methods
const loadReport = async (page = 1) => {
  try {
    const result = await publishStore.whatsappReport.load(page, itemsPerPage, searchQuery.value, dateRange.value.start, dateRange.value.end);
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
      stats.value = result.data.messages.data.reduce((acc: any, report: any) => {
        // Only count today's stats
        // const reportDate = report.sent_time?.split(' ')[0];
        // if (reportDate === today) {
          acc.sent += report.sent || 0;
          acc.delivered += report.delivered || 0;
          acc.read += report.read || 0;
          acc.failed += report.failed || 0;
        // }
        return acc;
      }, { sent: 0, delivered: 0, read: 0, failed: 0 });
      console.log(stats.value, "..............")
    }
  } catch (err) {
    console.error("Failed to load report:", err);
  }
};


// Handle page change from pagination component
const handlePageChange = (page: number) => {
  loadReport(page);
};


const applyFilter = () => {
  // Invalidate SMS broadcast report cache to force fresh data
  publishStore.whatsappReport.invalidate();
  loadReport(1);
}


// Load data on mount
onMounted(() => {
  loadReport(1)
});
</script>

<template>
  <div class="tab-panel">
    <h3>Broadcast report</h3>
    <p class="subtitle">View WhatsApp broadcast analytics and reports</p>
    
    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <Input 
          v-model="searchQuery"
          searchable
          icon-position="left"
          placeholder="Search..."
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
          :loading="publishStore.whatsappReport.loading"
          @click="applyFilter"
        >
          {{ publishStore.whatsappReport.loading ? 'Filtering...' : 'Apply filters' }}
        </Button>
      </div>
    </div>

         <!-- Summary Stats -->
     <div class="stats-section">
       <div class="stat-card sent-card">
         <div class="stat-icon sent-icon">
           <i class="pi pi-send"></i>
         </div>
         <div class="stat-content">
           <div class="stat-value">{{ stats.sent }}</div>
           <div class="stat-label">Sent</div>
         </div>
       </div>
       
       <div class="stat-card delivered-card">
         <div class="stat-icon delivered-icon">
           <i class="pi pi-check-circle"></i>
         </div>
         <div class="stat-content">
           <div class="stat-value">{{ stats.delivered }}</div>
           <div class="stat-label">Delivered</div>
         </div>
       </div>
       
       <div class="stat-card read-card">
         <div class="stat-icon read-icon">
           <i class="pi pi-eye"></i>
         </div>
         <div class="stat-content">
           <div class="stat-value">{{ stats.read }}</div>
           <div class="stat-label">Read</div>
         </div>
       </div>
       
       <div class="stat-card failed-card">
         <div class="stat-icon failed-icon">
           <i class="pi pi-times-circle"></i>
         </div>
         <div class="stat-content">
           <div class="stat-value">{{ stats.failed }}</div>
           <div class="stat-label">Failed</div>
         </div>
       </div>
     </div>

      <!-- Messages Table -->
    <div class="table-section">
      <Table>
        <TableHead>
          <TableHeader width="150px">Template name</TableHeader>
          <TableHeader>Phone number</TableHeader>
          <TableHeader>Sent time</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader width="300px">Failure reason</TableHeader>
        </TableHead>
        <TableBody>
          <!-- Loading State -->
          <TableRow v-if="publishStore.whatsappReport.loading" v-for="i in 5" :key="`loading-${i}`">
            <TableCell :isLoading="true" skeletonType="badge"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
          </TableRow>

          <!-- Empty State -->
          <TableRow v-else-if="!whatsappReportData.length">
            <TableCell :noData="true" colspan="5">
              <div class="empty-state">
                <div class="empty-icon">
                  <i class="pi pi-inbox"></i>
                </div>
                <h4>No Whatsapp broadcast found</h4>
                <p>No Whatsapp broadcast have been sent yet. Start sending broadcast to see them here.</p>
              </div>
            </TableCell>
          </TableRow>

          <!-- Data State -->
          <TableRow v-else v-for="report in whatsappReportData" :key="report.id">
            <TableCell>{{ report.template_name || 'N/A' }}</TableCell>
             <TableCell>{{ report.number || 'N/A' }}</TableCell>
             <TableCell>{{ report.sent_time ? formatDate(report.sent_time) : 'N/A' }}</TableCell>
             <TableCell><Badge :variant="report.sent ? 'success' : 'error'">{{ report.sent ? 'Sent' : 'Failed' }}</Badge></TableCell>
             <TableCell>{{ report.failure_reason || 'N/A' }}</TableCell>
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
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all var(--transition-normal, 0.2s ease);
}

.stat-card:hover {
  background: var(--color-bg-hover, #f3f4f6);
  border-color: var(--color-primary, #3b82f6);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full, 9999px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

/* Sent card - Blue */
.sent-icon {
  background: var(--color-primary, #3b82f6);
}

/* Delivered card - Green */
.delivered-icon {
  background: var(--color-success, #10b981);
}

/* Read card - Purple */
.read-icon {
  background: var(--color-accent, #8b5cf6);
}

/* Failed card - Red */
.failed-icon {
  background: var(--color-error, #ef4444);
}

.stat-content {
  flex: 1;
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

.table-section {
  margin-bottom: 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8, 64px);
  color: var(--color-text-tertiary, #9ca3af);
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: var(--space-3, 12px);
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .stat-value {
    font-size: 20px;
  }
}
</style> 