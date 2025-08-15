<script setup lang="ts">
import { ref, computed } from "vue";
import { Input, Badge, DateRange, Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Button, Pagination } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import { formatTime } from "@/utils";
import { onMounted } from "vue";

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
const itemsPerPage = ref(20);

// API data
const allReportData = ref<any[]>([]); // Store all data from API

// Stats data
const stats = ref({
  sent: 0,
  delivered: 0,
  read: 0,
  failed: 0
});

// Add local pagination data
const paginationData = ref<{
  page: number;
  perPage: number;
  total: number;
  to: number;
  prev_page_url: string | null;
} | null>(null);

// Computed properties
const filteredReports = computed(() => {
  let filtered = allReportData.value;
  
  if (searchQuery.value) {
    filtered = filtered.filter(report => 
      report.template_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      report.number?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  // Apply date range filter
  if (dateRange.value.start && dateRange.value.end) {
    filtered = filtered.filter(report => {
      const reportDate = report.sent_time?.split(' ')[0];
      return reportDate >= dateRange.value.start && reportDate <= dateRange.value.end;
    });
  }
  
  return filtered;
});

// Computed pagination for filtered data
const paginatedReports = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredReports.value.slice(startIndex, endIndex);
});


// Methods
const fetchReportData = async (forceRefresh = false) => {
  if (publishStore.isLoading) return;
  
  try {
    // Only fetch if we don't have data yet or if force refresh is requested
    if (allReportData.value.length === 0 || forceRefresh) {
      const result = await publishStore.getWhatsAppBroadcastReport({ page: currentPage.value, per_page: itemsPerPage.value, query: searchQuery.value, start_date: dateRange.value.start, end_date: dateRange.value.end });
      
      if (result.success && result.data.messages) {
        allReportData.value = result.data.messages.data || [];
        calculateStats();
        
        // Update local pagination state with API response
        if (result.data.messages.pagination) {
          paginationData.value = {
            page: result.data.messages.pagination.page || currentPage.value,
            perPage: result.data.messages.pagination.per_page || itemsPerPage.value,
            total: result.data.messages.pagination.total || 0,
            to: result.data.messages.pagination.to || 0,
            prev_page_url: result.data.messages.pagination.prev_page_url || null
          };
          // Sync currentPage with the actual page from API response
          currentPage.value = result.data.messages.pagination.page || currentPage.value;
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch report data:', error);
  }
};

const refreshData = async () => {
  await fetchReportData(true);
};

const calculateStats = () => {
  
  stats.value = allReportData.value.reduce((acc, report) => {
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
};

// Handle page change from pagination component
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchReportData();
};

const applyFilter = () => {
  fetchReportData(true);
}
// Load data on mount
onMounted(() => {
  refreshData();
});

// Expose only necessary methods for parent component
defineExpose({
  refreshData
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
          placeholder="Search by template name or number..."
        />
      </div>
      
      <div class="filter-group">
        <DateRange
          v-model="dateRange"
          label="Date Range"
        />
      </div>
      
      <div class="filter-group">
        <Button
          variant="primary"
          size="medium"
          :loading="publishStore.isLoading"
          @click="applyFilter"
        >
          {{ publishStore.isLoading ? 'Filtering...' : 'Apply filters' }}
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
           <div class="stat-label">Sent (today)</div>
         </div>
       </div>
       
       <div class="stat-card delivered-card">
         <div class="stat-icon delivered-icon">
           <i class="pi pi-check-circle"></i>
         </div>
         <div class="stat-content">
           <div class="stat-value">{{ stats.delivered }}</div>
           <div class="stat-label">Delivered (today)</div>
         </div>
       </div>
       
       <div class="stat-card read-card">
         <div class="stat-icon read-icon">
           <i class="pi pi-eye"></i>
         </div>
         <div class="stat-content">
           <div class="stat-value">{{ stats.read }}</div>
           <div class="stat-label">Read (today)</div>
         </div>
       </div>
       
       <div class="stat-card failed-card">
         <div class="stat-icon failed-icon">
           <i class="pi pi-times-circle"></i>
         </div>
         <div class="stat-content">
           <div class="stat-value">{{ stats.failed }}</div>
           <div class="stat-label">Failed (today)</div>
         </div>
       </div>
     </div>

    <!-- Report Table -->
    <div class="table-section">
      <Table>
        <TableHead>
          <TableHeader>Template name</TableHeader>
          <TableHeader>Phone number</TableHeader>
          <TableHeader>Sent time</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader width="350px">Failure reason</TableHeader>
        </TableHead>
        
        <TableBody>
          <!-- Loading skeleton -->
          <TableRow v-if="publishStore.loadingStates.broadcastReport" v-for="i in 5" :key="`skeleton-${i}`" skeleton>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
          </TableRow>
          
                     <!-- Empty state -->
           <TableRow v-else-if="paginatedReports.length === 0" noData>
             <TableCell noData colspan="8">
               <div class="empty-state">
                 <i class="pi pi-inbox"></i>
                 <p>No broadcast reports found</p>
               </div>
             </TableCell>
           </TableRow>
          
                     <!-- Report rows -->
           <TableRow v-else v-for="report in paginatedReports" :key="report.id">
             <TableCell>{{ report.template_name || 'N/A' }}</TableCell>
             <TableCell>{{ report.number || 'N/A' }}</TableCell>
             <TableCell>{{ report.sent_time ? formatTime(report.sent_time) : 'N/A' }}</TableCell>
             <TableCell><Badge :variant="report.sent ? 'success' : 'error'">{{ report.sent ? 'Sent' : 'Failed' }}</Badge></TableCell>
             <TableCell>{{ report.failure_reason || 'N/A' }}</TableCell>
           </TableRow>
        </TableBody>
      </Table>
      
      <!-- Pagination -->
      <div v-if="!publishStore.loadingStates.broadcastReport && paginatedReports.length > 0 && paginationData?.total && paginationData.total > 0" class="agent-pagination-section">
        <Pagination
          :current-page="currentPage || 1"
          :total-pages="paginationData ? Math.ceil(paginationData.total / paginationData.perPage) : 1"
          :total-items="paginationData?.total || 0"
          :items-per-page="itemsPerPage || 20"
                      :disabled="publishStore.loadingStates.broadcastReport || false"
          @page-change="handlePageChange"
        />
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