<template>
  <div class="step-container">
    <div class="step-content">
      <div class="step-header">
        <h2 class="step-title">Step 6: Webhook Configuration</h2>
        <p class="step-description">Configure your webhook for message delivery</p>
      </div>
      
      <div class="step-body">
        <div class="info-section">
          <!-- Child Page 1: WhatsApp Configuration -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">1</div>
              <h3 class="card-title">Click WhatsApp and Configuration Tab</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Navigate to the WhatsApp product and click on the Configuration tab to set up your webhook.</p>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-six-1_120323_1709720673.png" alt="WhatsApp Configuration" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Child Page 2: Edit Webhook -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">2</div>
              <h3 class="card-title">Open Edit Webhook Configuration</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Click on "Edit" in the webhook configuration section to set up your callback URL and verify token.</p>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-six-2_120323_1709720697.png" alt="Edit Webhook" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Child Page 3: Configuration Details -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">3</div>
              <h3 class="card-title">Configuration Details</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Copy the callback URL and verify token from below and paste them in the configuration popup, then hit save.</p>
                <div class="config-details">
                  <div class="config-item">
                    <label class="config-label">Callback URL:</label>
                    <div class="config-value">
                      <span class="url-text">{{ webhookUrl }}</span>
                      <Button 
                        variant="secondary"
                        size="small"
                        @click="copyToClipboard(webhookUrl)"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div class="config-item">
                    <label class="config-label">Verify Token:</label>
                    <div class="config-value">
                      <span class="token-text">{{ verifyToken }}</span>
                      <Button 
                        variant="secondary"
                        size="small"
                        @click="copyToClipboard(verifyToken)"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-six-3_120323_1709720719.png" alt="Configuration Details" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Child Page 4: Manage Webhook Fields -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">4</div>
              <h3 class="card-title">Click Manage in Webhook Fields Area</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Click on "Manage" in the webhook fields area to configure which events you want to receive.</p>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-six-4_120323_1709720742.png" alt="Manage Webhook Fields" class="step-image" />
              </div>
            </div>
          </div>
          
          <!-- Child Page 5: Subscribe Messages -->
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">5</div>
              <h3 class="card-title">Subscribe Messages and Click Done</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Subscribe to the "messages" event and click "Done" to complete the webhook configuration.</p>
                <div class="completion-note">
                  <strong>Congratulations!</strong> Your WhatsApp integration is now complete and ready to receive messages.
                </div>
              </div>
              <div class="content-image">
                <img src="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/step-six-5_120323_1709720791.png" alt="Subscribe Messages" class="step-image" />
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
        variant="success"
        size="medium"
        @click="completeIntegration"
      >
        Complete Integration
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui';

interface Props {
  onComplete: () => void;
  onPrev: () => void;
  webhookUrl: string;
  verifyToken: string;
}

const props = defineProps<Props>();

const verifyToken = computed(() => {
  return props.verifyToken;
});

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    window.$toast?.success('Copied to clipboard');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    window.$toast?.error('Failed to copy to clipboard');
  }
};

const completeIntegration = () => {
  props.onComplete();
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

.config-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
}

.config-value {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px;
}

.url-text,
.token-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  flex: 1;
  word-break: break-all;
}

.completion-note {
  background: var(--color-success, #d1fae5);
  color: var(--color-success-text, #065f46);
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid var(--color-success-border, #10b981);
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
  
  .config-value {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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
