<template>
  <div class="step-container">
    <div class="step-content">
      <div class="step-header">
        <h2 class="step-title">Step 1: Facebook Developer Account Setup</h2>
        <p class="step-description">Set up your Facebook developer account for WhatsApp integration</p>
      </div>
      
      <div class="step-body">
        <!-- Child Page 1: Introduction -->
        <div v-if="currentChildPage === 1" class="child-page">
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">1</div>
              <h3 class="card-title">Getting Started</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <div class="intro-text">
                  <p>In order to integrate your chatbot with WhatsApp Cloud API, we need to create a Facebook developer application first.</p>
                  <p>I will walk you through the steps of creating the Facebook developer application step by step and ask for information during this process.</p>
                  <p>Please keep your phone along with the number you wish to integrate handy as you will receive one-time-password during this process.</p>
                  <p>This will take about 5 minutes and you will get it integrated. Once integrated you can't use the same phone number for regular WhatsApp.</p>
                </div>
                <div class="external-link">
                  <Button 
                    variant="primary"
                    size="medium"
                    @click="openFacebookDeveloper"
                  >
                    <span>Open Facebook Developer Website</span>
                    <i class="fas fa-external-link-alt"></i>
                  </Button>
                </div>
              </div>
              <div class="content-image">
                <img src="/theme/images/step-one-2.png" alt="Get Started" class="step-image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Child Page 2: Create Developer Account -->
        <div v-if="currentChildPage === 2" class="child-page">
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">2</div>
              <h3 class="card-title">Create Developer Account</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">If you don't have a Facebook developer account, you might need to create one first.</p>
                <div class="setup-steps">
                  <div class="setup-step">
                    <div class="step-number-small">1</div>
                    <div class="step-content">
                      <h4 class="step-title">Sign Up</h4>
                      <p class="step-text">Go to Facebook Developers and click "Get Started"</p>
                    </div>
                  </div>
                  <div class="setup-step">
                    <div class="step-number-small">2</div>
                    <div class="step-content">
                      <h4 class="step-title">Verify Identity</h4>
                      <p class="step-text">Complete the identity verification process</p>
                    </div>
                  </div>
                  <div class="setup-step">
                    <div class="step-number-small">3</div>
                    <div class="step-content">
                      <h4 class="step-title">Accept Terms</h4>
                      <p class="step-text">Accept the Facebook Developer Terms of Service</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="content-image">
                <img src="/theme/images/step-one-2.png" alt="Create Developer Account" class="step-image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Child Page 3: Verify Phone Number -->
        <div v-if="currentChildPage === 3" class="child-page">
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">3</div>
              <h3 class="card-title">Verify Your Phone Number</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">You'll need to verify your phone number to complete the developer account setup.</p>
                <div class="verification-steps">
                  <div class="verification-step">
                    <div class="step-number-small">1</div>
                    <div class="step-content">
                      <h4 class="step-title">Enter Phone Number</h4>
                      <p class="step-text">Enter the phone number you want to use for WhatsApp integration</p>
                    </div>
                  </div>
                  <div class="verification-step">
                    <div class="step-number-small">2</div>
                    <div class="step-content">
                      <h4 class="step-title">Receive OTP</h4>
                      <p class="step-text">Check your phone for the one-time password (OTP)</p>
                    </div>
                  </div>
                  <div class="verification-step">
                    <div class="step-number-small">3</div>
                    <div class="step-content">
                      <h4 class="step-title">Enter Code</h4>
                      <p class="step-text">Enter the verification code to complete the process</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="content-image">
                <img src="/theme/images/step-one-3.png" alt="Verify Phone Number" class="step-image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Child Page 4: Select Role -->
        <div v-if="currentChildPage === 4" class="child-page">
          <div class="info-card">
            <div class="card-header">
              <div class="step-number">4</div>
              <h3 class="card-title">Select Your Role</h3>
            </div>
            <div class="card-content">
              <div class="content-text">
                <p class="card-text">Choose the appropriate role for your WhatsApp integration.</p>
                <div class="role-options">
                  <div class="role-option">
                    <div class="role-icon">👨‍💼</div>
                    <div class="role-content">
                      <h4 class="role-title">Business</h4>
                      <p class="role-text">For business applications and customer communication</p>
                    </div>
                  </div>
                  <div class="role-option">
                    <div class="role-icon">👨‍💻</div>
                    <div class="role-content">
                      <h4 class="role-title">Developer</h4>
                      <p class="role-text">For building and testing WhatsApp applications</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="content-image">
                <img src="/theme/images/step-one-4.png" alt="Select Role" class="step-image" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="step-navigation">
      <Button 
        v-if="currentChildPage > 1"
        variant="secondary"
        size="medium"
        @click="prevChildPage"
      >
        Previous
      </Button>
      <div v-else class="nav-spacer"></div>
      
      <div class="child-page-indicator">
        Page {{ currentChildPage }} of {{ totalChildPages }}
      </div>
      
      <Button 
        v-if="currentChildPage < totalChildPages"
        variant="primary"
        size="medium"
        @click="nextChildPage"
      >
        Next
      </Button>
      <Button 
        v-else
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
import { ref } from 'vue';
import { Button } from '@/components/ui';

interface Props {
  onNext: () => void;
}

const props = defineProps<Props>();

const currentChildPage = ref(1);
const totalChildPages = 4;

const openFacebookDeveloper = () => {
  window.open('https://developers.facebook.com/', '_blank');
};

const nextChildPage = () => {
  if (currentChildPage.value < totalChildPages) {
    currentChildPage.value++;
  }
};

const prevChildPage = () => {
  if (currentChildPage.value > 1) {
    currentChildPage.value--;
  }
};

const nextStep = () => {
  props.onNext();
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

.child-page {
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

.intro-text p {
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.external-link {
  margin-top: 16px;
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

.setup-steps,
.verification-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setup-step,
.verification-step {
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

.role-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-radius: 8px;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.role-option:hover {
  border-color: var(--color-primary, #3b82f6);
}

.role-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.role-content {
  flex: 1;
}

.role-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  margin: 0 0 4px 0;
}

.role-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.4;
  margin: 0;
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.nav-spacer {
  width: 100px;
}

.child-page-indicator {
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  font-weight: 500;
}

@media (max-width: 768px) {
  .card-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .content-image {
    order: -1;
  }
  
  .step-navigation {
    flex-direction: column;
    gap: 16px;
  }
  
  .nav-spacer {
    display: none;
  }
  
  .child-page-indicator {
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
  
  .setup-step,
  .verification-step {
    padding: 10px;
  }
  
  .role-option {
    padding: 12px;
  }
}
</style>
