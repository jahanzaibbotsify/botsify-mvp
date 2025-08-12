<script setup lang="ts">
import {Button, Input, PublishModalLayout} from "@/components/ui";
import { ref, onMounted } from "vue";
import { useBotStore } from "@/stores/botStore";
import { usePublishStore } from "@/stores/publishStore";
import { getWebUrl } from "@/utils";

// Define tabs first
const tabs = [
  { id: 'install-code', label: 'Install Code Yourself' },
  { id: 'inline-widget', label: 'Inline Widget' },
  { id: 'landing-bot', label: 'Landing Agent' }
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const publishStore = usePublishStore();
const currentActiveTab = ref('install-code');

const emit = defineEmits<{
  back: [];
}>();

// Reactive data
const apikey = useBotStore().apiKey;
const isLoading = ref(false);
const selectedColor = ref('#3b82f6');
const showColorPicker = ref(false);
const generatedInlineCode = ref('');
const backgroundStyle = ref<'gradient' | 'plain-primary' | 'plain-secondary'>('gradient');
const landingUrl = `${getWebUrl()}/web-bot/landing/${apikey}`;

// Install code content - fixed template literal
const installCode = `&lt;script&gt;!function() {
  var t; if (t = window.webbot = window.webbot = window.webbot || [], !t.init) return t.invoked ? void (window.console &amp;&amp; console.error &amp;&amp; console.error("Webbot snippet included twice.")) : (
  t.load =function(e){	var o,n;	o=document.createElement("script"); e.type="text/javscript"; o.async=!0; o.crossorigin="anonymous";
  o.src="${getWebUrl()}/web-bot/script/frame/"+e+"/webbot.js";	n=document.getElementsByTagName("script")[0];	n.parentNode.insertBefore(o,n); });
  }(); webbot.load('${apikey}');
&lt;/script&gt;`;

const loadBotDetails = async () => {
  try {
    const result = await publishStore.getBotDetails();
    
    if (result.success && result.data) {
      // Extract wizard_config from the response
      const wizardConfig = result.data.wizard_config;
      
      if (wizardConfig && wizardConfig['landing-bot-bg-style']) {
        const savedStyle = wizardConfig['landing-bot-bg-style'];
        
        // Validate that the saved style is one of the allowed values
        if (['gradient', 'plain-primary', 'plain-secondary'].includes(savedStyle)) {
          backgroundStyle.value = savedStyle as 'gradient' | 'plain-primary' | 'plain-secondary';
          console.log('Loaded background style from bot details:', backgroundStyle.value);
        }
      }
    }
  } catch (error) {
    console.error('Failed to load bot details:', error);
  }
};

const openModal = async () => {
  modalRef.value?.openModal();
  // Load bot details when modal opens
  await loadBotDetails();
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
 const textarea = document.createElement('textarea');
  // Decode HTML entities like &lt; and &gt; into < and >
  textarea.innerHTML = text;
  const decoded = textarea.value;

  // Copy decoded value
  await navigator.clipboard.writeText(decoded);
  window.$toast.success('Copied!');
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
}(); botsify_embed.load('${apikey}','null','${selectedColor.value}');
&lt;/script&gt;`;
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

// Load bot details on component mount
onMounted(() => {
  loadBotDetails();
});

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Website integration"
    :tabs="tabs"
    icon="/bots/website.png"
    max-width="1200px"
    default-tab="install-code"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Install Code Tab -->
      <div v-if="activeTab === 'install-code'" class="tab-panel">
        <h3>Iframe based web widget</h3>
        <p class="subtitle">Paste before ending body tags</p>
        <p class="description">
          Iframe would be loaded as an external document element, the widget would not be affected by your Page CSS
        </p>
        
        <div class="code-block">
          <div class="code-header">
            <span class="code-title">HTML code</span>
            <Button size="small" variant="secondary" @click="copyToClipboard(installCode)">
              Copy
            </Button>
          </div>
          <pre><code v-html="installCode"></code></pre>
        </div>
      </div>

      <!-- Inline Widget Tab -->
      <div v-if="activeTab === 'inline-widget'" class="tab-panel">
        <h3>Inline embed code</h3>
        
        <div class="form-section">
          <label class="form-label">Select background color</label>
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
            <span class="code-title">Generated code</span>
            <Button size="small" variant="secondary" @click="copyToClipboard(generatedInlineCode)">
              Copy
            </Button>
          </div>
          <pre><code v-html="generatedInlineCode"></code></pre>
        </div>
      </div>

      <!-- Landing Bot Tab -->
      <div v-if="activeTab === 'landing-bot'" class="tab-panel">
              <h3>Landing agent</h3>
      <p>Use this URL to send the user to the landing page agent.</p>
        
        <div class="url-section">
          <div class="url-display">
            <Input 
              :model-value="landingUrl" 
              readonly 
              size="large"
              @click="copyLandingUrl"
            />
          </div>
        </div>

        <div class="form-section">
          <label class="form-label">Background style</label>
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
              <span class="radio-label">Plain primary</span>
            </label>
            <label class="radio-option">
              <input 
                type="radio" 
                v-model="backgroundStyle" 
                value="plain-secondary"
              />
              <span class="radio-label">Plain secondary</span>
            </label>
          </div>
        </div>


      </div>
      
      <div class="agent-action-buttons">
        <!-- Generate Code Button for Inline Widget Tab -->
        <Button 
          v-if="currentActiveTab === 'inline-widget'" 
          variant="primary"
          size="medium"
          @click="generateInlineCode"
        >
          Generate code
        </Button>
        
        <!-- Send Instructions Button for Email Developer Tab -->
        <Button 
          v-if="currentActiveTab === 'email-developer'" 
          variant="primary"
          size="medium"
          :loading="isLoading"
          type="submit"
          form="email-form"
        >
          {{ isLoading ? 'Sending...' : 'Send instructions' }}
        </Button>
        
        <!-- Save Button for Landing Bot Tab -->
        <Button 
          v-if="currentActiveTab === 'landing-bot'" 
          variant="primary"
          size="medium"
          :loading="isLoading"
          @click="saveLandingSettings"
        >
          {{ isLoading ? 'Saving...' : 'Save settings' }}
        </Button>
      </div>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

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



.url-section {
  margin: 20px 0;
}

.url-display {
  max-width: 700px;
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