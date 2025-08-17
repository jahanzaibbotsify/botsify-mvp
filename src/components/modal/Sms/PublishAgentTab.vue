<script setup lang="ts">
import {Input, Button} from "@/components/ui";
import { ref, computed, watch, onMounted } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import { publishApi } from "@/services/publishApi";
import { ThirdPartyConfig } from "@/types";
// Props
interface Props {
  isCheckingConfiguration?: boolean;
}

withDefaults(defineProps<Props>(), {
  isCheckingConfiguration: false
});

// Emits
const emit = defineEmits<{
  'check-configuration': [];
}>();

const publishStore = usePublishStore();
// Twilio fields
const twilioConfig = computed(() => publishStore.thirdPartyConfig.data?.data);
const smsFields = ref({
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioSmsNumber: '',
  twilioSenderId: '',
});

// Validation state
const errors = ref({
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioSmsNumber: '',
});


// Loading state
const isLoading = ref(false);
// Computed property to check if all required fields are filled
const isFormValid = computed(() => {
  return smsFields.value.twilioAccountSid.trim() !== '' &&
         smsFields.value.twilioAuthToken.trim() !== '' &&
         smsFields.value.twilioSmsNumber.trim() !== '';
});

watch(twilioConfig, (newVal: ThirdPartyConfig) => {
  smsFields.value = {
    twilioAccountSid: newVal?.twilioConf?.sid || '',
    twilioAuthToken: newVal?.twilioConf?.auth_token || '',
    twilioSmsNumber: newVal?.twilioConf?.number || '',
    twilioSenderId: newVal?.twilioConf?.sender_id || '',
  }
})

// Validation methods
const validateForm = () => {
  clearErrors();
  let isValid = true;

  // Validate Twilio Account SID
  if (!smsFields.value.twilioAccountSid.trim()) {
    errors.value.twilioAccountSid = 'Twilio account SID is required';
    isValid = false;
  } else if (smsFields.value.twilioAccountSid.trim().length < 10) {
    errors.value.twilioAccountSid = 'Account SID must be at least 10 characters';
    isValid = false;
  }

  // Validate Twilio Auth Token
  if (!smsFields.value.twilioAuthToken.trim()) {
    errors.value.twilioAuthToken = 'Twilio auth token is required';
    isValid = false;
  } else if (smsFields.value.twilioAuthToken.trim().length < 10) {
    errors.value.twilioAuthToken = 'Auth token must be at least 10 characters';
    isValid = false;
  }

  // Validate Twilio SMS Number
  if (!smsFields.value.twilioSmsNumber.trim()) {
    errors.value.twilioSmsNumber = 'Twilio SMS number is required';
    isValid = false;
  }

  return isValid;
};

const clearErrors = () => {
  errors.value = {
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioSmsNumber: '',
  };
};

// const testBot = () => {
//   isLoading.value = true;
//   try {
//     // Add actual test bot logic here
//     if (window.$toast) {
//       window.$toast.info('Bot test functionality coming soon');
//     }
//   } catch (error) {
//     console.error('Failed to test bot:', error);
//     if (window.$toast) {
//       window.$toast.error('Failed to test bot');
//     }
//   } finally {
//     isLoading.value = false;
//   }
// };

const saveSettings = async() => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  try {
    const result = await publishApi.saveTwilioSettings(smsFields.value);
    if (result.success) {
      window.$toast.success('Twilio settings saved successfully');
      // Recheck configuration after saving
      twilioConfig.value.twilioConf.sid = smsFields.value.twilioAccountSid
      twilioConfig.value.twilioConf.auth_token = smsFields.value.twilioAuthToken
      twilioConfig.value.twilioConf.number = smsFields.value.twilioSmsNumber
      twilioConfig.value.twilioConf.sender_id = smsFields.value.twilioSenderId;

      publishStore.publishStatus.invalidate();
      emit('check-configuration');
    } else {
      window.$toast.error(result.message || 'Failed to save Twilio settings');
    }
  } catch (error) {
    console.error('Failed to save Twilio settings:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  smsFields.value = {
    twilioAccountSid: twilioConfig.value?.twilioConf?.sid || '',
    twilioAuthToken: twilioConfig.value?.twilioConf?.auth_token || '',
    twilioSmsNumber: twilioConfig.value?.twilioConf?.number || '',
    twilioSenderId: twilioConfig.value?.twilioConf?.sender_id || '',
  }
})

</script>

<template>
  <div class="tab-panel">
    <h3>SMS agent configuration</h3>
    <p class="subtitle">SMS provider and configure settings</p>

    <!-- Loading State -->
    <div v-if="isCheckingConfiguration" class="loading-state">
      <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Loading sms configuration...</p>
        </div>
    </div>

    <!-- Form Content -->
    <div v-else class="form-section">
      <div class="form-group">
        <Input 
          label="Twilio account SID"
          id="twilio-account-sid"
          v-model="smsFields.twilioAccountSid"
          type="text"
          placeholder="Enter your Twilio account SID"
          size="medium"
          :error="errors.twilioAccountSid"
        />
        <small class="help-text">
          Find this in your <a href="https://www.twilio.com/en-us/sms/pricing/us" target="_blank">Twilio Console dashboard</a>
        </small>
      </div>
      
      <div class="form-group">
        <Input 
          label="Twilio auth token"
          id="twilio-auth-token"
          v-model="smsFields.twilioAuthToken"
          type="password"
          placeholder="Enter your Twilio auth token"
          size="medium"
          :error="errors.twilioAuthToken"
        />
        <small class="help-text">
          Keep this secure - it's your authentication token
        </small>
      </div>
      
      <div class="form-group">
        <Input 
          label="Twilio SMS number"
          id="twilio-sms-number"
          v-model="smsFields.twilioSmsNumber"
          type="tel"
          placeholder="Enter your Twilio phone number"
          size="medium"
          :error="errors.twilioSmsNumber"
        />
        <small class="help-text">
          The phone number you purchased from <a href="https://support.twilio.com/hc/en-us/articles/223180048-How-to-Add-and-Remove-a-Verified-Phone-Number-or-Caller-ID-with-Twilio" target="_blank">Twilio</a>
        </small>
      </div>

      
      <div class="form-group">
        <Input 
          label="Twilio Sender ID"
          id="twilio-sender-id"
          v-model="smsFields.twilioSenderId"
          type="tel"
          placeholder="Enter your Twilio sender iD"
          size="medium"
        />
      </div>

      <!-- Action Buttons -->
      <div class="agent-action-buttons">
        <!-- <Button 
          variant="secondary"
          size="medium"
          :loading="isLoading"
          @click="testBot"
        >
          {{ isLoading ? 'Testing...' : 'Test Agent' }}
        </Button>
         -->
        <Button 
          variant="primary"
          size="medium"
          :loading="isLoading"
          :disabled="!isFormValid"
          @click="saveSettings"
        >
          {{ isLoading ? 'Saving...' : 'Save Settings' }}
        </Button>
      </div>
    </div>

  </div>
</template>