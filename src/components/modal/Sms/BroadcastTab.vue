<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {FileUpload, Button, VueSelect} from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import { SmsTemplate } from "@/types";

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

const smsTemplates = computed(() => publishStore.smsTemplates.data);
const smsTemplatesLoading = computed(() => publishStore.smsTemplates.loading);

const subscribedUsers = computed(() => publishStore.smsSegmentUsers.data?.data);
const subscribedUsersLoading = computed(() => publishStore.smsSegmentUsers.loading);

// Loading states
const isSendingBroadcast = ref(false);
const isDownloadingSample = ref(false);


// Message templates
const messageTemplates = ref<Array<{value: string, label: string}>>([]);

// User segments with proper structure
const userSegments = ref([
  { value: '-1', label: 'All users' },
  { value: 'file', label: 'Upload Users File' }
]);

// Broadcast limits
const limits = ref({
  daily: 10000,
  monthly: 50000
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
const templateError = ref('');
const userSegmentError = ref('');
const fileUploadError = ref('');


const setBroadcastRemainingLimits = (remLimit: {daily: number, monthly: number}) => {
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
  const selectedTemplateData = smsTemplates.value?.data.templates.data.find((t: SmsTemplate) => t.id?.toString() === selectedTemplate);
  if (selectedTemplateData && selectedTemplateData.text) {
    broadcastForm.value.message = selectedTemplateData.text;
  }
};

const parseCSVFile = (file: File) => {
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
  if (broadcastForm.value.template === '') {
    templateError.value = 'Template is required';
    return;
  }

  if (broadcastForm.value.userSegment === '') {
    userSegmentError.value = 'User segment is required';
    return;
  }

  if (broadcastForm.value.uploadedFile === null && broadcastForm.value.userSegment !== '-1') {
    fileUploadError.value = 'File upload is required';
    return;
  }

  // Show confirmation dialog using window.$confirm
  window.$confirm({
    text: 'Are you sure you want to send this broadcast? You won\'t be able to undo this action!',
    confirmButtonText: "Yes, Send it!",
    cancelButtonText: "Cancel"
  }, () => {
    // User confirmed - proceed with broadcast
    executeBroadcast();
  });
};

const executeBroadcast = async () => {
  isSendingBroadcast.value = true;
  console.log(subscribedUsers.value, "subscribedUsers")
  try {
    // Prepare payload according to the specified structure
    const payload = {
      template_id: parseInt(broadcastForm.value.template),
      user_segment: broadcastForm.value.userSegment,
      users: broadcastForm.value.userSegment === 'file' ? uploadedUsers.value : broadcastForm.value.userSegment === '-1' ? subscribedUsers.value : []
    };
    
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
onMounted(async() => {
  await publishStore.smsTemplates.load();
  setBroadcastRemainingLimits({
    daily: smsTemplates.value?.data.templates.total,
    monthly: smsTemplates.value?.data.templates.total
  });
  messageTemplates.value = smsTemplates.value?.data.templates.data.map((template: SmsTemplate) => ({
    value: template.id,
    label: template.name
  }));
});

watch(() => broadcastForm.value.userSegment, (newSegment) => {
  if (newSegment === '-1') {
    publishStore.smsSegmentUsers.load();
  }
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

</script>

<template>
  <div class="tab-panel">
    <h3>Broadcast</h3>
    <p class="subtitle">Send broadcast messages to your audience</p>
    
    <!-- Loading State -->
    <div v-if="smsTemplatesLoading" class="loading-state">
      <div class="loader-spinner"></div>
      <span>Loading broadcast data...</span>
    </div>
    
    <div v-else class="main-content">
         <!-- Broadcast Form -->
     <div class="broadcast-form">
                         <!-- Message Template -->
                <div class="form-group">
                  <VueSelect
                    label="Message template"
                    v-model="broadcastForm.template"
                    @change="handleTemplateChange"
                    :options="messageTemplates"
                    placeholder="Select a template"
                    :error="templateError"
                  />
                </div>
         
                         <!-- User Segment -->
                <div class="form-group">
                  <VueSelect
                    label="User segment"
                    v-model="broadcastForm.userSegment"
                    :options="userSegments"
                    placeholder="Select a user segment"
                    :error="userSegmentError"
                  />

                  
                <!-- Show loading and user count for subscribed users -->
                <div v-if="broadcastForm.userSegment === '-1'" class="subscribed-users-info">
                  <div v-if="subscribedUsersLoading" class="loading-indicator">
                    <i class="pi pi-spin pi-spinner"></i>
                    <span>Loading users...</span>
                  </div>
                  <div v-else-if="subscribedUsers.length > 0" class="users-count">
                    <i class="pi pi-check-circle"></i>
                    <span>{{ subscribedUsers.length }} users</span>
                  </div>
                  <div v-else class="no-users">
                    <i class="pi pi-exclamation-triangle"></i>&nbsp;
                    <span>No users found</span>
                  </div>
                </div>
                </div>
       
       <!-- File Upload (Upload user only) -->
       <div v-if="showFileUpload" class="form-group">
         <FileUpload
           label="Upload File (CSV)"
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
            <h5>Daily limit</h5>
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
            <h5>Monthly limit</h5>
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

    <!-- Action Button -->
    <div class="agent-action-buttons">
      <Button 
        variant="primary"
        size="medium"
        :loading="isSendingBroadcast"
        :disabled="!broadcastForm.template || !broadcastForm.userSegment || (!broadcastForm.uploadedFile && broadcastForm.userSegment === '-1') || (!uploadedUsers.length && broadcastForm.userSegment === 'file') || isSendingBroadcast"
        @click="sendBroadcast"
      >
        {{ isSendingBroadcast ? 'Sending...' : 'Send message' }}
      </Button>
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


/* Subscribed Users Info Styles */
.subscribed-users-info {
  margin-top: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.loading-indicator i {
  color: var(--color-primary);
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