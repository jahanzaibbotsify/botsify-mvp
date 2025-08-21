<template>
  <div class="step-container">
    <div class="step-content">
      <div class="step-header">
        <h2 class="step-title">Step 2: Create Facebook App</h2>
        <p class="step-description">Create a new Facebook app for your WhatsApp integration</p>
      </div>
      
      <div class="step-body">
        <div class="info-section">
          <!-- Step 1: Create New App -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">1</div>
              <h3 class="card-title">Create New App</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Click on "Create App" button in the Facebook Developer Console</p>
              </div>
              <div class="content-image">
                <img src="https://bucket.osam.one/templates/images/image__11__131642_1755518347.png" alt="Create App" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Step 2: Choose App Type -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">2</div>
              <h3 class="card-title">Choose App Type</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Select "Business" as your app type and choose "WhatsApp" as the product</p>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-two-2_120323_1709720134.png" alt="Choose App Type" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Step 3: App Details -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">3</div>
              <h3 class="card-title">App Details</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Fill in your app name and contact email address</p>
                <div class="form-preview">
                  <div class="form-field">
                    <Input 
                      label="App Name"
                      type="text" 
                      placeholder="Your App Name" 
                      disabled 
                      size="medium" 
                    />
                  </div>
                  <div class="form-field">
                    <Input 
                      label="Contact Email"
                      type="email" 
                      placeholder="your@email.com" 
                      disabled 
                      size="medium" 
                    />
                  </div>
                </div>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-two-3_120323_1709720160.png" alt="Choose App Type" class="step-image" />
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
}

const props = defineProps<Props>();

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

.form-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--color-bg-tertiary, #f3f4f6);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e5e7eb);
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
