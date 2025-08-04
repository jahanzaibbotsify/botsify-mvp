<script setup lang="ts">
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import { ref } from "vue";
import { useBotStore } from "@/stores/botStore";
import { usePublishStore } from "@/stores/publishStore";
import { getWebUrl } from "@/utils";

// Define tabs first
const tabs = [
  { id: 'install-code', label: 'Install Code Yourself' },
  { id: 'inline-widget', label: 'Inline Widget' },
  { id: 'email-developer', label: 'Email To Developer' },
  { id: 'landing-bot', label: 'Landing Bot' }
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const publishStore = usePublishStore();
const currentActiveTab = ref('install-code');

const emit = defineEmits<{
  back: [];
}>();

// Reactive data
const apikey = useBotStore().apiKey;
const developerEmail = ref('');
const isLoading = ref(false);
const selectedColor = ref('#3b82f6');
const showColorPicker = ref(false);
const generatedInlineCode = ref('');
const backgroundStyle = ref<'primary' | 'gradient' | 'secondary'>('gradient');
const landingUrl = `${getWebUrl()}/landing/${apikey}`;

// Install code content - fixed template literal
const installCode = `&lt;script&gt;!function() {
  var t; if (t = window.webbot = window.webbot = window.webbot || [], !t.init) return t.invoked ? void (window.console &amp;&amp; console.error &amp;&amp; console.error("Webbot snippet included twice.")) : (
  t.load =function(e){	var o,n;	o=document.createElement("script"); e.type="text/javscript"; o.async=!0; o.crossorigin="anonymous";
  o.src="${getWebUrl()}/web-bot/script/frame/"+e+"/webbot.js";	n=document.getElementsByTagName("script")[0];	n.parentNode.insertBefore(o,n); });
  }(); webbot.load('${apikey}');
&lt;/script&gt;`;

const openModal = () => {
  modalRef.value?.openModal();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const handleTabChange = (tabId: string) => {
  console.log('Tab changed to:', tabId);
  currentActiveTab.value = tabId;
};

// Methods
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied to clipboard!');
    // You can add a toast notification here
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

const generateInlineCode = () => {
  generatedInlineCode.value = `// Paste this code in which section you want to have embedable conversation
&lt;div id="botsify-embed-div"&gt;&lt;/div&gt;

//put this code at the bottom of the body tag
&lt;script&gt;
!function() {
var t; if (t = window.botsify_embed = window.botsify_embed = window.botsify_embed || [], !t.init) return t.invoked ? void (window.console && console.error && console.error("Botsify snippet included twice.")) : (
t.load =function(e,s,bg){ var o,n;  o=document.createElement("script"); e.type="text/javscript"; o.async=!0; o.crossorigin="anonymous";
o.src="${getWebUrl()}/web-bot/script/embed/"+e+"/"+s+"/"+bg+"/botsify.js"; n=document.getElementsByTagName("script")[0]; n.parentNode.insertBefore(o,n); });
}(); botsify_embed.load('${apikey}','null','${selectedColor}');
&lt;/script&gt;`;
};


const sendEmail = async () => {
  if (!developerEmail.value.trim()) {
    console.error('Developer email is required');
    return;
  }

  isLoading.value = true;
  try {
    const result = await publishStore.sendDeveloperEmail(developerEmail.value);
    
    if (result.success) {
      developerEmail.value = '';
      window.$toast.success('Email sent successfully to:', developerEmail.value);
    } else {
      window
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  } finally {
    isLoading.value = false;
  }
};

const saveLandingSettings = async () => {
  isLoading.value = true;
  try {
    const result = await publishStore.saveLandingSettings(backgroundStyle.value);
    
    if (result.success) {
      console.log('Landing settings saved successfully');
    } else {
      console.error('Failed to save landing settings:', result.error);
    }
  } catch (error) {
    console.error('Failed to save landing settings:', error);
  } finally {
    isLoading.value = false;
  }
};

const copyLandingUrl = () => {
  copyToClipboard(landingUrl);
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Website Integration"
    :tabs="tabs"
    max-width="650px"
    default-tab="install-code"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Install Code Tab -->
      <div v-if="activeTab === 'install-code'" class="tab-panel">
        <h3>Iframe Based Web Widget</h3>
        <p class="subtitle">Paste before ending body tags</p>
        <p class="description">
          Iframe would be loaded as an external document element, the widget would not be affected by your Page CSS
        </p>
        
        <div class="code-block">
          <div class="code-header">
            <span class="code-title">HTML Code</span>
            <button class="copy-button" @click="copyToClipboard(installCode)">
              Copy
            </button>
          </div>
          <pre><code>{{ installCode }}</code></pre>
        </div>
      </div>

      <!-- Inline Widget Tab -->
      <div v-if="activeTab === 'inline-widget'" class="tab-panel">
        <h3>Inline Embed Code</h3>
        
        <div class="form-section">
          <label class="form-label">Select Background Color</label>
          <div class="color-picker-container">
            <div 
              class="color-preview" 
              :style="{ backgroundColor: selectedColor }"
              @click="showColorPicker = !showColorPicker"
            ></div>
            <input 
              v-model="selectedColor" 
              type="color" 
              class="color-input"
              :class="{ visible: showColorPicker }"
            />
            <span class="color-value">{{ selectedColor }}</span>
          </div>
        </div>



        <div v-if="generatedInlineCode" class="code-block">
          <div class="code-header">
            <span class="code-title">Generated Code</span>
            <button class="copy-button" @click="copyToClipboard(generatedInlineCode)">
              Copy
            </button>
          </div>
          <pre><code>{{ generatedInlineCode }}</code></pre>
        </div>
      </div>

      <!-- Email Developer Tab -->
      <div v-if="activeTab === 'email-developer'" class="tab-panel">
        <h3>Email To Developer</h3>
        <p>Send integration instructions to your developer:</p>
        <form id="email-form" @submit.prevent="sendEmail" class="email-form">
          <div class="form-group">
            <label for="dev-email">Developer's Email:</label>
            <input 
              id="dev-email"
              type="email" 
              v-model="developerEmail"
              placeholder="developer@company.com" 
              class="email-input"
              required
            />
          </div>

        </form>
      </div>

      <!-- Landing Bot Tab -->
      <div v-if="activeTab === 'landing-bot'" class="tab-panel">
        <h3>Landing Bot</h3>
        <p>Use this URL to send the user to the landing page chatbot.</p>
        
        <div class="url-section">
          <div class="url-display">
            <input 
              type="text" 
              :value="landingUrl" 
              readonly 
              class="url-input"
            />
            <button class="copy-url-button" @click="copyLandingUrl">
              Copy
            </button>
          </div>
        </div>

        <div class="form-section">
          <label class="form-label">Background Style</label>
          <div class="radio-group">
            <label class="radio-option">
              <input 
                type="radio" 
                v-model="backgroundStyle" 
                value="gradient"
              />
              <span class="radio-label">Gradient</span>
            </label>
            <label class="radio-option">
              <input 
                type="radio" 
                v-model="backgroundStyle" 
                value="plain-primary"
              />
              <span class="radio-label">Plain Primary</span>
            </label>
            <label class="radio-option">
              <input 
                type="radio" 
                v-model="backgroundStyle" 
                value="plain-secondary"
              />
              <span class="radio-label">Plain Secondary</span>
            </label>
          </div>
        </div>


      </div>
    </template>
    
    <template #actions>
      <!-- Generate Code Button for Inline Widget Tab -->
      <button 
        v-if="currentActiveTab === 'inline-widget'" 
        class="action-button primary" 
        @click="generateInlineCode"
      >
        Generate Code
      </button>
      
      <!-- Send Instructions Button for Email Developer Tab -->
      <button 
        v-if="currentActiveTab === 'email-developer'" 
        class="action-button primary" 
        type="submit"
        form="email-form"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Sending...' : 'Send Instructions' }}
      </button>
      
      <!-- Save Button for Landing Bot Tab -->
      <button 
        v-if="currentActiveTab === 'landing-bot'" 
        class="action-button primary" 
        @click="saveLandingSettings"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Saving...' : 'Save' }}
      </button>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
.tab-panel {
  padding: 0;
}

.tab-panel h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.description {
  margin: 0 0 20px 0;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.6;
  font-size: 14px;
}

.code-block {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  margin: 20px 0;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.code-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.copy-button {
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-button:hover {
  background: var(--color-primary-hover, #2563eb);
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.code-block code {
  color: var(--color-text-primary, #111827);
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
  white-space: pre;
}

.form-section {
  margin: 24px 0;
}

.form-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid var(--color-border, #e5e7eb);
  cursor: pointer;
  transition: border-color 0.2s;
}

.color-preview:hover {
  border-color: var(--color-primary, #3b82f6);
}

.color-input {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

.color-input.visible {
  opacity: 1;
  position: relative;
  pointer-events: auto;
}

.color-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  background: var(--color-bg-secondary, #f9fafb);
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--color-border, #e5e7eb);
}

.generate-button {
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  margin-bottom: 20px;
}

.generate-button:hover {
  background: var(--color-primary-hover, #2563eb);
}

.url-section {
  margin: 20px 0;
}

.url-display {
  display: flex;
  gap: 8px;
}

.url-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  box-sizing: border-box;
}

.copy-url-button {
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}

.copy-url-button:hover {
  background: var(--color-primary-hover, #2563eb);
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 8px 0;
}

.radio-option input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.radio-label {
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  cursor: pointer;
}

.save-button {
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  margin-top: 20px;
}

.save-button:hover {
  background: var(--color-primary-hover, #2563eb);
}

.email-form {
  max-width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
}

.email-input,
.message-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: white;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.email-input:focus,
.message-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-input {
  resize: vertical;
  min-height: 80px;
}

.send-button {
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.send-button:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  font-family: inherit;
}

.action-button.primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .color-picker-container {
    flex-wrap: wrap;
  }
  
  .url-display {
    flex-direction: column;
  }
  
  .copy-url-button {
    align-self: flex-start;
  }
  
  .radio-group {
    gap: 16px;
  }
}
</style>