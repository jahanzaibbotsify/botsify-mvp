<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { Button, Input, VueSelect } from "@/components/ui";
import FileUpload from "@/components/ui/FileUpload.vue";
import MessagePreview from "./Create/MessagePreview.vue";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import { usePublishStore } from "@/stores/publishStore";
import axios from "axios";

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
const mediaFile = ref<File | null>(null);
const mediaUrl = ref('');
const csvData = ref<{ headers: string[], data: any[] }>({ headers: [], data: [] });
const csvFile = ref<File | null>(null);

// Template data
const templates = ref<any[]>([]);
const selectedTemplate = ref<any>(null);
const isLoadingTemplates = ref(false);
const isTemplatesLoaded = ref(false);
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
const showCsvUpload = computed(() => broadcastForm.value.userSegment === 'upload');
const showVariableFields = computed(() => selectedTemplate.value && (
  templateData.value.variables.body.length > 0 ||
  templateData.value.variables.header ||
  templateData.value.variables.button ||
  (templateData.value.type === 'generic' && templateData.value.slides.length > 0)
));
const showMessageEditor = computed(() => {
  return selectedTemplate.value && (
    templateData.value.variables.body.length > 0 ||
    templateData.value.variables.header ||
    templateData.value.variables.button ||
    (templateData.value.type === 'generic' && templateData.value.slides.length > 0)
  );
});

const canSendBroadcast = computed(() => {
  if (!selectedTemplate.value || !broadcastForm.value.userSegment) {
    return false;
  }
  
  // Check if all required variables are filled
  const allVariablesFilled = () => {
    // Check body variables
    if (templateData.value.variables.body.length > 0) {
      const bodyFilled = templateData.value.variables.body.every((variable: any) => variable.value && variable.value.trim() !== '');
      if (!bodyFilled) return false;
    }
    
    // Check header variable
    if (templateData.value.variables.header && !templateData.value.variables.header.value) {
      return false;
    }
    
    // Check media header attachment
    if (showMediaHeader.value && !templateData.value.attachment_link) {
      return false;
    }
    
    // Check button variable
    if (templateData.value.variables.button && !templateData.value.variables.button.value) {
      return false;
    }
    
    // Check carousel slides
    if (templateData.value.type === 'generic' && templateData.value.slides.length > 0) {
      for (const slide of templateData.value.slides) {
        if (slide.variables.body.length > 0) {
          const slideBodyFilled = slide.variables.body.every((variable: any) => variable.value && variable.value.trim() !== '');
          if (!slideBodyFilled) return false;
        }
        if (slide.variables.button && !slide.variables.button.value) {
          return false;
        }
        if (!slide.attachment_link) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Check user segment specific requirements
  if (broadcastForm.value.userSegment === 'single' && !broadcastForm.value.phoneNumber) {
    return false;
  }
  
  if (broadcastForm.value.userSegment === 'upload' && !broadcastForm.value.uploadedFile) {
    return false;
  }
  
  return allVariablesFilled();
});

// Methods
const fetchTemplates = async () => {
  // Prevent multiple simultaneous calls
  if (isLoadingTemplates.value) return;
  
  // If templates are already loaded, use them
  if (isTemplatesLoaded.value && templates.value.length > 0) {
    return;
  }
  
  // Check if templates are already loaded in the store
  if (publishStore.templatesLoaded && publishStore.templatesCache && publishStore.templatesCache.data && publishStore.templatesCache.data.length > 0) {
    templates.value = publishStore.templatesCache.data.map((template: any) => ({
      ...template,
      label: template.template_name || template.name || template.id || `Template ${template.id}`,
      value: template
    }));
    isTemplatesLoaded.value = true;
    return;
  }
  
  isLoadingTemplates.value = true;
  try {
    const result = await publishStore.fetchTemplates();
    if (result.success && result.data && result.data.templates && result.data.templates.data && Array.isArray(result.data.templates.data)) {
      templates.value = result.data.templates.data.map((template: any) => ({
        ...template,
        label: template.template_name || template.name || template.id || `Template ${template.id}`,
        value: template
      }));
      isTemplatesLoaded.value = true;
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
        }
      });
    } else if (templateDataFromData && templateDataFromData.components) {
      // Use data field if available
      console.log('Processing template with data:', templateDataFromData);
      
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
          
          // Check for button variables in URLs
          component.buttons.forEach((btn: any, index: number) => {
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
                
                // Check for button variables in slide URLs
                comp.buttons.forEach((btn: any, btnIndex: number) => {
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
                });
              }
            });
          });
        }
      });
    } else if (currTemplate.components) {
      // Fallback to components parsing if no params
      currTemplate.components.forEach((component: any) => {
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
          component.buttons.forEach((btn: any, index: number) => {
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
                
                // Check for button variables in slide URLs
                comp.buttons.forEach((btn: any, btnIndex: number) => {
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
                });
              }
            });
          });
        }
      });
    }
  }
  
  console.log('Template data after parsing:', templateData.value);
  
  // Update store with template data immediately
  store.template = { ...templateData.value };
  store.block.text = templateData.value.body_text || '';
  
  // Force reactivity update
  nextTick(() => {
    store.template = { ...templateData.value };
    store.block.text = templateData.value.body_text || '';
  });
  } catch (error) {
    console.error('Error setting template variable:', error);
  }
};

