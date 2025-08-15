<template>
  <div class="step-container">
    <div class="step-content">
      <div class="step-header">
        <h2 class="step-title">Step 5: Additional Configuration</h2>
        <p class="step-description">Configure your app ID and secret</p>
      </div>
      
      <div class="step-body">
        <div class="info-section">
          <!-- Child Page 1: Settings Tab -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">1</div>
              <h3 class="card-title">Click Settings and Basic Tab</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Navigate to the Settings and Basic tab in your Facebook app dashboard to access your app credentials.</p>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-five-1_120323_1709720512.png" alt="Settings Tab" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Child Page 2: App Credentials -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">2</div>
              <h3 class="card-title">Copy App ID and Secret</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Copy your app ID and app secret from the Facebook app settings and paste them below.</p>
                <div class="form-fields">
                  <div class="form-field">
                    <Input 
                      label="App ID"
                      type="text"
                      placeholder="App ID"
                      v-model="formData.clientId"
                      size="medium"
                    />
                  </div>
                  <div class="form-field">
                    <Input 
                      label="App Secret"
                      type="password"
                      placeholder="App Secret"
                      v-model="formData.clientSecret"
                      size="medium"
                    />
                  </div>
                </div>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-five-2_120323_1709720546.png" alt="App Credentials" class="step-image" />
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
  if (!props.formData.clientId?.trim()) {
    window.$toast?.error('App ID is required');
    return;
  }
  if (!props.formData.clientSecret?.trim()) {
    window.$toast?.error('App Secret is required');
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
