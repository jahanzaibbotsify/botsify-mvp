<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { Button, Input, VueSelect } from "@/components/ui";
import FileUpload from "@/components/ui/FileUpload.vue";
import MessagePreview from "./Create/MessagePreview.vue";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import { usePublishStore } from "@/stores/publishStore";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'send-broadcast': [data: any];
}>();

// Stores
const store = useWhatsAppTemplateStore();
const publishStore = usePublishStore();

// Reactive data
const broadcastForm = ref({
  message: '',
  template: '',
  userSegment: '',
  phoneNumber: '',
  mediaType: 'text',
  uploadedFile: null as any | null
});

// Template data
const templates = ref<any[]>([]);
const selectedTemplate = ref<any>(null);
const isLoadingTemplates = ref(false);
const templateData = ref({
  name: '',
  category: 'MARKETING',
  type: 'text',
  bodyIncludes: ['body'],
  header: 'text',
  header_text: '',
  footer_text: '',
  body_text: '',
  slides: [] as any[],
  button_type: 'postback',
  total_buttons: 3,
  variables: {
    header: null as any,
    body: [] as any[],
    button: null as any,
    buttons: [] as any[]
  },
  attachment_link: '',
  buttons: []
});

// User segments
const userSegments = [
  { value: '', label: 'Select user segment' },
  { value: 'subscribed', label: 'Subscribed Users' },
  { value: 'upload', label: 'Upload User' },
  { value: 'single', label: 'Single User' }
];

// Computed properties
const showFileUpload = computed(() => broadcastForm.value.userSegment === 'upload');
const showPhoneNumber = computed(() => broadcastForm.value.userSegment === 'single');
const showVariableFields = computed(() => selectedTemplate.value && selectedTemplate.value.params);
const showMessageEditor = computed(() => {
  return selectedTemplate.value && (
    templateData.value.variables.body.length > 0 ||
    templateData.value.variables.header ||
    templateData.value.variables.button ||
    (templateData.value.type === 'generic' && templateData.value.slides.length > 0)
  );
});

