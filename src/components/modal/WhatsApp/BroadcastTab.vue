<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { Input, VueSelect, Button } from "@/components/ui";
import FileUpload from "@/components/ui/FileUpload.vue";
import MessagePreview from "./Create/MessagePreview.vue";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import { usePublishStore } from "@/stores/publishStore";
import { botsifyApi } from "@/services/botsifyApi";

// Props
interface Props {
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Broadcast sending state
const isBroadcastSending = ref(false);

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

// Validation errors
const validationErrors = ref({
  template: '',
  userSegment: '',
  phoneNumber: '',
  uploadedFile: '',
  variables: {} as Record<string, string>,
  mediaHeader: ''
});

// Media handling
const uploadingMedia = ref(false);
const isDownloadingSample = ref(false);
// const mediaFile = ref<File | null>(null);
const uploadedUsers = ref<Array<{phone_number: string}>>([]);
// Error state for CSV parsing
const csvError = ref<string | null>(null);

// CSV handling variables
// const csvFile = ref<File | null>(null);
const csvData = ref<{ headers: string[], data: any[] }>({ headers: [], data: [] });

// Add missing variables
const isTemplatesLoaded = ref(false);
const isLoadingTemplates = ref(false);

// Add subscribed users state
const subscribedUsers = ref<Array<{phone_number: string}>>([]);
const isLoadingSubscribedUsers = ref(false);

const fileUploadError = computed(() => {
  if (broadcastForm.value.userSegment === 'file' && !broadcastForm.value.uploadedFile) {
    return 'File upload is required for upload user broadcast';
  }
  if (broadcastForm.value.userSegment === 'file' && uploadedUsers.value.length === 0) {
    return 'No valid users found in uploaded file';
  }
  return undefined;
});
// Template data
const templates = ref<any[]>([]);
const selectedTemplate = ref<any>(null);
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
      buttonText: null as any,
      buttonUrl: null as any,
      buttons: [] as any[]
    },
    attachment_link: '',
    filename: '',
    buttons: []
  });

// User segments
const userSegments = [
  { value: '', label: 'Select user segment' },
  { value: 'subscribed', label: 'All users' },
  { value: 'upload', label: 'Upload users' },
  { value: 'single', label: 'Single user' }
];

// Computed properties
const showFileUpload = computed(() => broadcastForm.value.userSegment === 'upload');
const showPhoneNumber = computed(() => broadcastForm.value.userSegment === 'single');
const showMediaHeader = computed(() => {
  const result = selectedTemplate.value && 
         templateData.value.bodyIncludes.includes('header') && 
         templateData.value.type !== 'text';
  
  console.log('BroadcastTab - showMediaHeader computed:', {
    selectedTemplate: !!selectedTemplate.value,
    bodyIncludesHeader: templateData.value.bodyIncludes.includes('header'),
    templateType: templateData.value.type,
    result: result
  });
  
  return result;
});

// Check if templates are available
const showTemplateMessage = computed(() => {
  if (isLoadingTemplates.value) return 'Loading templates...';
  if (!isTemplatesLoaded.value) return 'Initializing templates...';
  if (templates.value.length === 0) return 'No approved templates found';
  return '';
});
// const showCsvUpload = computed(() => broadcastForm.value.userSegment === 'upload');
// const showVariableFields = computed(() => selectedTemplate.value && (
//   templateData.value.variables.body.length > 0 ||
//   templateData.value.variables.header ||
//   templateData.value.variables.button ||
//   (templateData.value.type === 'generic' && templateData.value.slides.length > 0)
// ));
const showMessageEditor = computed(() => {
  console.log("templateData.value", templateData.value)
  return selectedTemplate.value && (
    templateData.value.variables.body.length > 0 ||
    templateData.value.variables.header ||
    templateData.value.variables.button ||
    templateData.value.bodyIncludes.includes('header') ||
    (templateData.value.type === 'generic' && templateData.value.slides.length > 0)
  );
});

// Computed property to disable send button when there are validation errors
const isSendButtonDisabled = computed(() => {
  return hasValidationErrors() || 
         !broadcastForm.value.userSegment ||
         (broadcastForm.value.userSegment === 'single' && !broadcastForm.value.phoneNumber) ||
         (broadcastForm.value.userSegment === 'upload' && uploadedUsers.value.length === 0) ||
         (broadcastForm.value.userSegment === 'subscribed' && subscribedUsers.value.length === 0);
});

// Methods
const fetchTemplates = async () => {
  console.log('BroadcastTab - fetchTemplates called');
  
  // Check if templates are already loaded in the store
  if (publishStore.cacheValid.whatsappTemplates && publishStore.cache.whatsappTemplates && publishStore.cache.whatsappTemplates.data && publishStore.cache.whatsappTemplates.data.length > 0) {
    console.log('BroadcastTab - Using cached templates from store');
    // Filter templates to only include those with status === 1 (approved)
    const approvedTemplates = publishStore.cache.whatsappTemplates.data.filter((template: any) => template.status === 1);
    templates.value = approvedTemplates.map((template: any) => ({
      ...template,
      label: template.template_name || template.name || template.id || `Template ${template.id}`,
      value: template
    }));
    isTemplatesLoaded.value = true;
    return;
  }
  
  console.log('BroadcastTab - Fetching templates from API...');
  isLoadingTemplates.value = true;
  try {
    const result = await publishStore.fetchWhatsAppTemplates();
    console.log('BroadcastTab - API result:', result);
    
    if (result.success && result.data && result.data.templates && result.data.templates.data && Array.isArray(result.data.templates.data)) {
      // Filter templates to only include those with status === 1 (approved)
      const approvedTemplates = result.data.templates.data.filter((template: any) => template.status === 1);
      console.log('BroadcastTab - Approved templates found:', approvedTemplates.length);
      
      templates.value = approvedTemplates.map((template: any) => ({
        ...template,
        label: template.template_name || template.name || template.id || `Template ${template.id}`,
        value: template
      }));
      isTemplatesLoaded.value = true;
      
      console.log('BroadcastTab - Templates loaded successfully:', templates.value.length);
    } else {
      console.warn('BroadcastTab - No templates data or invalid format:', result);
      templates.value = [];
      isTemplatesLoaded.value = false;
    }
  } catch (error) {
    console.error('BroadcastTab - Error fetching templates:', error);
    templates.value = [];
    isTemplatesLoaded.value = false;
    
    // Show error message to user
    window.$toast.error('Failed to load templates. Please try refreshing the page.');
  } finally {
    isLoadingTemplates.value = false;
  }
};

