<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Input, Button, Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";

// Props
interface Props {
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Store
const publishStore = usePublishStore();

// Reactive data
const loading = ref(false);
const saving = ref(false);
const catalogData = ref<any>(null);

// Form data
const webhookDetails = ref({
  business_id: '',
  catalog_access_token: '',
  order_webhook: '',
  catalog_id: null as string | null
});

// Computed properties
const whatsappCloudData = computed(() => {
  if (publishStore.botDetailsCache?.dialog360) {
    return publishStore.botDetailsCache.dialog360;
  } else if (publishStore.botDetailsCache?.whatsapp_cloud) {
    return publishStore.botDetailsCache.whatsapp_cloud;
  }
  return null;
});

const hasAccessToken = computed(() => {
  return whatsappCloudData.value?.catalog_access_token;
});

const hasCatalogData = computed(() => {
  return catalogData.value?.data && catalogData.value.data.length > 0;
});

// Methods
const getWhatsAppCloudDetails = async () => {
  loading.value = true;
  try {
    const result = await publishStore.getBotDetails();
    if (result.success && result.data) {
      // Populate form with existing data
      if (whatsappCloudData.value) {
        webhookDetails.value.business_id = whatsappCloudData.value.business_id || '';
        webhookDetails.value.catalog_access_token = whatsappCloudData.value.catalog_access_token || '';
        webhookDetails.value.order_webhook = whatsappCloudData.value.order_webhook || '';
        webhookDetails.value.catalog_id = whatsappCloudData.value.catalog_id || null;
      }
      
      // Load catalog data if we have access token
      if (hasAccessToken.value) {
        await loadCatalogData();
      }
    }
  } catch (error) {
    console.error('Failed to get WhatsApp cloud details:', error);
  } finally {
    loading.value = false;
  }
};

const loadCatalogData = async () => {
  if (!hasAccessToken.value) return;
  
  try {
    const result = await publishStore.getCatalog();
    if (result.success) {
      catalogData.value = result.data;
    }
  } catch (error) {
    console.error('Failed to load catalog data:', error);
  }
};

const handleSaveSettings = async (event: Event) => {
  event.preventDefault();
  
  saving.value = true;
  try {
    const result = await publishStore.saveWebhookSettings(webhookDetails.value);
    
    if (result.success) {
      // Refresh bot details
      await getWhatsAppCloudDetails();
      window.$toast?.success('Settings saved successfully!');
    } else {
      window.$toast?.error(result.error || 'Failed to save settings');
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
    window.$toast?.error('Failed to save settings');
  } finally {
    saving.value = false;
  }
};

const openFacebookCommerce = () => {
  window.open('https://business.facebook.com/commerce', '_blank');
};

const openFacebookExplorer = () => {
  window.open('https://developers.facebook.com/tools/explorer?method=GET&path=%7BcatalogID%7D%2Fproducts&version=v15.0', '_blank');
};

// Lifecycle
onMounted(() => {
  getWhatsAppCloudDetails();
});
</script>

<template>
  <div class="tab-panel">
    <h3>Catalog</h3>
    <p class="subtitle">Manage your WhatsApp catalog settings</p>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading catalog data...</p>
    </div>

    <!-- Main content when not loading -->
    <div v-else class="catalog-layout">
      <!-- Table Section -->
      <div class="table-section">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Catalog Name</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          
          <TableBody>
            <!-- Loading skeleton -->
            <TableRow v-if="loading" v-for="i in 3" :key="`skeleton-${i}`" skeleton>
              <TableCell :isLoading="true" skeletonType="text"></TableCell>
              <TableCell :isLoading="true" skeletonType="badge"></TableCell>
              <TableCell :isLoading="true" skeletonType="actions"></TableCell>
            </TableRow>
            
            <!-- No access token - Show info message -->
            <TableRow v-else-if="!hasAccessToken" noData>
              <TableCell noData colspan="3">
                <div class="empty-state">
                  <i class="pi pi-info-circle"></i>
                  <h4>Connect to Meta Business</h4>
                  <p>To manage your product catalog, you need to connect your Meta Business account and generate an access token.</p>
                  <Button
                    variant="primary"
                    size="medium"
                    @click="openFacebookCommerce"
                  >
                    Connect to Meta Business
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            
            <!-- No catalog data message -->
            <TableRow v-else-if="!hasCatalogData" noData>
              <TableCell noData colspan="3">
                <div class="empty-state">
                  <i class="pi pi-shopping-cart"></i>
                  <h4>No Catalogs Found</h4>
                  <p>No catalogs were found with your current settings. Please generate an access token to view your catalogs.</p>
                  <Button
                    variant="primary"
                    size="medium"
                    @click="openFacebookExplorer"
                  >
                    Generate Access Token
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            
            <!-- Catalog rows -->
            <TableRow v-else v-for="catalog in catalogData.data" :key="catalog.id">
              <TableCell>{{ catalog.name }}</TableCell>
              <TableCell>
                <span v-if="whatsappCloudData?.catalog_id === catalog.id" class="status-connected">
                  Connected
                </span>
                <span v-else class="status-disconnected">
                  Disconnected
                </span>
              </TableCell>
              <TableCell>
                <div class="action-buttons">
                  <Button
                    v-if="whatsappCloudData?.catalog_id === catalog.id"
                    variant="error"
                    size="small"
                    @click="publishStore.connectCatalog('/v1/bot/whatsapp/catalog/disconnect')"
                  >
                    Disconnect
                  </Button>
                  <Button
                    v-else
                    variant="primary"
                    size="small"
                    @click="publishStore.connectCatalog(`/v1/bot/whatsapp/catalog/connect/${catalog.id}`)"
                  >
                    Connect
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      
      <!-- Settings Section -->
      <div class="settings-section">
        <h4>Catalog Settings</h4>
        <form @submit="handleSaveSettings">
          <div class="form-group">
            <label for="catalog_access_token">Access Token <span class="required">*</span></label>
            <Input
              id="catalog_access_token"
              v-model="webhookDetails.catalog_access_token"
              placeholder="Enter your catalog access token"
              required
            />
          </div>
          
          <div class="form-actions">
            <Button
              variant="primary"
              type="submit"
              :loading="saving"
            >
              {{ saving ? 'Saving...' : 'Save Settings' }}
            </Button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
.tab-panel {
  padding: var(--space-4);
}

.subtitle {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-4);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.catalog-layout {
  display: flex;
  gap: var(--space-6);
}

.settings-section {
  flex: 3;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
}

.settings-section h4 {
  margin: 0 0 var(--space-4) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text-primary);
}

.required {
  color: var(--color-error);
}

.form-actions {
  margin-top: var(--space-4);
}

.table-section {
  flex: 4;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
}

.table-section h4 {
  margin: 0 0 var(--space-4) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.status-connected {
  color: var(--color-success);
  font-weight: 500;
}

.status-disconnected {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: var(--space-2);
}

.empty-state {
  text-align: center;
  padding: var(--space-6);
  max-width: 400px;
  margin: 0 auto;
}

.empty-state i {
  font-size: 48px;
  color: var(--color-primary);
  margin-bottom: var(--space-4);
}

.empty-state h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.empty-state p {
  margin: 0 0 var(--space-4) 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .tab-panel {
    padding: var(--space-3);
  }
  
  .catalog-layout {
    flex-direction: column;
    gap: var(--space-4);
  }
}
</style> 