// Methods
const fetchTemplates = async () => {
  // Check if templates are already loaded in the store
  if (publishStore.isLoadingTemplates) return;
  
  // If templates are already loaded in store, use them
  if (publishStore.templatesLoaded && publishStore.templatesCache.length > 0) {
    templates.value = publishStore.templatesCache.map((template: any) => ({
      ...template,
      label: template.name || template.id || `Template ${template.id}`,
      value: template
    }));
    return;
  }
  
  // If templates are already loaded locally, use them
  if (templates.value.length > 0) return;
  
  isLoadingTemplates.value = true;
  try {
    const result = await publishStore.fetchTemplates();
    if (result.success && result.data && result.data.templates && result.data.templates.data && Array.isArray(result.data.templates.data)) {
      templates.value = result.data.templates.data.map((template: any) => ({
        ...template,
        label: template.name || template.id || `Template ${template.id}`,
        value: template
      }));
    } else {
      console.warn('No templates data or invalid format:', result);
      templates.value = [];
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    templates.value = [];
  } finally {
    isLoadingTemplates.value = false;
  }
};

const handleTemplateChange = () => {
  // Add a small delay to ensure DOM is ready
  nextTick(() => {
    if (selectedTemplate.value) {
      setTemplateVariable();
    }
  });
};

const setTemplateVariable = () => {
  if (!selectedTemplate.value) return;

  try {
    // Reset template data
    templateData.value = {
    name: '',
    category: 'MARKETING',
    type: 'text',
    bodyIncludes: [],
    header: 'text',
    header_text: '',
    footer_text: '',
    body_text: '',
    slides: [],
    button_type: 'postback',
    total_buttons: 3,
    variables: {
      header: null,
      body: [],
      button: null,
      buttons: []
    },
    attachment_link: '',
    buttons: []
  };

  const currTemplate = selectedTemplate.value;
  console.log('Current template:', currTemplate);
  
  // Parse params if they exist
  let params = [];
  if (currTemplate.params) {
    try {
      params = typeof currTemplate.params === 'string' ? JSON.parse(currTemplate.params) : currTemplate.params;
    } catch (e) {
      console.warn('Failed to parse template params:', e);
      params = [];
    }
  }
  
     if (currTemplate.category === 'AUTHENTICATION') {
     // Parse and assign params for AUTHENTICATION category
     templateData.value.category = 'AUTHENTICATION';
     
     // Find the body parameter and use its text
     const bodyParam = params.find((param: any) => param.type === 'body');
     if (bodyParam && bodyParam.parameters && bodyParam.parameters.length > 0) {
       const bodyVariable = bodyParam.parameters[0];
       if (bodyVariable.type === 'text') {
         templateData.value.body_text = bodyVariable.text || "{{1}} is your verification code. For security do not share this code.";
       } else {
         templateData.value.body_text = "{{1}} is your verification code. For security do not share this code.";
       }
     } else {
       templateData.value.body_text = "{{1}} is your verification code. For security do not share this code.";
     }
     
     templateData.value.footer_text = "This code will expire in 1 minutes.";
    
    templateData.value.variables.body = [];
    const newBodyVar: any[] = [];
    
         params.forEach((param: any) => {
       if (param.type === 'body') {
         templateData.value.bodyIncludes.push('body');
         param.parameters.forEach((variable: any) => {
           // Handle different parameter types
           if (variable.type === 'text') {
             // For text parameters, use the text as the key
             newBodyVar.push({
               key: variable.text || '{{1}}',
               value: ''
             });
           } else {
             // For other parameter types, use default key
             newBodyVar.push({
               key: '{{1}}',
               value: ''
             });
           }
         });
       }

       if (param.type === 'button') {
         templateData.value.bodyIncludes.push('buttons');
         param.parameters.forEach((variable: any) => {
           if (variable.type === 'text') {
             templateData.value.variables.button = {
               index: 0,
               key: variable.text || '{{1}}',
               value: ''
             };
           } else {
             templateData.value.variables.button = {
               index: 0,
               key: '{{1}}',
               value: ''
             };
           }
         });
       }
     });
    
    templateData.value.variables.body = newBodyVar;
    templateData.value.bodyIncludes.push('buttons');
    
    // Get buttons from components if available
    if (currTemplate.components && currTemplate.components[1] && currTemplate.components[1].buttons) {
      templateData.value.buttons = currTemplate.components[1].buttons;
    }
  } else {
    // Handle other template types
    if (currTemplate.components) {
      currTemplate.components.forEach((component: any) => {
        if (component.type === 'HEADER') {
          templateData.value.bodyIncludes.push('header');
          const componentType = component.format ? component.format.toLowerCase() : 'text';
          templateData.value.type = componentType;
          
          if (componentType === 'text') {
            templateData.value.header_text = component.text || '';
            if (component.text && component.text.includes('{{1}}')) {
              templateData.value.variables.header = {
                key: '{{1}}',
                value: ''
              };
            }
          } else {
            templateData.value.variables.header = null;
            templateData.value.header_text = '';
          }
        }

        if (component.type === 'BODY') {
          templateData.value.bodyIncludes.push('body');
          templateData.value.body_text = component.text || '';
          const result = component.text ? component.text.match(/{{\d+}}/g) : null;
          
          if (result) {
            const newBodyVar: any[] = [];
            const alreadyAdded: string[] = [];
            
            result.forEach((variable: string) => {
              if (!alreadyAdded.includes(variable)) {
                alreadyAdded.push(variable);
                newBodyVar.push({
                  key: variable,
                  value: ''
                });
              }
            });

            templateData.value.variables.body = newBodyVar;
          } else {
            templateData.value.variables.body = [];
          }
        }

        if (component.type === 'FOOTER') {
          templateData.value.bodyIncludes.push('footer');
          templateData.value.footer_text = component.text || '';
        }

        if (component.type === 'BUTTONS') {
          templateData.value.bodyIncludes.push('buttons');
          templateData.value.buttons = component.buttons || [];
          
          component.buttons.forEach((btn: any, index: number) => {
            if (btn.type === 'URL' && btn.url && btn.url.includes('{{1}}')) {
              templateData.value.variables.button = {
                key: '{{1}}',
                value: '',
              };
            }
          });
        }

        if (component.type === 'CAROUSEL') {
          templateData.value.type = 'generic';
          
          component.cards.forEach((card: any, index: number) => {
            card.components.forEach((comp: any) => {
              if (!templateData.value.slides[index]) {
                const slide = {
                  id: index + 1,
                  title: 'Slide Title',
                  subtitle: 'Subtitle',
                  attachment_link: '',
                  header: 'image',
                  buttons: [],
                  variables: {
                    body: [],
                    button: null
                  }
                };
                templateData.value.slides[index] = slide;
              }
              
              if (comp.type === 'HEADER') {
                const componentType = comp.format ? comp.format.toLowerCase() : 'image';
                templateData.value.slides[index].header = componentType;
              }
              
              if (comp.type === 'BODY') {
                templateData.value.slides[index].title = comp.text || '';
                const result = comp.text ? comp.text.match(/{{\d+}}/g) : null;
                
                if (result) {
                  const newBodyVar: any[] = [];
                  const alreadyAdded: string[] = [];
                  
                  result.forEach((variable: string) => {
                    if (!alreadyAdded.includes(variable)) {
                      alreadyAdded.push(variable);
                      newBodyVar.push({
                        key: variable,
                        value: ''
                      });
                    }
                  });

                  templateData.value.slides[index].variables.body = newBodyVar;
                } else {
                  templateData.value.slides[index].variables.body = [];
                }
              } else if (comp.type === 'BUTTONS') {
                templateData.value.slides[index].buttons = comp.buttons || [];
                
                comp.buttons.forEach((btn: any, btnIndex: number) => {
                  if (btn.type === 'url' && btn.url && btn.url.includes('{{1}}')) {
                    templateData.value.slides[index].variables.button = {
                      key: '{{1}}',
                      value: ''
                    };
                  }
                });
              }
            });
          });
        }
      });
    }
  }
  
  console.log('Template data after parsing:', templateData.value);
  
  // Update store with template data
  store.template = { ...templateData.value };
  store.block.text = templateData.value.body_text || '';
  } catch (error) {
    console.error('Error setting template variable:', error);
  }
};

const handleFileUpload = (attachments: any[]) => {
  if (attachments && attachments.length > 0) {
    broadcastForm.value.uploadedFile = attachments[0];
  }
};

const sendBroadcast = () => {
  if (!store.block.text) {
    console.error('Message is required');
    return;
  }
  
  if (!broadcastForm.value.userSegment) {
    console.error('User segment is required');
    return;
  }
  
  if (broadcastForm.value.userSegment === 'single' && !broadcastForm.value.phoneNumber) {
    console.error('Phone number is required for single user broadcast');
    return;
  }
  
  if (broadcastForm.value.userSegment === 'upload' && !broadcastForm.value.uploadedFile) {
    console.error('File upload is required for upload user broadcast');
    return;
  }
  
  emit('send-broadcast', {
    ...broadcastForm.value,
    message: store.block.text,
    type: broadcastForm.value.userSegment
  });
};

// Initialize templates when component is mounted
// This will be called when the broadcast tab becomes active
const initializeTemplates = () => {
  // Add a small delay to ensure component is fully mounted
  nextTick(() => {
    // Check if templates are already loaded in store
    if (publishStore.templatesLoaded && publishStore.templatesCache.length > 0) {
      templates.value = publishStore.templatesCache.map((template: any) => ({
        ...template,
        label: template.name || template.id || `Template ${template.id}`,
        value: template
      }));
      return;
    }
    
    // Only fetch if not already loaded locally
    if (templates.value.length === 0) {
      fetchTemplates();
    }
  });
};

// Watch for template data changes
watch(templateData, (newValue) => {
  // Update store with template data
  store.template = { ...newValue };
  store.block.text = newValue.body_text || '';
}, { deep: true });

// Expose methods for parent component
defineExpose({
  sendBroadcast,
  initializeTemplates
});
</script>

<template>
  <div class="broadcast-layout">
    <!-- Main Content -->
    <div class="main-content">
      <h3>Broadcast</h3>
      <p class="subtitle">Send broadcast messages to your audience</p>
      
      <div class="broadcast-form">
        <!-- Message Template -->
        <div class="form-group">
          <label for="broadcast-template">Message template</label>
                     <VueSelect
             id="broadcast-template"
             v-model="selectedTemplate"
             :options="templates"
             :reduce="(template: any) => template"
             placeholder="Select a template"
             :loading="isLoadingTemplates"
             :disabled="isLoadingTemplates"
             @input="handleTemplateChange"
             :clearable="false"
           />
        </div>
        
        <!-- User Segment -->
        <div class="form-group">
          <label for="broadcast-segment">User segment</label>
          <VueSelect
            id="broadcast-segment"
            v-model="broadcastForm.userSegment"
            :options="userSegments"
            :reduce="(segment: any) => segment.value"
            placeholder="Select user segment"
          />
        </div>
        
        <!-- File Upload (Upload user only) -->
        <div v-if="showFileUpload" class="form-group">
          <label>Upload user file</label>
          <FileUpload
            v-model="broadcastForm.uploadedFile"
            accept=".csv,.txt"
            :multiple="false"
            :max-size-m-b="10"
            text="Upload CSV or TXT file with phone numbers"
            @upload="handleFileUpload"
          />
          <small class="help-text">
            Upload a CSV or TXT file containing phone numbers to send messages to.
          </small>
        </div>
        
        <!-- Phone Number (Single user only) -->
        <div v-if="showPhoneNumber" class="form-group">
          <label for="broadcast-phone">Phone number</label>
          <Input
            id="broadcast-phone"
            v-model="broadcastForm.phoneNumber"
            type="tel"
            placeholder="Enter phone number"
          />
        </div>
      </div>
      
                     

                 <!-- Message Editor -->
         <div v-if="showMessageEditor" class="message-editor">
           <h4>Message content</h4>
           
           <!-- Variable input fields instead of textarea -->
           <div v-if="templateData.variables.body.length > 0" class="form-group">
             <div v-for="(variable, varIndex) in templateData.variables.body" :key="varIndex">
               <label class="required-label">
                 {{ templateData.category === 'AUTHENTICATION' ? 'Authentication Code' : 'Body Variable' }} - {{ variable.key }}
               </label>
               <Input
                 v-model="variable.value"
                 :placeholder="`Enter value for ${variable.key}`"
               />
             </div>
           </div>
           
           <!-- Header Variables -->
           <div v-if="templateData.variables.header" class="form-group">
             <label class="required-label">Header Variable - {{ templateData.variables.header.key }}</label>
             <Input
               v-model="templateData.variables.header.value"
               placeholder="Enter header variable value"
             />
           </div>

           <!-- Button Variables -->
           <div v-if="templateData.variables.button && templateData.category !== 'AUTHENTICATION'" class="form-group">
             <label class="required-label">URL Button Variable - {{ templateData.variables.button.key }}</label>
             <Input
               v-model="templateData.variables.button.value"
               placeholder="Enter button variable value"
             />
           </div>
           
           <!-- Generic Template Slides -->
           <div v-if="templateData.type === 'generic' && templateData.slides.length > 0" class="slides-section">
             <h5>Template Slides</h5>
             <div class="slides-container">
               <div v-for="(slide, index) in templateData.slides" :key="index" class="slide-card">
                 <h6>Slide {{ index + 1 }}</h6>
                 
                 <!-- Slide Body Variables -->
                 <div v-if="slide.variables.body.length > 0" class="form-group">
                   <div v-for="(variable, varIndex) in slide.variables.body" :key="varIndex">
                     <label>Body Variable - {{ variable.key }}</label>
                     <Input
                       v-model="variable.value"
                       placeholder="Enter variable value"
                     />
                   </div>
                 </div>

                 <!-- Slide Button Variable -->
                 <div v-if="slide.variables.button" class="form-group">
                   <label class="required-label">Button Variable - {{ slide.variables.button.key }}</label>
                   <Input
                     v-model="slide.variables.button.value"
                     placeholder="Enter button variable value"
                   />
                 </div>

                 <!-- Slide Attachment Link -->
                 <div class="form-group">
                   <label class="required-label">
                     {{ slide.header.charAt(0).toUpperCase() + slide.header.slice(1) }} Link
                   </label>
                   <Input
                     v-model="slide.attachment_link"
                     :placeholder="`Enter ${slide.header} link`"
                   />
                 </div>
               </div>
             </div>
           </div>
         </div>
    </div>
    
    <!-- Side Panel -->
    <div class="side-panel">
      <div class="preview-header">
        <h4>Message preview</h4>
      </div>
      <MessagePreview 
        v-if="store.template && store.block"
        :template="store.template"
        :block="store.block"
        :variables="store.template.variables"
      />
    </div>
  </div>
</template>

<style scoped>
.broadcast-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-4);
  height: 100%;
}

