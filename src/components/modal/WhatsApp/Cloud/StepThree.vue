<template>
  <div class="step-container">
    <div class="step-content">
      <div class="step-header">
        <h2 class="step-title">Step 3: WhatsApp Business API Setup</h2>
        <p class="step-description">Configure WhatsApp Business API in your Facebook app</p>
      </div>
      
      <div class="step-body">
        <div class="info-section">
          <!-- Step 1: Add WhatsApp Product -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">1</div>
              <h3 class="card-title">Add WhatsApp Product</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">In your app dashboard, click on "Add Product" and select "WhatsApp"</p>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-three-2_120323_1709720265.png" alt="Configure WhatsApp" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Step 2: Configure WhatsApp -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">2</div>
              <h3 class="card-title">Configure WhatsApp</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Set up your WhatsApp Business Account and phone number</p>
                <div class="config-steps">
                  <div class="config-step">
                    <div class="step-number-small">1</div>
                    <div class="step-content">
                      <h4 class="step-title">Business Account</h4>
                      <p class="step-text">Create or connect your WhatsApp Business Account</p>
                    </div>
                  </div>
                  <div class="config-step">
                    <div class="step-number-small">2</div>
                    <div class="step-content">
                      <h4 class="step-title">Phone Number</h4>
                      <p class="step-text">Add and verify your WhatsApp phone number</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-three-3_120323_1709720295.png" alt="Get Access Token" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Step 3: Get Access Token -->
          <!-- <div class="info-card">
            <div class="card-header">
              <div class="step-number">3</div>
              <h3 class="card-title">Get Access Token</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Generate a temporary access token for API access</p>
                <div class="token-preview">
                  <div class="token-field">
                    <label class="field-label">Temporary Access Token</label>
                    <div class="token-display">
                      <span class="token-text">EAABwzLixnjYBO...</span>
                      <Button 
                        variant="secondary"
                        size="small"
                        @click="copyToken"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-three-3_120323_1709720295.png" alt="Get Access Token" class="step-image" />
              </div>
            </div>
          </div> -->
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
import { Button } from '@/components/ui';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

const props = defineProps<Props>();

// const copyToken = () => {
//   // This would copy the actual token
//   window.$toast?.success('Token copied to clipboard');
// };

const nextStep = () => {
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

.config-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-radius: 6px;
}

.step-number-small {
  width: 24px;
  height: 24px;
  background: var(--color-primary, #3b82f6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
}

.step-content .step-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  margin: 0 0 4px 0;
}

.step-content .step-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.4;
  margin: 0;
}

.token-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.token-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
}

.token-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px;
}

.token-text {
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  flex: 1;
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
  
  .config-step {
    padding: 10px;
  }
}
</style>