const handleFileUpload = (attachments: any[]) => {
  if (attachments && attachments.length > 0) {
    broadcastForm.value.uploadedFile = attachments[0];
  }
};

// Media handling methods
const acceptedFileTypes = (headerType: string) => {
  switch (headerType) {
    case 'video':
      return 'video/mp4';
    case 'image':
      return 'image/*';
    case 'document':
      return '.pdf,.doc,.docx';
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
  const config = {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  };

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post("/upload-sample-file-whatsapp", formData, config);
    
    if (response.data.status === 'success') {
      if (templateData.value.type === 'generic' && slideIndex !== undefined) {
        templateData.value.slides[slideIndex].attachment_link = response.data.file_handle;
      } else {
        templateData.value.attachment_link = response.data.file_handle;
      }
      updateStoreFromTemplateData();
      window.$toast?.success('Media uploaded successfully!');
    }
  } catch (error: any) {
    console.error('Upload failed:', error);
    window.$toast?.error(error.response?.data?.message || 'Upload failed');
  } finally {
    uploadingMedia.value = false;
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

const onCsvFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  csvFile.value = file;
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const text = e.target?.result as string;
    const result = csvToArray(text);
    csvData.value = result;
    broadcastForm.value.uploadedFile = file;
    
    console.log('CSV parsed:', result);
    window.$toast?.success(`CSV uploaded successfully! Found ${result.data.length} users.`);
  };
  
  reader.readAsText(file);
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

const sendBroadcast = () => {
  // Clear previous validation errors
  validationErrors.value = {
    template: '',
    userSegment: '',
    phoneNumber: '',
    uploadedFile: '',
    variables: {},
    mediaHeader: ''
  };

  let hasErrors = false;

  // Validate template selection
  if (!selectedTemplate.value) {
    validationErrors.value.template = 'Please select a template';
    hasErrors = true;
  }

  // Validate user segment
  if (!broadcastForm.value.userSegment) {
    validationErrors.value.userSegment = 'Please select a user segment';
    hasErrors = true;
  }

  // Validate phone number for single user
  if (broadcastForm.value.userSegment === 'single') {
    if (!broadcastForm.value.phoneNumber) {
      validationErrors.value.phoneNumber = 'Phone number is required for single user broadcast';
      hasErrors = true;
    } else if (!/^\+?[1-9]\d{1,14}$/.test(broadcastForm.value.phoneNumber.replace(/\s/g, ''))) {
      validationErrors.value.phoneNumber = 'Please enter a valid phone number';
      hasErrors = true;
    }
  }

  // Validate file upload for upload user
  if (broadcastForm.value.userSegment === 'upload') {
    if (!broadcastForm.value.uploadedFile && csvData.value.data.length === 0) {
      validationErrors.value.uploadedFile = 'Please upload a CSV or TXT file with phone numbers';
      hasErrors = true;
    }
  }

  // Validate template variables
  if (selectedTemplate.value) {
    // Validate body variables
    if (templateData.value.variables.body.length > 0) {
      templateData.value.variables.body.forEach((variable: any, index: number) => {
        if (!variable.value || variable.value.trim() === '') {
          validationErrors.value.variables[`body_${index}`] = `${variable.key} is required`;
          hasErrors = true;
        }
      });
    }

    // Validate header variable
    if (templateData.value.variables.header && !templateData.value.variables.header.value) {
      validationErrors.value.variables.header = `${templateData.value.variables.header.key} is required`;
      hasErrors = true;
    }

    // Validate media header
    if (showMediaHeader.value && !templateData.value.attachment_link) {
      validationErrors.value.mediaHeader = `${templateData.value.type.charAt(0).toUpperCase() + templateData.value.type.slice(1)} link is required`;
      hasErrors = true;
    }

    // Validate carousel slides
    if (templateData.value.type === 'generic' && templateData.value.slides.length > 0) {
      templateData.value.slides.forEach((slide: any, slideIndex: number) => {
        // Validate slide body variables
        if (slide.variables && slide.variables.body && slide.variables.body.length > 0) {
          slide.variables.body.forEach((variable: any, varIndex: number) => {
            if (!variable.value || variable.value.trim() === '') {
              validationErrors.value.variables[`slide_${slideIndex}_body_${varIndex}`] = `Slide ${slideIndex + 1} - ${variable.key} is required`;
              hasErrors = true;
            }
          });
        }

        // Validate slide button variable
        if (slide.variables && slide.variables.button && !slide.variables.button.value) {
          validationErrors.value.variables[`slide_${slideIndex}_button`] = `Slide ${slideIndex + 1} - ${slide.variables.button.key} is required`;
          hasErrors = true;
        }

        // Validate slide attachment
        if (!slide.attachment_link) {
          validationErrors.value.variables[`slide_${slideIndex}_attachment`] = `Slide ${slideIndex + 1} - Media attachment is required`;
          hasErrors = true;
        }
      });
    }
  }

  if (hasErrors) {
    window.$toast?.error('Please fix the validation errors before sending the broadcast');
    return;
  }

  // Prepare the payload in the format expected by the API
  const payload = {
    description: `WhatsApp broadcast using template: ${selectedTemplate.value?.template_name || selectedTemplate.value?.name || 'Unknown'}`,
    fall_back: false,
    response: JSON.stringify({
      template: selectedTemplate.value?.template_name || selectedTemplate.value?.name || '',
      template_data: {
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
        filename: ''
      },
      user_segment: broadcastForm.value.userSegment,
      users: broadcastForm.value.userSegment === 'single' ? [{ phone: broadcastForm.value.phoneNumber }] : 
             broadcastForm.value.userSegment === 'upload' ? getSegmentUsers() : [],
      country_wise: [{
        name: 'Pakistan',
        pricing: '0.0473',
        count: broadcastForm.value.userSegment === 'single' ? 1 : 
               broadcastForm.value.userSegment === 'upload' ? csvData.value.data.length : 0,
        phones: broadcastForm.value.userSegment === 'single' ? [broadcastForm.value.phoneNumber.replace('+', '')] : 
                broadcastForm.value.userSegment === 'upload' ? getSegmentUsers().map(u => u.phone.replace('+', '')) : []
      }]
    }),
    tag: 'whatsapp_broadcast',
    type: 8, // WhatsApp broadcast type
    user_segment: broadcastForm.value.userSegment
  };
  
  console.log('Broadcast payload:', payload);
  
  emit('send-broadcast', payload);
};

// Initialize templates when component is mounted
// This will be called when the broadcast tab becomes active
const initializeTemplates = () => {
  // Add a small delay to ensure component is fully mounted
  nextTick(() => {
    // Check if templates are already loaded in store
    if (publishStore.templatesLoaded && publishStore.templatesCache && publishStore.templatesCache.data && publishStore.templatesCache.data.length > 0) {
      templates.value = publishStore.templatesCache.data.map((template: any) => ({
        ...template,
        label: template.template_name || template.name || template.id || `Template ${template.id}`,
        value: template
      }));
      isTemplatesLoaded.value = true;
      return;
    }
    
    // Only fetch if not already loaded locally
    if (templates.value.length === 0 && !isTemplatesLoaded.value) {
      fetchTemplates();
    }
  });
};

// Don't auto-initialize templates on mount - wait for tab activation
// onMounted(() => {
//   initializeTemplates();
// });

// Watch for template data changes
watch(templateData, (newValue) => {
  // Update store with template data
  store.template = { ...newValue };
  store.block.text = newValue.body_text || '';
}, { deep: true });

// Method to update store when variables change
const updateStoreFromTemplateData = () => {
  store.template = { ...templateData.value };
  store.block.text = templateData.value.body_text || '';
  // Also sync attachment_link to block for MessagePreview
  store.block.attachment_link = templateData.value.attachment_link || '';
  
  console.log('BroadcastTab - updateStoreFromTemplateData:', {
    templateData: templateData.value,
    storeTemplate: store.template,
    storeBlock: store.block,
    attachmentLink: templateData.value.attachment_link,
    variables: templateData.value.variables,
    buttons: templateData.value.buttons
  });
};

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
          <div class="template-selector">
            <VueSelect
              id="broadcast-template"
              v-model="selectedTemplate"
              :options="templates"
              :reduce="(template: any) => template"
              placeholder="Select a template"
              :loading="isLoadingTemplates"
              :disabled="isLoadingTemplates"
              @change="handleTemplateChange"
              :class="{ 'error': validationErrors.template }"
            />
            <div v-if="isLoadingTemplates" class="template-loader">
              <div class="loader-spinner"></div>
              <span>Loading templates...</span>
            </div>
          </div>
          <p v-if="validationErrors.template" class="text-danger">
            <small>{{ validationErrors.template }}</small>
          </p>
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
            :class="{ 'error': validationErrors.userSegment }"
          />
          <p v-if="validationErrors.userSegment" class="text-danger">
            <small>{{ validationErrors.userSegment }}</small>
          </p>
        </div>
        
        <!-- File Upload (Upload user only) -->
        <div v-if="showFileUpload" class="form-group">
          <label>Upload user file</label>
          <div class="file-upload-section">
            <input
              type="file"
              accept=".csv,.txt"
              @change="onCsvFileUpload"
              class="file-input"
              :class="{ 'error': validationErrors.uploadedFile }"
            />
            <small class="help-text">
              Upload a CSV or TXT file containing phone numbers to send messages to.
            </small>
            <p v-if="validationErrors.uploadedFile" class="text-danger">
              <small>{{ validationErrors.uploadedFile }}</small>
            </p>
            <div v-if="csvData.data.length > 0" class="csv-preview">
              <h6>CSV Preview ({{ csvData.data.length }} users)</h6>
              <div class="csv-headers">
                <strong>Headers:</strong> {{ csvData.headers.join(', ') }}
              </div>
              <div class="csv-sample">
                <strong>Sample data:</strong>
                <div v-for="(row, index) in csvData.data.slice(0, 3)" :key="index" class="csv-row">
                  {{ Object.values(row).join(', ') }}
                </div>
                <div v-if="csvData.data.length > 3" class="csv-more">
                  ... and {{ csvData.data.length - 3 }} more rows
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Phone Number (Single user only) -->
        <div v-if="showPhoneNumber" class="form-group">
          <label for="broadcast-phone">Phone number</label>
          <Input
            id="broadcast-phone"
            v-model="broadcastForm.phoneNumber"
            type="tel"
            placeholder="Enter phone number"
            :error-text="validationErrors.phoneNumber"
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
                :error-text="validationErrors.variables[`body_${varIndex}`]"
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
                :error-text="validationErrors.variables.header"
              />
            </div>
          </div>
        </div>

        <!-- Media Header Input -->
        <div v-if="showMediaHeader" class="variable-section">
          <h5>Media Header</h5>
          <div class="variable-fields">
            <div class="form-group">
              <label class="required-label">
                {{ templateData.type.charAt(0).toUpperCase() + templateData.type.slice(1) }} Link
              </label>
              <Input
                v-model="templateData.attachment_link"
                :placeholder="`Enter ${templateData.type} link`"
                @input="onUpdateAttachmentLink"
                :error-text="validationErrors.mediaHeader"
              />
            </div>
            
            <div class="form-group">
              <label>Or Upload File</label>
              <input
                type="file"
                :accept="acceptedFileTypes(templateData.type)"
                @change="uploadMedia"
                :disabled="uploadingMedia"
                class="file-input"
              />
              <div v-if="uploadingMedia" class="upload-status">
                <div class="loader-spinner"></div>
                <span>Uploading media...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Button Variables -->
        <div v-if="templateData.variables.button && templateData.category !== 'AUTHENTICATION'" class="variable-section">
          <h5>Button Variable</h5>
          <div class="variable-fields">
            <div class="form-group">
              <label class="required-label">URL Button Variable - {{ templateData.variables.button.key }}</label>
                             <Input
                 v-model="templateData.variables.button.value"
                 placeholder="Enter button variable value"
                 @input="updateStoreFromTemplateData"
               />
              <p class="text-danger" v-if="!templateData.variables.button.value">
                <small>This field is required</small>
              </p>
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
                   />
                  <p class="text-danger" v-if="!variable.value">
                    <small>This field is required</small>
                  </p>
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
                   />
                  <p class="text-danger" v-if="!slide.variables.button.value">
                    <small>This field is required</small>
                  </p>
                </div>
              </div>

              <!-- Slide Attachment Link -->
              <div class="slide-variables">
                <label class="variable-group-label">Media Link</label>
                <div class="form-group">
                  <label class="required-label">
                    {{ slide.header.charAt(0).toUpperCase() + slide.header.slice(1) }} Link
                  </label>
                                     <Input
                     v-model="slide.attachment_link"
                     :placeholder="`Enter ${slide.header} link`"
                     @input="updateStoreFromTemplateData"
                   />
                  <p class="text-danger" v-if="!slide.attachment_link">
                    <small>This field is required</small>
                  </p>
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
  margin-top: var(--space-1);
}

.text-danger small {
  font-size: 0.75rem;
}

.error {
  border-color: var(--color-error) !important;
}

.error:focus {
  border-color: var(--color-error) !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.file-input {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  font-size: 0.875rem;
}

.file-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.send-button-section {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.send-button {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: 1rem;
  font-weight: 600;
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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