const handleTemplateChange = () => {
  console.log(selectedTemplate.value, "selectedTemplate")
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
      buttonText: null,
      buttonUrl: null,
      buttons: []
    },
    attachment_link: '',
    filename: '',
    buttons: []
  };

  const currTemplate = selectedTemplate.value;
  console.log('Current template:', currTemplate);
  
  // Parse params if they exist
  let params = [];
  if (currTemplate.params) {
    try {
      params = typeof currTemplate.params === 'string' ? JSON.parse(currTemplate.params) : currTemplate.params;
      console.log('Parsed params:', params);
    } catch (e) {
      console.warn('Failed to parse template params:', e);
      params = [];
    }
  }

  // Parse data if it exists
  let templateDataFromData = null;
  if (currTemplate.data) {
    try {
      templateDataFromData = typeof currTemplate.data === 'string' ? JSON.parse(currTemplate.data) : currTemplate.data;
      console.log('Parsed data:', templateDataFromData);
    } catch (e) {
      console.warn('Failed to parse template data:', e);
      templateDataFromData = null;
    }
  }
  
  // Set template name and category
  templateData.value.name = currTemplate.template_name || currTemplate.name || '';
  templateData.value.category = currTemplate.category || 'MARKETING';
  if (currTemplate.category === 'AUTHENTICATION') {
    // Parse and assign params for AUTHENTICATION category
    templateData.value.category = 'AUTHENTICATION';
    
    console.log('BroadcastTab - Processing AUTHENTICATION template:', {
      params: params,
      components: currTemplate.components
    });
    
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
            console.log('BroadcastTab - Added body variable for AUTHENTICATION:', {
              key: variable.text || '{{1}}',
              type: variable.type
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

      // For AUTHENTICATION templates, don't set button variables since OTP buttons don't need user input
      // Just add buttons to bodyIncludes for display purposes
      if (param.type === 'button') {
        templateData.value.bodyIncludes.push('buttons');
        console.log('BroadcastTab - Added buttons to bodyIncludes for AUTHENTICATION (no variables needed)');
        // Don't create button variables for authentication templates
        // OTP buttons are handled automatically by WhatsApp
      }
    });
  
    templateData.value.variables.body = newBodyVar;
    // Get buttons from components if available
    if (currTemplate.components && currTemplate.components[1] && currTemplate.components[1].buttons) {
      templateData.value.buttons = currTemplate.components[1].buttons;
      console.log('BroadcastTab - Set buttons for AUTHENTICATION template:', templateData.value.buttons);
    }
    
    console.log('BroadcastTab - Final AUTHENTICATION template data:', {
      bodyText: templateData.value.body_text,
      bodyVariables: templateData.value.variables.body,
      buttonVariables: templateData.value.variables.button,
      bodyIncludes: templateData.value.bodyIncludes,
      buttons: templateData.value.buttons
    });
  } else {
    // Handle other template types - First check if we have params
    if (params && params.length > 0) {
      console.log('Processing template with params:', params);
      
      params.forEach((param: any) => {
        if (param.type === 'body') {
          templateData.value.bodyIncludes.push('body');
          templateData.value.body_text = param.parameters[0]?.text || '';
          
          const newBodyVar: any[] = [];
          param.parameters.forEach((variable: any) => {
            if (variable.type === 'text') {
              newBodyVar.push({
                key: variable.text || '{{1}}',
                value: ''
              });
            } else {
              newBodyVar.push({
                key: '{{1}}',
                value: ''
              });
            }
          });
          templateData.value.variables.body = newBodyVar;
        }

        if (param.type === 'header') {
          templateData.value.bodyIncludes.push('header');
          
          // Check the first parameter to determine header type
          const firstParam = param.parameters[0];
          if (firstParam) {
            if (firstParam.type === 'video') {
              // Video header - set type to video and don't set header variable
              templateData.value.type = 'video';
              templateData.value.header = 'video';
              templateData.value.variables.header = null;
              templateData.value.header_text = '';
            } else if (firstParam.type === 'image') {
              // Image header - set type to image and don't set header variable
              templateData.value.type = 'image';
              templateData.value.header = 'image';
              templateData.value.variables.header = null;
              templateData.value.header_text = '';
            } else if (firstParam.type === 'document') {
              // Document header - set type to document and don't set header variable
              templateData.value.type = 'document';
              templateData.value.header = 'document';
              templateData.value.variables.header = null;
              templateData.value.header_text = '';
            } else if (firstParam.type === 'text') {
              // Text header
              templateData.value.type = 'text';
              templateData.value.header_text = firstParam.text || '';
              
              // Check if text contains variables
              if (firstParam.text && firstParam.text.includes('{{1}}')) {
                templateData.value.variables.header = {
                  key: '{{1}}',
                  value: ''
                };
              } else {
                templateData.value.variables.header = null;
              }
            }
          }
        }

        if (param.type === 'button') {
          templateData.value.bodyIncludes.push('buttons');
          param.parameters.forEach((variable: any) => {
            if (variable.type === 'text') {
              // Store button text variable
              templateData.value.variables.buttonText = {
                key: variable.text || '{{1}}',
                value: ''
              };
              // Also store as button for backward compatibility
              templateData.value.variables.button = {
                key: variable.text || '{{1}}',
                value: ''
              };
            }
          });
          
          // Initialize buttons array if not exists
          if (!templateData.value.buttons) {
            templateData.value.buttons = [];
          }
        }
      });
    } 

    if (templateDataFromData && templateDataFromData.components) {
      // Use data field if available
      templateDataFromData.components.forEach((component: any) => {
        if (component.type === 'HEADER') {
          templateData.value.bodyIncludes.push('header');
          const componentType = component.format ? component.format.toLowerCase() : 'text';
          templateData.value.type = componentType;
          templateData.value.header = componentType;
          
          if (componentType === 'text') {
            templateData.value.header_text = component.text || '';
            
            // Extract variables from header text
            const result = component.text ? component.text.match(/{{\d+}}/g) : null;
            if (result && result.length > 0) {
              templateData.value.variables.header = {
                key: result[0],
                value: ''
              };
              console.log('Extracted header variable:', {
                text: component.text,
                variable: result[0]
              });
            } else {
              templateData.value.variables.header = null;
            }
          } else {
            templateData.value.variables.header = null;
            templateData.value.header_text = '';
          }
        }

        if (component.type === 'BODY') {
          templateData.value.bodyIncludes.push('body');
          templateData.value.body_text = component.text || '';
          
          // Extract variables from body text
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
            console.log('Extracted body variables:', {
              text: component.text,
              variables: newBodyVar
            });
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
          
          // Check for button variables in URLs and text
          component.buttons.forEach((btn: any) => {
            if (btn.type === 'URL' && btn.url) {
              // Check if URL contains variables like {{1}}, {{2}}, etc.
              const urlVariables = btn.url.match(/{{\d+}}/g);
              if (urlVariables && urlVariables.length > 0) {
                // Create button variable for the first variable found
                templateData.value.variables.button = {
                  key: urlVariables[0],
                  value: ''
                };
                console.log('Found button URL variable:', {
                  url: btn.url,
                  variable: urlVariables[0]
                });
              }
            }
            
            // Check for button text variables
            if (btn.text || btn.title) {
              const buttonText = btn.text || btn.title || '';
              const textVariables = buttonText.match(/{{\d+}}/g);
              if (textVariables && textVariables.length > 0) {
                // Create button text variable for the first variable found
                templateData.value.variables.buttonText = {
                  key: textVariables[0],
                  value: ''
                };
                console.log('Found button text variable:', {
                  text: buttonText,
                  variable: textVariables[0]
                });
              }
            }
          });
        }

        if (component.type === 'CAROUSEL') {
          console.log("carousel component", component)
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
                
                // Extract variables from slide body text
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
                  console.log('Extracted slide body variables:', {
                    slideIndex: index,
                    text: comp.text,
                    variables: newBodyVar
                  });
                } else {
                  templateData.value.slides[index].variables.body = [];
                }
              } else if (comp.type === 'BUTTONS') {
                templateData.value.slides[index].buttons = comp.buttons || [];
                
                // Check for button variables in slide URLs - FIRST INSTANCE
                comp.buttons.forEach((btn: any) => {
                  if (btn.type === 'url' && btn.url) {
                    // Check if URL contains variables like {{1}}, {{2}}, etc.
                    const urlVariables = btn.url.match(/{{\d+}}/g);
                    if (urlVariables && urlVariables.length > 0) {
                      // Create button variable for the first variable found
                      templateData.value.slides[index].variables.button = {
                        key: urlVariables[0],
                        value: ''
                      };
                      console.log('Found slide button URL variable:', {
                        slideIndex: index,
                        url: btn.url,
                        variable: urlVariables[0]
                      });
                    }
                  }
                  
                  // Check for button text variables in slides - FIRST INSTANCE
                  if (btn.text || btn.title) {
                    const buttonText = btn.text || btn.title || '';
                    const textVariables = buttonText.match(/{{\d+}}/g);
                    if (textVariables && textVariables.length > 0) {
                      // Create button text variable for the first variable found
                      templateData.value.slides[index].variables.buttonText = {
                        key: textVariables[0],
                        value: ''
                      };
                      console.log('Found slide button text variable:', {
                        slideIndex: index,
                        buttonText: buttonText,
                        variable: textVariables[0]
                      });
                    }
                  }
                });
              }
            });
          });
        }
      });
    } else if (currTemplate.components) {
      // Fallback to components parsing if no params
      currTemplate.components.forEach((component: any) => {
        console.log("component", component)
        if (component.type === 'HEADER') {
          templateData.value.bodyIncludes.push('header');
          const componentType = component.format ? component.format.toLowerCase() : 'text';
          templateData.value.type = componentType;
          templateData.value.header = componentType;
          
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
          
          // Check for button variables in URLs
          component.buttons.forEach((btn: any) => {
            if (btn.type === 'URL' && btn.url) {
              // Check if URL contains variables like {{1}}, {{2}}, etc.
              const urlVariables = btn.url.match(/{{\d+}}/g);
              if (urlVariables && urlVariables.length > 0) {
                // Create button variable for the first variable found
                templateData.value.variables.button = {
                  key: urlVariables[0],
                  value: ''
                };
                console.log('Found button URL variable:', {
                  url: btn.url,
                  variable: urlVariables[0]
                });
              }
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
                
                // Extract variables from slide body text
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
                  console.log('Extracted slide body variables:', {
                    slideIndex: index,
                    text: comp.text,
                    variables: newBodyVar
                  });
                } else {
                  templateData.value.slides[index].variables.body = [];
                }
              } else if (comp.type === 'BUTTONS') {
                templateData.value.slides[index].buttons = comp.buttons || [];
                
                // Check for button variables in slide URLs - SECOND INSTANCE
                comp.buttons.forEach((btn: any) => {
                  if (btn.type === 'url' && btn.url) {
                    // Check if URL contains variables like {{1}}, {{2}}, etc.
                    const urlVariables = btn.url.match(/{{\d+}}/g);
                    if (urlVariables && urlVariables.length > 0) {
                      // Create button variable for the first variable found
                      templateData.value.slides[index].variables.button = {
                        key: urlVariables[0],
                        value: ''
                      };
                      console.log('Found slide button URL variable:', {
                        slideIndex: index,
                        url: btn.url,
                        variable: urlVariables[0]
                      });
                    }
                  }
                  
                  // Check for button text variables in slides - SECOND INSTANCE
                  if (btn.text || btn.title) {
                    const buttonText = btn.text || btn.title || '';
                    const textVariables = buttonText.match(/{{\d+}}/g);
                    if (textVariables && textVariables.length > 0) {
                      // Create button text variable for the first variable found
                      templateData.value.slides[index].variables.buttonText = {
                        key: textVariables[0],
                        value: ''
                      };
                      console.log('Found slide button text variable:', {
                        slideIndex: index,
                        buttonText: buttonText,
                        variable: textVariables[0]
                      });
                    }
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
  
  // Update store with template data immediately using the proper method
  updateStoreFromTemplateData();
  
  // Force reactivity update
  nextTick(() => {
    updateStoreFromTemplateData();
  });
  } catch (error) {
    console.error('Error setting template variable:', error);
  }
};


// Media handling methods
const acceptedFileTypes = (headerType: string) => {
  switch (headerType) {
    case 'video':
      return 'video/*';
    case 'image':
      return 'image/*';
    case 'document':
      return '.pdf,.doc,.docx,.txt';
    default:
      return '*/*';
  }
};

const onUpdateAttachmentLink = () => {
  if (typeof templateData.value.attachment_link === 'string') {
    templateData.value.attachment_link = templateData.value.attachment_link.trim().replace(/ /g, '%20');
  }
  console.log('BroadcastTab - onUpdateAttachmentLink:', {
    attachmentLink: templateData.value.attachment_link,
    templateType: templateData.value.type
  });
  updateStoreFromTemplateData();
};

const uploadMedia = async (event: Event, slideIndex?: number) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  uploadingMedia.value = true;

  try {
    const result = await botsifyApi.uploadFileNew(file);
    
    if (result.success && result.data) {
      if (templateData.value.type === 'generic' && slideIndex !== undefined) {
        templateData.value.slides[slideIndex].attachment_link = result.data.url;
      } else {
        templateData.value.attachment_link = result.data.url;
        // Set filename for document types
        if (templateData.value.type === 'document' && !templateData.value.filename) {
          templateData.value.filename = file.name;
        }
      }
      updateStoreFromTemplateData();
      window.$toast?.success('Media uploaded successfully!');
    } else {
      window.$toast?.error('Upload failed: ' + (result.message || 'Unknown error'));
    }
  } catch (error: any) {
    console.error('Upload failed:', error);
    window.$toast?.error('Upload failed: ' + (error.message || 'Unknown error'));
  } finally {
    uploadingMedia.value = false;
  }
};

const parseCSVFile = (file: File) => {
  console.log('Parsing CSV file:', file.name, 'Type:', file.type, 'Size:', file.size);
  
  if (!file || !(file instanceof File)) {
    console.error('Invalid file object passed to parseCSVFile:', file);
    csvError.value = 'Invalid file object';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const result = csvToArray(text);
      if (result.data.length === 0) {
        csvError.value = 'No valid users found in CSV file';
      } else {
        csvData.value = result;
        uploadedUsers.value = result.data.map((row: any) => {
          // Look for phone number in common column names
          const phoneKey = Object.keys(row).find(key => 
            key.toLowerCase().includes('phone') || 
            key.toLowerCase().includes('mobile') || 
            key.toLowerCase().includes('number')
          );
          const phoneValue = phoneKey ? row[phoneKey] : Object.values(row)[0];
          return { phone_number: phoneValue || '' };
        });
        csvError.value = null;
        console.log('Parsed users:', result);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      csvError.value = 'Failed to parse CSV file';
    }
  };
  
  reader.onerror = (error) => {
    console.error('Error reading file:', error);
    csvError.value = 'Failed to read file';
  };
  
  reader.readAsText(file);
};

const downloadSampleFile = async () => {
  isDownloadingSample.value = true;
  try {
    const response = await fetch('https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/users_120323_1709725833.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch sample file');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sms_users_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download sample file:', error);
    // Fallback: open in new tab
    window.open('https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/users_120323_1709725833.csv', '_blank');
  } finally {
    isDownloadingSample.value = false;
  }
};

// CSV handling methods
const csvToArray = (csv: string): { headers: string[], data: any[] } => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const data = lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',').map(value => value.trim());
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
  return { headers, data };
};

const handleFileUpload = (attachments: any[]) => {
  if (attachments && attachments.length > 0) {
    const file = attachments[0];
    broadcastForm.value.uploadedFile = file;
    
    // Parse CSV file
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      parseCSVFile(file);
    }
  }
};

const getSegmentUsers = () => {
  if (csvData.value.data.length > 0) {
    return csvData.value.data.map((row: any) => {
      // Look for phone number in common column names
      const phoneKey = Object.keys(row).find(key => 
        key.toLowerCase().includes('phone') || 
        key.toLowerCase().includes('mobile') || 
        key.toLowerCase().includes('number')
      );
      const phoneValue = phoneKey ? row[phoneKey] : Object.values(row)[0];
      return { phone: phoneValue || '' };
    });
  }
  return [];
};

// Validation functions
const validateTemplateSelection = (): boolean => {
  if (!selectedTemplate.value) {
    validationErrors.value.template = 'Please select a template';
    return false;
  }
  return true;
};

const validateUserSegment = (): boolean => {
  if (!broadcastForm.value.userSegment) {
    validationErrors.value.userSegment = 'Please select a user segment';
    return false;
  }
  return true;
};

const validatePhoneNumber = (): boolean => {
  if (broadcastForm.value.userSegment === 'single') {
    if (!broadcastForm.value.phoneNumber) {
      validationErrors.value.phoneNumber = 'Phone number is required for single user broadcast';
      return false;
    } else if (!/^\+?[1-9]\d{1,14}$/.test(broadcastForm.value.phoneNumber.replace(/\s/g, ''))) {
      validationErrors.value.phoneNumber = 'Please enter a valid phone number';
      return false;
    }
  }
  return true;
};

const validateFileUpload = (): boolean => {
  if (broadcastForm.value.userSegment === 'upload') {
    if (!broadcastForm.value.uploadedFile && csvData.value.data.length === 0) {
      validationErrors.value.uploadedFile = 'Please upload a CSV or TXT file with phone numbers';
      return false;
    }
  }
  return true;
};

const validateTemplateVariables = (): boolean => {
  if (!selectedTemplate.value) return true;

  // Validate body variables
  if (templateData.value.variables.body.length > 0) {
    templateData.value.variables.body.forEach((variable: any, index: number) => {
      if (!variable.value || variable.value.trim() === '') {
        validationErrors.value.variables[`body_${index}`] = `${variable.key} is required`;
        return false;
      }
    });
  }

  // Validate header variable
  if (templateData.value.variables.header && !templateData.value.variables.header.value) {
    validationErrors.value.variables.header = `${templateData.value.variables.header.key} is required`;
    return false;
  }

  // Validate media header
  if (showMediaHeader.value && !templateData.value.attachment_link) {
    validationErrors.value.mediaHeader = `${templateData.value.type.charAt(0).toUpperCase() + templateData.value.type.slice(1)} link is required`;
    return false;
  }

  // Validate carousel slides
  if (templateData.value.type === 'generic' && templateData.value.slides.length > 0) {
    for (const [slideIndex, slide] of templateData.value.slides.entries()) {
      // Validate slide body variables
      if (slide.variables && slide.variables.body && slide.variables.body.length > 0) {
        for (const [varIndex, variable] of slide.variables.body.entries()) {
          if (!variable.value || variable.value.trim() === '') {
            validationErrors.value.variables[`slide_${slideIndex}_body_${varIndex}`] = `Slide ${slideIndex + 1} - ${variable.key} is required`;
            return false;
          }
        }
      }

      // Validate slide button variable
      if (slide.variables && slide.variables.button && !slide.variables.button.value) {
        validationErrors.value.variables[`slide_${slideIndex}_button`] = `Slide ${slideIndex + 1} - ${slide.variables.button.key} is required`;
        return false;
      }

      // Validate slide attachment
      if (!slide.attachment_link) {
        validationErrors.value.variables[`slide_${slideIndex}_attachment`] = `Slide ${slideIndex + 1} - Media attachment is required`;
        return false;
      }
    }
  }

  return true;
};

const clearValidationErrors = () => {
  validationErrors.value = {
    template: '',
    userSegment: '',
    phoneNumber: '',
    uploadedFile: '',
    variables: {},
    mediaHeader: ''
  };
};

const buildBroadcastPayload = () => {
  return {
    title: `WhatsApp broadcast using template: ${selectedTemplate.value?.template_name || selectedTemplate.value?.name || 'Unknown'}`,
    message: store.block.text || '',
    template: selectedTemplate.value?.id || '',
    user_segment: broadcastForm.value.userSegment,
    users: broadcastForm.value.userSegment === 'single' ? 
           [{ phone_number: broadcastForm.value.phoneNumber }] : 
           broadcastForm.value.userSegment === 'upload' ? 
           getSegmentUsers().map(u => ({ phone_number: u.phone })) :
           broadcastForm.value.userSegment === 'subscribed' ?
           subscribedUsers.value : [],
    template_data: JSON.stringify({
      category: templateData.value.category || 'MARKETING',
      type: templateData.value.type || 'text',
      phone: broadcastForm.value.userSegment === 'single' ? broadcastForm.value.phoneNumber : '',
      header_text: templateData.value.header_text || '',
      body_text: store.block.text || '',
      footer_text: templateData.value.footer_text || '',
      attachment_link: templateData.value.attachment_link || null,
      bodyIncludes: templateData.value.bodyIncludes || ['body'],
      buttons: templateData.value.buttons || [],
      slides: templateData.value.slides || [],
      variables: templateData.value.variables || {
        header: null,
        body: [],
        button: null
      },
      filename: templateData.value.filename || ''
    })
  };
};

// Helper method to check if there are any validation errors
const hasValidationErrors = (): boolean => {
  return Object.values(validationErrors.value).some(error => {
    if (typeof error === 'string') {
      return error && error.trim() !== '';
    } else if (typeof error === 'object') {
      return Object.values(error).some(val => val && val.trim() !== '');
    }
    return false;
  });
};

// Reset broadcast form after successful broadcast
const resetBroadcastForm = () => {
  // Reset form values
  broadcastForm.value = {
    message: '',
    template: '',
    userSegment: '',
    phoneNumber: '',
    mediaType: 'text',
    uploadedFile: null
  };
  
  // Reset template selection
  selectedTemplate.value = null;
  
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
      buttonText: null,
      buttonUrl: null,
      buttons: []
    },
    attachment_link: '',
    filename: '',
    buttons: []
  };
  
  // Reset validation errors
  clearValidationErrors();
  
  // Reset media upload state
  uploadingMedia.value = false;
  
  // Reset CSV data
  csvData.value = { headers: [], data: [] };
  uploadedUsers.value = [];
  csvError.value = null;
  
  // Reset templates to show placeholder again
  templates.value = [];
  isTemplatesLoaded.value = false;
  
  // Reset store template and block
  store.template = { ...templateData.value };
  store.block.text = '';
  store.block.attachment_link = '';
  
  console.log('Broadcast form reset successfully');
};

const validateBroadcast = (): boolean => {
  clearValidationErrors();
  
  const validations = [
    validateTemplateSelection(),
    validateUserSegment(),
    validatePhoneNumber(),
    validateFileUpload(),
    validateTemplateVariables()
  ];
  
  return validations.every(validation => validation);
};

// Initialize templates when component is mounted
// This will be called when the broadcast tab becomes active
const initializeTemplates = () => {
  console.log('BroadcastTab - Initializing templates...');
  
  // Check if templates are already loaded in the store
  if (publishStore.cacheValid.whatsappTemplates && publishStore.cache.whatsappTemplates && publishStore.cache.whatsappTemplates.data && publishStore.cache.whatsappTemplates.data.length > 0) {
    console.log('BroadcastTab - Templates already loaded in store, using cached data');
    const approvedTemplates = publishStore.cache.whatsappTemplates.data.filter((template: any) => template.status === 1);
    templates.value = approvedTemplates.map((template: any) => ({
      ...template,
      label: template.template_name || template.name || template.id || `Template ${template.id}`,
      value: template
    }));
    isTemplatesLoaded.value = true;
    return;
  }
  
  // If not loaded in store, fetch templates immediately
  console.log('BroadcastTab - No cached templates, fetching from API...');
  fetchTemplates();
};

// Auto-initialize templates on mount
onMounted(() => {
  // Add a small delay to ensure component is fully mounted and store is ready
  setTimeout(() => {
    initializeTemplates();
  }, 100);
});

// Watch for store template cache changes to auto-update local templates
watch(() => publishStore.cache.whatsappTemplates, (newCache) => {
  if (newCache && newCache.data && newCache.data.length > 0 && !isTemplatesLoaded.value) {
    console.log('BroadcastTab - Store template cache updated, updating local templates');
    const approvedTemplates = newCache.data.filter((template: any) => template.status === 1);
    templates.value = approvedTemplates.map((template: any) => ({
      ...template,
      label: template.template_name || template.name || template.id || `Template ${template.id}`,
      value: template
    }));
    isTemplatesLoaded.value = true;
  }
}, { deep: true });

// Watch for store loading state changes
watch(() => publishStore.loadingStates.whatsappTemplates, (isLoading) => {
  console.log('BroadcastTab - Store loading state changed:', isLoading);
  if (!isLoading && !isTemplatesLoaded.value && publishStore.cache.whatsappTemplates?.data) {
    console.log('BroadcastTab - Store finished loading, initializing templates');
    initializeTemplates();
  }
});

// Method to update store when variables change
const updateStoreFromTemplateData = () => {
  // Create a complete template object with all necessary data
  const completeTemplate = {
    ...templateData.value,
    // Ensure buttons are properly synced
    buttons: templateData.value.buttons || [],
    // Ensure slides are properly synced with all their data
    slides: templateData.value.slides || [],
    // Ensure all variables are properly synced
    variables: {
      header: templateData.value.variables.header,
      body: templateData.value.variables.body || [],
      button: templateData.value.variables.button,
      buttonText: templateData.value.variables.buttonText,
      buttonUrl: templateData.value.variables.buttonUrl,
      buttons: templateData.value.variables.buttons || []
    },
    // Ensure bodyIncludes is properly synced
    bodyIncludes: templateData.value.bodyIncludes || ['body'],
    // Ensure type and header are properly synced
    type: templateData.value.type || 'text',
    header: templateData.value.header || 'text',
    // Ensure header_text and footer_text are properly synced
    header_text: templateData.value.header_text || '',
    footer_text: templateData.value.footer_text || '',
    body_text: templateData.value.body_text || '',
    // Ensure attachment_link and filename are properly synced
    attachment_link: templateData.value.attachment_link || '',
    filename: templateData.value.filename || ''
  };

  // Update store with complete template data
  store.template = completeTemplate;
  store.block.text = templateData.value.body_text || '';
  store.block.attachment_link = templateData.value.attachment_link || '';
  
  console.log('BroadcastTab - updateStoreFromTemplateData:', {
    templateData: templateData.value,
    completeTemplate: completeTemplate,
    storeTemplate: store.template,
    storeBlock: store.block,
    attachmentLink: templateData.value.attachment_link,
    variables: templateData.value.variables,
    buttons: templateData.value.buttons,
    slides: templateData.value.slides
  });
};

// Add API method for getting subscribed users
const fetchSubscribedUsers = async () => {
  if (isLoadingSubscribedUsers.value) return;
  
  isLoadingSubscribedUsers.value = true;
  try {
    const result = await publishStore.getSegmentUsers('-1', 'wapp');
    if (result.success && result.data) {
      subscribedUsers.value = result.data.map((user: any) => ({
        phone_number: user.phone_number || user.phone || user.phoneNumber
      }));
    }
  } catch (error) {
    console.error('Error fetching subscribed users:', error);
    window.$toast?.error('Failed to fetch subscribed users');
  } finally {
    isLoadingSubscribedUsers.value = false;
  }
};

// Force refresh templates (useful for debugging or manual refresh)
const forceRefreshTemplates = async () => {
  console.log('BroadcastTab - Force refreshing templates...');
  isTemplatesLoaded.value = false;
  templates.value = [];
  await fetchTemplates();
};

// Watch for user segment changes to fetch subscribed users when needed
watch(() => broadcastForm.value.userSegment, (newSegment) => {
  if (newSegment === 'subscribed') {
    fetchSubscribedUsers();
  }
});

// Watch for validation errors to show real-time feedback
watch(validationErrors, (newErrors) => {
  // Clear any existing error messages
  Object.keys(newErrors).forEach(key => {
    const errorValue = newErrors[key as keyof typeof newErrors];
    if (typeof errorValue === 'string' && errorValue) {
      // Show error toast for immediate feedback
      window.$toast?.error(errorValue);
    }
  });
}, { deep: true });

// Expose only necessary methods for parent component
defineExpose({
  initializeTemplates,
  resetBroadcastForm,
  refreshTemplates: fetchTemplates,
  forceRefreshTemplates
});

// Add this method to the script section
const handleSendBroadcast = async () => {
  // Validate all inputs
  if (!validateBroadcast()) {
    // Check if there are any validation errors and show them
    if (hasValidationErrors()) {
      // Show error message to user
      window.$toast?.error('Please fix the validation errors before sending the broadcast');
      
      // Scroll to the first error field
      nextTick(() => {
        const firstErrorElement = document.querySelector('.error-message, [data-error]');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
    return;
  }

  // Show confirmation dialog
  try {
    window.$confirm({
      text: `Are you sure you want to send this broadcast to ${
        broadcastForm.value.userSegment === 'single' ? '1 user' : 
        broadcastForm.value.userSegment === 'upload' ? `${csvData.value.data.length} users` : 
        'your subscribers'
      }?`,
      confirmButtonText: "Yes, Send it!",
    cancelButtonText: "Cancel"
    }, async () => {
      // Set loading state
      isBroadcastSending.value = true;
      
      try {
        // Build and send payload
        const payload = buildBroadcastPayload();
        console.log('Broadcast payload:', payload);
        
        // Call the API to create broadcast task
        const result = await publishStore.createWhatsappBroadcastTask({
          title: payload.title,
          message: payload.message,
          template: payload.template,
          user_segment: payload.user_segment,
          users: payload.users,
          template_data: payload.template_data
        });
        
        if (result.success) {
          window.$toast?.success('Broadcast scheduled successfully!');
          
          // Reset broadcast tab values after successful broadcast
          resetBroadcastForm();
          
          // Revalidate broadcast report cache after successful broadcast
          if (publishStore.cache.broadcastReport) {
            publishStore.cacheValid.broadcastReport = false;
            publishStore.cache.broadcastReport = null;
          }
        } else {
          window.$toast?.error(result.error || 'Failed to schedule broadcast');
        }
      } catch (error) {
        console.error('Failed to send broadcast:', error);
        window.$toast?.error('Failed to schedule broadcast');
      } finally {
        // Reset loading state
        isBroadcastSending.value = false;
      }
    });
  } catch (error) {
    // User cancelled the confirmation
    console.log('Broadcast cancelled by user');
  }
};
</script>

<template>
  <div>
  <div class="broadcast-layout">
    <!-- Main Content -->
    <div class="main-content">
      <h3>Broadcast</h3>
      <p class="subtitle">Send broadcast messages to your audience</p>
      
      <div class="broadcast-form">
        <!-- Message Template -->
        <div class="form-group">
          <label for="broadcast-template">Message template</label>
          <div class="template-selector">
            <VueSelect
              id="broadcast-template"
              v-model="selectedTemplate"
              :options="templates"
              :reduce="(template: any) => template"
              :placeholder="showTemplateMessage || 'Select a template'"
              :loading="isLoadingTemplates"
              :disabled="isLoadingTemplates"
              @change="handleTemplateChange"
              :error="validationErrors.template"
            />
            <div v-if="isLoadingTemplates" class="template-loader">
              <div class="loader-spinner"></div>
              <span>Loading templates...</span>
            </div>
            
            <!-- Template status message -->
            <div v-if="showTemplateMessage && !isLoadingTemplates" class="template-status">
              <small class="status-text">{{ showTemplateMessage }}</small>
              <Button 
                v-if="!isTemplatesLoaded && templates.length === 0" 
                variant="primary-outline" 
                size="small" 
                @click="forceRefreshTemplates"
                class="retry-button"
              >
                Retry
              </Button>
            </div>
          </div>
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
            :error="validationErrors.userSegment"
          />
          
          <!-- Show loading and user count for subscribed users -->
          <div v-if="broadcastForm.userSegment === 'subscribed'" class="subscribed-users-info">
            <div v-if="isLoadingSubscribedUsers" class="loading-indicator">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Loading subscribed users...</span>
            </div>
            <div v-else-if="subscribedUsers.length > 0" class="users-count">
              <i class="pi pi-check-circle"></i>
              <span>{{ subscribedUsers.length }} subscribed users</span>
            </div>
            <div v-else class="no-users">
              <i class="pi pi-exclamation-triangle"></i>
              <span>No subscribed users found</span>
            </div>
          </div>
        </div>
        
        <!-- File Upload (Upload user only) -->
        <div v-if="showFileUpload" class="form-group">
          <label>Upload File (CSV)</label>
         <FileUpload
           v-model="broadcastForm.uploadedFile"
           accept=".csv"
           :emit-raw-file="true"
           :max-size-mb="10"
           text="CSV files only"
           :error="fileUploadError"
           @upload="handleFileUpload"
         />
         
         <small class="help-text">
           Note: Supported formats: .csv<br>
           Sample Files: <a href="#" @click.prevent="downloadSampleFile" :disabled="isDownloadingSample">CSV</a>
           <span v-if="isDownloadingSample" class="ml-2">Downloading...</span>
           <div v-if="uploadedUsers.length > 0" class="users-count">
             <i class="pi pi-check-circle"></i>
             <span>{{ uploadedUsers.length }} users loaded from CSV</span>
           </div>
           <div v-if="csvError" class="csv-error">
             <i class="pi pi-exclamation-triangle"></i>
             <span>{{ csvError }}</span>
           </div>
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
            :error="validationErrors.phoneNumber"
          />
        </div>
      </div>
      
      <!-- Message Editor -->
      <div v-if="showMessageEditor" class="message-editor">
        <h4>Template Variables</h4>
        
        <!-- Body Variables -->
        <div v-if="templateData.variables.body.length > 0" class="variable-section">
          <h5>Body Variables</h5>
          <div class="variable-fields">
            <div v-for="(variable, varIndex) in templateData.variables.body" :key="varIndex" class="form-group">
              <label class="required-label">
                {{ templateData.category === 'AUTHENTICATION' ? 'Authentication Code' : 'Body Variable' }} - {{ variable.key }}
              </label>
              <Input
                v-model="variable.value"
                :placeholder="`Enter value for ${variable.key}`"
                @input="updateStoreFromTemplateData"
                :error="validationErrors.variables[`body_${varIndex}`]"
              />
            </div>
          </div>
        </div>
        
        <!-- Header Variables -->
        <div v-if="templateData.variables.header" class="variable-section">
          <h5>Header Variable</h5>
          <div class="variable-fields">
            <div class="form-group">
              <label class="required-label">Header Variable - {{ templateData.variables.header.key }}</label>
              <Input
                v-model="templateData.variables.header.value"
                placeholder="Enter header variable value"
                @input="updateStoreFromTemplateData"
                :error="validationErrors.variables.header"
              />
            </div>
          </div>
        </div>

        <!-- Media Header Input -->
        <div v-if="showMediaHeader" class="variable-section">
          <h5>Media Header</h5>
          <div class="variable-fields">
            <div class="form-group">
              <div class="media-input-group">
                <label class="required-label">
                  {{ templateData.type.charAt(0).toUpperCase() + templateData.type.slice(1) }} Link
                </label>
                <div class="media-actions">
                  <div class="upload-media" :title="`Upload ${templateData.type}`">
                    <div class="upload-icon">
                      <div v-if="uploadingMedia" class="loader-spinner"></div>
                      <i v-else class="pi pi-paperclip"></i>
                    </div>
                    <input 
                      type="file" 
                      :accept="acceptedFileTypes(templateData.type)" 
                      @change="uploadMedia"
                      :disabled="uploadingMedia"
                      class="file-input-hidden"
                    />
                  </div>
                </div>
              </div>
              <Input
                v-model="templateData.attachment_link"
                :placeholder="`Enter ${templateData.type} link`"
                @input="onUpdateAttachmentLink"
                :error="validationErrors.mediaHeader"
                :disabled="uploadingMedia"
              />
            </div>
            
            <!-- Document filename field -->
            <div v-if="templateData.type === 'document'" class="form-group">
              <label>File Name <small>(optional)</small></label>
              <Input
                v-model="templateData.filename"
                placeholder="Enter file name"
                @input="updateStoreFromTemplateData"
              />
              <small v-if="templateData.filename && templateData.filename.length >= 60" class="text-danger">
                File name must not be more than 60 characters
              </small>
            </div>
          </div>
        </div>

        <!-- Button Variables -->
        <!-- Note: AUTHENTICATION templates don't show button variables since OTP buttons are handled automatically by WhatsApp -->
        <div v-if="templateData.variables.button && templateData.category !== 'AUTHENTICATION'" class="variable-section">
          <h5>Button Variable</h5>
          <div class="variable-fields">
            <div class="form-group">
              <label class="required-label">Button Variable - {{ templateData.variables.button.key }}</label>
                             <Input
                 v-model="templateData.variables.button.value"
                 placeholder="Enter button variable value"
                 @input="updateStoreFromTemplateData"
                 :error="!templateData.variables.button.value ? 'This field is required' : ''"
               />
            </div>
          </div>
        </div>
        
        <!-- Authentication Template Info -->
        <div v-if="templateData.category === 'AUTHENTICATION'" class="variable-section">
          <h5>Authentication Template Info</h5>
          <div class="variable-fields">
            <div class="info-message">
              <i class="pi pi-info-circle"></i>
              <span>OTP buttons are handled automatically by WhatsApp. You only need to provide the verification code variable above.</span>
            </div>
          </div>
        </div>
        
        <!-- Generic Template Slides -->
        <div v-if="templateData.type === 'generic' && templateData.slides.length > 0" class="variable-section">
          <h5>Carousel Slides</h5>
          <div class="slides-container">
            <div v-for="(slide, index) in templateData.slides" :key="index" class="slide-card">
              <h6>Slide {{ index + 1 }}</h6>
              
              <!-- Slide Body Variables -->
              <div v-if="slide.variables.body.length > 0" class="slide-variables">
                <label class="variable-group-label">Body Variables</label>
                <div v-for="(variable, varIndex) in slide.variables.body" :key="varIndex" class="form-group">
                  <label>Body Variable - {{ variable.key }}</label>
                                     <Input
                     v-model="variable.value"
                     placeholder="Enter variable value"
                     @input="updateStoreFromTemplateData"
                     :error="!variable.value ? 'This field is required' : ''"
                   />
                </div>
              </div>

              <!-- Slide Button Variable -->
              <div v-if="slide.variables.button" class="slide-variables">
                <label class="variable-group-label">Button Variable</label>
                <div class="form-group">
                  <label class="required-label">Button Variable - {{ slide.variables.button.key }}</label>
                                     <Input
                     v-model="slide.variables.button.value"
                     placeholder="Enter button variable value"
                     @input="updateStoreFromTemplateData"
                     :error="!slide.variables.button.value ? 'This field is required' : ''"
                   />
                </div>
              </div>

              <!-- Slide Attachment Link -->
              <div class="slide-variables">
                <label class="variable-group-label">Media Link</label>
                <div class="form-group">
                  <div class="media-input-group">
                    <label class="required-label">
                      {{ slide.header.charAt(0).toUpperCase() + slide.header.slice(1) }} Link
                    </label>
                    <div class="media-actions">
                      <div class="upload-media" :title="`Upload ${slide.header}`">
                        <div class="upload-icon">
                          <div v-if="uploadingMedia" class="loader-spinner"></div>
                          <i v-else class="pi pi-paperclip"></i>
                        </div>
                        <input 
                          type="file" 
                          :accept="acceptedFileTypes(slide.header)" 
                          @change="(event) => uploadMedia(event, index)"
                          :disabled="uploadingMedia"
                          class="file-input-hidden"
                        />
                      </div>
                    </div>
                  </div>
                  <Input
                    v-model="slide.attachment_link"
                    :placeholder="`Enter ${slide.header} link`"
                    @input="updateStoreFromTemplateData"
                    :error="!slide.attachment_link ? 'This field is required' : ''"
                    :disabled="uploadingMedia"
                  />
                </div>
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
           :slides="store.template.slides"
         />
       </div>
   </div>
   
   <!-- Action Buttons -->
   <div class="agent-action-buttons">
     <Button
       variant="primary"
       size="medium"
       :loading="isBroadcastSending || isLoadingSubscribedUsers"
       :disabled="isSendButtonDisabled || isBroadcastSending || isLoadingSubscribedUsers"
       @click="handleSendBroadcast"
     >
       {{ isBroadcastSending ? 'Sending...' : isLoadingSubscribedUsers ? 'Loading Users...' : 'Send Message' }}
     </Button>
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

.template-selector {
  position: relative;
}

.template-loader {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.template-status {
  margin-top: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.status-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-style: italic;
}

.retry-button {
  flex-shrink: 0;
  font-size: 0.75rem;
  padding: var(--space-1) var(--space-2);
}

.loader-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.variable-section {
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.variable-section h5 {
  margin: 0 0 var(--space-3) 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.variable-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.slide-variables {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
}

.slide-variables:last-child {
  margin-bottom: 0;
}

.variable-group-label {
  display: block;
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
} 

.text-danger {
  color: var(--color-error);
}

.info-message {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.info-message i {
  color: var(--color-primary);
  margin-top: 2px;
  flex-shrink: 0;
}

.media-input-group {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2);
}

.media-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.upload-media {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
  font-size: 12px;
}

.upload-media:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.upload-media:hover .upload-icon {
  color: var(--color-primary);
}

.file-input-hidden {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-input-hidden:disabled {
  cursor: not-allowed;
}



.upload-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.file-upload-section {
  margin-top: var(--space-2);
}

.csv-preview {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.csv-preview h6 {
  margin: 0 0 var(--space-2) 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.csv-headers {
  margin-bottom: var(--space-2);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.csv-sample {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.csv-row {
  margin-top: var(--space-1);
  padding: var(--space-1);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-family: monospace;
}

.csv-more {
  margin-top: var(--space-1);
  font-style: italic;
  color: var(--color-text-tertiary);
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

.action-buttons {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  justify-content: flex-start;
}

/* Subscribed Users Info Styles */
.subscribed-users-info {
  margin-top: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.loading-indicator i {
  color: var(--color-primary);
}

.users-count {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-success);
  font-size: 0.875rem;
}

.users-count i {
  color: var(--color-success);
}

.no-users {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-warning);
  font-size: 0.875rem;
}

.no-users i {
  color: var(--color-warning);
}

@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
  }
}
</style> 