.main-content {
  padding: 0;
}

.main-content h3 {
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

.broadcast-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.help-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 4px;
}

.message-editor {
  margin-top: var(--space-6);
}

.message-editor h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.message-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary, #111827);
  background-color: var(--color-bg-tertiary, #f3f4f6);
  resize: vertical;
  min-height: 120px;
}

.message-textarea:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-textarea::placeholder {
  color: var(--color-text-tertiary, #9ca3af);
}

.variable-fields {
  margin-top: var(--space-6);
}

.variable-fields h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.required-label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.required-label::after {
  content: " *";
  color: var(--color-error);
}

.slides-section {
  margin-top: var(--space-4);
}

.slides-section h5 {
  margin: 0 0 var(--space-3) 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.slides-container {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  padding-bottom: var(--space-2);
}

.slide-card {
  background: white;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-3);
  min-width: 300px;
  flex-shrink: 0;
}

.slide-card h6 {
  margin: 0 0 var(--space-3) 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.side-panel {
  background: var(--color-bg-secondary, #f9fafb);
  border-left: 1px solid var(--color-border, #e5e7eb);
  padding: var(--space-4);
  overflow-y: auto;
  height: 100%;
}

.preview-header {
  margin-bottom: var(--space-4);
}

.preview-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .broadcast-layout {
    grid-template-columns: 1fr;
  }
  
  .side-panel {
    border-left: none;
    border-top: 1px solid var(--color-border, #e5e7eb);
    padding-top: var(--space-4);
  }
}

@media (max-width: 768px) {
  .broadcast-layout {
    gap: var(--space-3);
  }
  
  .side-panel {
    padding: var(--space-3);
  }
}
</style> 