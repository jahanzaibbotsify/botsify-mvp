<template>
  <div class="step-container">
    <div class="step-content">
      <div class="step-header">
        <h2 class="step-title">Step 4: Configuration Details</h2>
        <p class="step-description">Enter your WhatsApp configuration details</p>
      </div>
      
      <div class="step-body">
        <div class="info-section">
          <!-- Child Page 1: Temporary Token -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">1</div>
              <h3 class="card-title">Copy Token and Paste Here</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Copy your temporary access token from the Facebook Developer Console and paste it below.</p>
                <div class="form-field">
                  <Input 
                    label="Temporary Access Token"
                    type="text"
                    placeholder="Temporary Access Token"
                    v-model="formData.temporary_token"
                    size="medium"
                  />
                </div>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-four-1_120323_1709720358.png" alt="Copy Token" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Child Page 2: Add Phone Number -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">2</div>
              <h3 class="card-title">Add Phone Number</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Click on "Add a new Phone Number". Type your phone number inside the box that appears and confirm the OTP.</p>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-four-2_120323_1709720386.png" alt="Add Phone Number" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Child Page 3: Phone Number Details -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">3</div>
              <h3 class="card-title">Phone Number Configuration</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Select phone number and paste without spaces and plus sign. Copy phone number ID and paste below.</p>
                <div class="warning-note">
                  <strong>Note:</strong> Do not use the test phone number given by WhatsApp
                </div>
                <div class="form-fields">
                  <div class="form-field">
                    <Input 
                      label="Phone Number"
                      type="tel"
                      placeholder="15550000000"
                      v-model="formData.whatsapp"
                      size="medium"
                    />
                  </div>
                  <div class="form-field">
                    <Input 
                      label="Phone Number ID"
                      type="text"
                      placeholder="2381923498572"
                      v-model="formData.whatsapp_phone_id"
                      size="medium"
                    />
                  </div>
                </div>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-four-3_120323_1709720437.jpg" alt="Phone Number Details" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Child Page 4: Business Account ID -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">4</div>
              <h3 class="card-title">WhatsApp Business Account ID</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Copy WhatsApp business account ID and paste below.</p>
                <div class="form-field">
                  <label class="field-label">WhatsApp Business Account ID</label>
                  <Input 
                    type="text"
                    placeholder="1015550000000"
                    v-model="formData.whatsapp_account_id"
                    size="medium"
                  />
                </div>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-four-account-id_120323_1709720472.png" alt="Business Account ID" class="step-image" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="step-navigation">
      <Button 
        variant="secondary"
        size="medium"
        @click="prevStep"
      >
        Previous
      </Button>
      <Button 
        variant="primary"
        size="medium"
        @click="nextStep"
      >
        Next Step
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input, Button } from '@/components/ui';

interface Props {
  onNext: () => void;
  onPrev: () => void;
  formData: any;
}

const props = defineProps<Props>();

const nextStep = () => {
  // Validate required fields
  if (!props.formData.temporary_token?.trim()) {
    window.$toast?.error('Temporary Token is required');
    return;
  }
  if (!props.formData.whatsapp?.trim()) {
    window.$toast?.error('Phone number is required');
    return;
  }
  if (!props.formData.whatsapp_phone_id?.trim()) {
    window.$toast?.error('Phone number ID is required');
    return;
  }
  if (!props.formData.whatsapp_account_id?.trim()) {
    window.$toast?.error('WhatsApp business account ID is required');
    return;
  }
  
  props.onNext();
};

const prevStep = () => {
  props.onPrev();
};
</script>

<style scoped>
.step-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.step-content {
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: 12px;
  padding: 32px;
  border: 1px solid var(--color-border, #e5e7eb);
  margin-bottom: 24px;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  margin: 0 0 16px 0;
}

.step-description {
  font-size: 16px;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.6;
  margin: 0;
}

.step-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--color-border, #e5e7eb);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.step-number {
  width: 36px;
  height: 36px;
  background: var(--color-primary, #3b82f6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  margin: 0;
}

.card-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.content-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-text {
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.6;
  margin: 0;
}

.warning-note {
  background: var(--color-warning, #fef3c7);
  color: var(--color-warning-text, #92400e);
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid var(--color-warning-border, #f59e0b);
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.step-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e5e7eb);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

@media (max-width: 768px) {
  .card-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .content-image {
    order: -1;
  }
}

@media (max-width: 640px) {
  .step-container {
    padding: 16px;
  }
  
  .step-content {
    padding: 24px;
  }
  
  .step-title {
    font-size: 20px;
  }
  
  .step-description {
    font-size: 14px;
  }
  
  .info-card {
    padding: 16px;
  }
  
  .card-header {
    margin-bottom: 16px;
  }
}
</style>
