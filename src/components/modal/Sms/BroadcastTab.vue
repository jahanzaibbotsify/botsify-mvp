<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import FileUpload from "@/components/ui/FileUpload.vue";
import { usePublishStore } from "@/stores/publishStore";
import VueSelect from "@/components/ui/VueSelect.vue";

// Props
interface Props {
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Reactive data
const broadcastForm = ref({
  message: '',
  template: '',
  userSegment: '',
  mediaType: 'text',
  uploadedFile: null as any | null
});

const publishStore = usePublishStore();

// Loading states
const isSendingBroadcast = ref(false);
const isLoadingData = ref(false);
const isDownloadingSample = ref(false);

// Message templates
const messageTemplates = ref<Array<{value: string, label: string}>>([]);
const fullTemplates = ref<Array<any>>([]);

// User segments with proper structure
const userSegments = ref([
  { value: '-1', label: 'Only Subscribed Users (All users who have talked to Bot)' },
  { value: 'file', label: 'Upload Users File' }
]);

// Broadcast limits
const limits = ref({
  daily: 0,
  monthly: 0
});

const remainingLimits = ref({
  daily: 0,
  monthly: 0
});

// Uploaded users data
const uploadedUsers = ref<Array<{phone_number: string}>>([]);

// Error state for CSV parsing
const csvError = ref<string | null>(null);

// Computed properties
const showFileUpload = computed(() => broadcastForm.value.userSegment === 'file');

// Validation computed properties
const templateError = computed(() => !broadcastForm.value.template ? 'Template is required' : undefined);
const userSegmentError = computed(() => !broadcastForm.value.userSegment ? 'User segment is required' : undefined);
const fileUploadError = computed(() => {
  if (broadcastForm.value.userSegment === 'file' && !broadcastForm.value.uploadedFile) {
    return 'File upload is required for upload user broadcast';
  }
  if (broadcastForm.value.userSegment === 'file' && uploadedUsers.value.length === 0) {
    return 'No valid users found in uploaded file';
  }
  return undefined;
});

const hasValidationErrors = computed(() => 
  !!templateError.value || !!userSegmentError.value || !!fileUploadError.value
);

// Methods
const loadData = async () => {
  isLoadingData.value = true;
  try {
    const result = await publishStore.loadDataForPlugins("test_users,sms_templates,user_task");
    if (result.success && result.data) {
      // Update segments with additional data
      if (result.data.segments) {
        userSegments.value = userSegments.value.concat(result.data.segments);
      }
      
      // Set broadcast limits
      if (result.data.limits) {
        setBroadcastRemainingLimits(result.data.limits);
      }
      
      // Update message templates
      if (result.data.sms_templates) {
        fullTemplates.value = result.data.sms_templates;
        messageTemplates.value = result.data.sms_templates.map((template: any) => ({
          value: template.id,
          label: template.name
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load broadcast data:', error);
  } finally {
    isLoadingData.value = false;
  }
};

const setBroadcastRemainingLimits = (remLimit: any) => {
  const calculated = {
    daily: limits.value.daily - remLimit.daily,
    monthly: limits.value.monthly - remLimit.monthly
  };

  if (calculated.monthly === 0) {
    remainingLimits.value = { daily: 0, monthly: 0 };
  } else if (calculated.daily === 0) {
    remainingLimits.value = { daily: 0, monthly: calculated.monthly };
  } else if (calculated.daily > calculated.monthly) {
    remainingLimits.value = { daily: calculated.monthly, monthly: calculated.monthly };
  } else {
    remainingLimits.value = { daily: calculated.daily, monthly: calculated.monthly };
  }
};

const handleTemplateChange = (selectedTemplate: any) => {
  // Load template content based on selection
  const selectedTemplateData = fullTemplates.value.find(t => t.id?.toString() === selectedTemplate);
  if (selectedTemplateData && selectedTemplateData.text) {
    broadcastForm.value.message = selectedTemplateData.text;
  }
};

const parseCSVFile = (file: File) => {
  console.log('Parsing CSV file:', file.name, 'Type:', file.type, 'Size:', file.size);
  
  if (!file || !(file instanceof File)) {
    console.error('Invalid file object passed to parseCSVFile:', file);
    csvError.value = 'Invalid file object';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const users = csvToArray(text);
      if (users.length === 0) {
        csvError.value = 'No valid users found in CSV file';
      } else {
        uploadedUsers.value = users;
        csvError.value = null;
        console.log('Parsed users:', users);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      csvError.value = 'Failed to parse CSV file';
    }
  };
  
  reader.onerror = (error) => {
    console.error('Error reading file:', error);
    csvError.value = 'Failed to read file';
  };
  
  reader.readAsText(file);
};

const csvToArray = (str: string, delimiter = ",") => {
  // Get headers
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");
  const nameColumn = ['name', 'name\r', 'phone', 'phone\r'];
  
  if (headers.length !== 2 || 
      !nameColumn.includes(headers[0].toLowerCase()) || 
      !nameColumn.includes(headers[1].toLowerCase()) || 
      rows.length === 0) {
    console.error('Invalid CSV file format');
    return [];
  }

  // Map the rows
  const arr = rows.map((row) => {
    const values = row.split(delimiter).map(val => val.trim().replace(/^"|"$/g, ''));
    if (!values[1]) return;

    let phoneNumber = values[1];

    // Fix scientific notation (e.g., "9.23313E+11")
    if (phoneNumber.toLowerCase().includes('e+')) {
      phoneNumber = Number(phoneNumber).toFixed(0);
    }

    return {
      phone_number: phoneNumber
    };
  });

  return arr.filter((value) => value != undefined);
};

const sendBroadcast = async () => {
  // Check for validation errors
  if (hasValidationErrors.value) {
    console.error('Please fix validation errors before sending broadcast');
    return;
  }

  // Show confirmation dialog using window.$confirm
  if (window.$confirm) {
    window.$confirm({
      text: 'Are you sure you want to send this broadcast? You won\'t be able to undo this action!'
    }, () => {
      // User confirmed - proceed with broadcast
      executeBroadcast();
    });
  } else {
    // Fallback to native confirm
    if (confirm('Are you sure you want to send this broadcast? You won\'t be able to undo this action!')) {
      executeBroadcast();
    }
  }
};

const executeBroadcast = async () => {
  isSendingBroadcast.value = true;
  
  try {
    // Prepare payload according to the specified structure
    const payload = {
      template_id: parseInt(broadcastForm.value.template),
      user_segment: broadcastForm.value.userSegment,
      users: broadcastForm.value.userSegment === 'file' ? uploadedUsers.value : []
    };
    
    console.log('Sending broadcast with payload:', payload);
    const result = await publishStore.sendSmsBroadcast(payload);
    if (result.success) {
      window.$toast.success('Broadcast sent successfully');
    } else {
      window.$toast.error(result?.data?.message || 'Failed to send broadcast');
    }
    isSendingBroadcast.value = false;
  } catch (error) {
    console.error('Failed to send broadcast:', error);
    window.$toast.error('Failed to send broadcast');
  } finally {
    isSendingBroadcast.value = false;
  }
};

const downloadSampleFile = async () => {
  isDownloadingSample.value = true;
  try {
    const response = await fetch('https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/users_120323_1709725833.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch sample file');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sms_users_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download sample file:', error);
    // Fallback: open in new tab
    window.open('https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/users_120323_1709725833.csv', '_blank');
  } finally {
    isDownloadingSample.value = false;
  }
};

// Load data on mount
onMounted(() => {
  loadData();
});

// Watch for changes in the uploadedFile to trigger CSV parsing
watch(() => broadcastForm.value.uploadedFile, (newFile) => {
  if (newFile && newFile instanceof File) {
    csvError.value = null; // Clear any previous errors
    parseCSVFile(newFile);
  } else {
    uploadedUsers.value = [];
    csvError.value = null;
  }
});

// Expose methods for parent component
defineExpose({
  sendBroadcast,
  isSendingBroadcast
});
</script>

<template>
  <div class="tab-panel">
    <h3>Broadcast</h3>
    <p class="subtitle">Send broadcast messages to your audience</p>
    
    <!-- Loading State -->
    <div v-if="isLoadingData" class="loading-state">
      <div class="loader-spinner"></div>
      <span>Loading broadcast data...</span>
    </div>
    
    <div v-else class="main-content">
         <!-- Broadcast Form -->
     <div class="broadcast-form">
                         <!-- Message Template -->
                <div class="form-group">
                  <label for="broadcast-template" class="required-label">Message template</label>
                  <VueSelect
                    v-model="broadcastForm.template"
                    @change="handleTemplateChange"
                    :options="messageTemplates"
                    placeholder="Select a template"
                    :error="templateError"
                  />
                </div>
         
                         <!-- User Segment -->
                <div class="form-group">
                  <label for="broadcast-segment" class="required-label">User segment</label>
                  <VueSelect
                    v-model="broadcastForm.userSegment"
                    :options="userSegments"
                    placeholder="Select a user segment"
                    :error="userSegmentError"
                  />
                </div>
       
       <!-- File Upload (Upload user only) -->
       <div v-if="showFileUpload" class="form-group">
         <label>Upload File (CSV)</label>
         <FileUpload
           v-model="broadcastForm.uploadedFile"
           accept=".csv"
           :emit-raw-file="true"
           :max-size-mb="10"
           text="CSV files only"
           :error="fileUploadError"
         />
         
         <small class="help-text">
           Note: Supported formats: .csv<br>
           Sample Files: <a href="#" @click.prevent="downloadSampleFile" :disabled="isDownloadingSample">CSV</a>
           <span v-if="isDownloadingSample" class="ml-2">Downloading...</span>
           <div v-if="uploadedUsers.length > 0" class="users-count">
             <i class="pi pi-check-circle"></i>
             <span>{{ uploadedUsers.length }} users loaded from CSV</span>
           </div>
           <div v-if="csvError" class="csv-error">
             <i class="pi pi-exclamation-triangle"></i>
             <span>{{ csvError }}</span>
           </div>
         </small>
         

       </div>
     </div>
    
         <!-- Broadcast Limits -->
     <div class="limits-section">
        <div class="limits-row">
          <div class="limit-card">
          <div class="limit-header">
            <h5>Daily Limit</h5>
            <i class="pi pi-info-circle"></i>
          </div>
          <div class="limit-content">
            <div class="limit-total">
              <span class="limit-label">Total:</span>
              <span class="limit-value">{{ limits.daily }}</span>
            </div>
            <div class="limit-remaining">
              <span class="limit-label">Remaining:</span>
              <span class="limit-value" :class="{'text-danger': remainingLimits.daily < 100}">{{ remainingLimits.daily }}</span>
            </div>
          </div>
        </div>
        
        <div class="limit-card">
          <div class="limit-header">
            <h5>Monthly Limit</h5>
            <i class="pi pi-info-circle"></i>
          </div>
          <div class="limit-content">
            <div class="limit-total">
              <span class="limit-label">Total:</span>
              <span class="limit-value">{{ limits.monthly }}</span>
            </div>
            <div class="limit-remaining">
              <span class="limit-label">Remaining:</span>
              <span class="limit-value" :class="{'text-danger': remainingLimits.monthly < 500}">{{ remainingLimits.monthly }}</span>
            </div>
          </div>
        </div>
        </div>
     </div>
    </div>
  </div>
</template>

<style scoped>
.subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.broadcast-form {
  margin-top: 20px;
}

.main-content{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.help-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 4px;
}

.help-text a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: color var(--transition-normal);
}

.help-text a:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.help-text a:disabled {
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  text-decoration: none;
}

.users-count {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  color: var(--color-success);
  font-size: 0.875rem;
}

.users-count i {
  color: var(--color-success);
}

.ml-2 {
  margin-left: var(--space-2);
}

.required-label::after {
  content: " *";
  color: var(--color-error);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-3);
  color: var(--color-text-secondary);
}

.loader-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.limits-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.limits-row{
  display: flex;
  gap: 10px;
}

.limit-card {
  flex: 1;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-6);
}

.limit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.limit-header h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.limit-header i {
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.limit-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.limit-total,
.limit-remaining {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.limit-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.limit-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.text-danger {
  color: var(--color-error);
}

.csv-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  color: var(--color-error);
  font-size: 0.875rem;
}

.csv-error i {
  color: var(--color-error);
}

/* Validation error styles */
.validation-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  color: var(--color-error);
  font-size: 0.875rem;
  font-weight: 500;
}

.validation-error i {
  color: var(--color-error);
  font-size: 1rem;
}



@media (max-width: 640px) {
  .main-content{
    display: block;
  }
}
</style> 