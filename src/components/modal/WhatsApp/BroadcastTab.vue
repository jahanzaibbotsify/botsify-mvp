<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { Input, VueSelect, Button } from "@/components/ui";
import FileUpload from "@/components/ui/FileUpload.vue";
import MessagePreview from "./Create/MessagePreview.vue";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import { usePublishStore } from "@/stores/publishStore";
import { botsifyApi } from "@/services/botsifyApi";
import { useBroadcast } from "@/composables/useBroadcast";

// Props
interface Props {
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Broadcast sending state
const isBroadcastSending = ref(false);

const { parseCSVFile, downloadSampleFile, csvError, uploadedUsers, isDownloadingSample } = useBroadcast();

// Stores
const store = useWhatsAppTemplateStore();
const publishStore = usePublishStore();

const whatsappTemplates = computed(() => publishStore.whatsappTemplates.data);
const whatsappTemplatesLoading = computed(() => publishStore.whatsappTemplates.loading);

const subscribedUsers = computed(() => publishStore.whatsappSegmentUsers.data?.data);
const subscribedUsersLoading = computed(() => publishStore.whatsappSegmentUsers.loading);

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

// CSV handling variables
// const csvFile = ref<File | null>(null);
const csvData = ref<{ headers: string[], data: any[] }>({ headers: [], data: [] });


const fileUploadError = computed(() => {
  if (broadcastForm.value.userSegment === 'upload' && !broadcastForm.value.uploadedFile && uploadedUsers.value.length === 0) {
    return 'File upload is required for upload user broadcast';
  }
  if (broadcastForm.value.userSegment === 'upload' && uploadedUsers.value.length === 0 && csvError.value) {
    return 'No valid users found in uploaded file';
  }
  return undefined;
});
// Template data
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

// Message templates
const messageTemplates = ref<Array<{value: string, label: string}>>([]);

// User segments
const userSegments = [
  { value: '', label: 'Select user segment' },
  { value: '-1', label: 'All users' },
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
  
  return result;
});

const showMessageEditor = computed(() => {
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
  console.log(publishStore.whatsappSegmentUsers.data, "..............")
  return hasValidationErrors() || 
         !broadcastForm.value.userSegment ||
         (broadcastForm.value.userSegment === 'single' && !broadcastForm.value.phoneNumber) ||
         (broadcastForm.value.userSegment === 'upload' && uploadedUsers.value.length === 0) ||
         (broadcastForm.value.userSegment === '-1' && subscribedUsers.value?.length === 0);
});

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
      buttonText: null,
      buttonUrl: null,
      buttons: []
    },
    attachment_link: '',
    filename: '',
    buttons: []
  };

  const currTemplate = selectedTemplate.value;
  
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

  // Parse data if it exists
  let templateDataFromData = null;
  if (currTemplate.data) {
    try {
      templateDataFromData = typeof currTemplate.data === 'string' ? JSON.parse(currTemplate.data) : currTemplate.data;
    } catch (e) {
      console.warn('Failed to parse template data:', e);
      templateDataFromData = null;
    }
  }
  
  // Set template name and category
  templateData.value.name = currTemplate.template_name || currTemplate.name || '';
  templateData.value.category = currTemplate.category || 'MARKETING';
  if (templateDataFromData.category === 'AUTHENTICATION') {
    // Parse and assign params for AUTHENTICATION category
    templateData.value.category = 'AUTHENTICATION';
    // Find the body parameter and use its text
    templateData.value.body_text = "{{1}} is your verification code. For security do not share this code.";
    templateData.value.footer_text = "This code will expire in 1 minutes.";
  
    templateDataFromData.components.forEach((component: any) => {
      if(component.type === 'BUTTONS'){
        templateData.value.bodyIncludes.push('buttons');
        component.buttons.forEach((button: any) => {
          (templateData.value.buttons as any[]).push(button)
        })
      }
    })
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
              key: '{{1}}',
              value: variable.text
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
    });
  
    templateData.value.variables.body = newBodyVar;
    // Get buttons from components if available
    if (currTemplate.components && currTemplate.components[1] && currTemplate.components[1].buttons) {
      templateData.value.buttons = currTemplate.components[1].buttons;
    }
  } else {
    // Handle other template types - First check if we have params
    if (params && params.length > 0) {
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

// Validation functions
const validateTemplateSelection = (): boolean => {
  if (!selectedTemplate.value) {
    validationErrors.value.template = 'Please select a template';
    return false;
  }
  validationErrors.value.template = '';
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
  validationErrors.value.phoneNumber = '';
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
           uploadedUsers.value :
           broadcastForm.value.userSegment === '-1' ?
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
  
  
  // Reset store template and block
  store.template = { ...templateData.value };
  store.block.text = '';
  store.block.attachment_link = '';
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

  // Clear any errors that have been resolved due to this update
  clearResolvedErrors();
};

// Clear resolved validation errors as fields become valid
const clearResolvedErrors = () => {
  // Template selection
  if (selectedTemplate.value) {
    validationErrors.value.template = '';
  }

  // User segment
  if (broadcastForm.value.userSegment) {
    validationErrors.value.userSegment = '';
  }

  // Phone number (only for single user)
  if (broadcastForm.value.userSegment === 'single') {
    const phone = (broadcastForm.value.phoneNumber || '').replace(/\s/g, '');
    if (/^\+?[1-9]\d{1,14}$/.test(phone)) {
      validationErrors.value.phoneNumber = '';
    }
  } else {
    validationErrors.value.phoneNumber = '';
  }

  // File upload (only for upload segment)
  if (broadcastForm.value.userSegment !== 'upload') {
    validationErrors.value.uploadedFile = '';
  } else if (
    !!broadcastForm.value.uploadedFile ||
    (Array.isArray(csvData.value.data) && csvData.value.data.length > 0) ||
    (Array.isArray(uploadedUsers.value) && uploadedUsers.value.length > 0)
  ) {
    validationErrors.value.uploadedFile = '';
  }

  // Template variables - body
  if (templateData.value.variables.body && templateData.value.variables.body.length > 0) {
    templateData.value.variables.body.forEach((variable: any, index: number) => {
      if (variable && typeof variable.value === 'string' && variable.value.trim() !== '') {
        validationErrors.value.variables[`body_${index}`] = '';
      }
    });
  }

  // Template variables - header
  if (
    templateData.value.variables.header &&
    typeof templateData.value.variables.header.value === 'string' &&
    templateData.value.variables.header.value.trim() !== ''
  ) {
    validationErrors.value.variables.header = '';
  }

  // Media header
  if (!showMediaHeader.value || (templateData.value.attachment_link && templateData.value.attachment_link !== '')) {
    validationErrors.value.mediaHeader = '';
  }

  // Generic slides validations
  if (templateData.value.type === 'generic' && Array.isArray(templateData.value.slides)) {
    templateData.value.slides.forEach((slide: any, slideIndex: number) => {
      if (slide?.variables?.body && slide.variables.body.length > 0) {
        slide.variables.body.forEach((variable: any, varIndex: number) => {
          if (variable && typeof variable.value === 'string' && variable.value.trim() !== '') {
            validationErrors.value.variables[`slide_${slideIndex}_body_${varIndex}`] = '';
          }
        });
      }

      if (slide?.variables?.button && typeof slide.variables.button.value === 'string' && slide.variables.button.value.trim() !== '') {
        validationErrors.value.variables[`slide_${slideIndex}_button`] = '';
      }

      if (slide?.attachment_link) {
        validationErrors.value.variables[`slide_${slideIndex}_attachment`] = '';
      }
    });
  }
};

// Additional reactive listeners to clear errors when inputs change
watch(() => broadcastForm.value.phoneNumber, () => {
  clearResolvedErrors();
});

watch(selectedTemplate, () => {
  clearResolvedErrors();
});

watch(() => broadcastForm.value.uploadedFile, () => {
  clearResolvedErrors();
});

watch(uploadedUsers, () => {
  clearResolvedErrors();
});

watch(csvError, () => {
  clearResolvedErrors();
});

// Add this method to the script section
const handleSendBroadcast = async () => {
  // Validate all inputs
  if (!validateBroadcast()) {
    // Check if there are any validation errors and show them
    if (hasValidationErrors()) {
      // Show error message to user
      // window.$toast?.error('Please fix the validation errors before sending the broadcast');
      
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
          window.$toast?.success('Broadcast send successfully!');
          
          // Reset broadcast tab values after successful broadcast
          resetBroadcastForm();
        } else {
          window.$toast?.error(result.error || 'Failed to send broadcast');
        }
      } catch (error) {
        console.error('Failed to send broadcast:', error);
        window.$toast?.error('Failed to send broadcast');
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

watch(() => broadcastForm.value.uploadedFile, (newFile) => {
  if (newFile && newFile instanceof File) {
    csvError.value = null; // Clear any previous errors
    parseCSVFile(newFile);
  } else {
    uploadedUsers.value = [];
    csvError.value = null;
  }
});

watch(() => broadcastForm.value.userSegment, (newSegment) => {
  if (newSegment === '-1') {
    publishStore.whatsappSegmentUsers.load();
  }
  // Clear any segment-related errors immediately on change
  clearResolvedErrors();
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



// Auto-initialize templates on mount
onMounted(async () => {
  await publishStore.whatsappTemplates.load(1, 20, '');
  
  const approvedTemplates = whatsappTemplates.value?.data.templates.data.filter((template: any) => template.status == 1);
  messageTemplates.value = approvedTemplates.map((template: any) => ({
    value: template,
    label: template.name
  }));
});

</script>

<template>
  <div>
    <div v-if="whatsappTemplatesLoading" class="loading-state">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <span>Loading broadcast data...</span>
      </div>
    </div>
  <div  v-else  class="broadcast-layout">
    <!-- Main Content -->
    <!-- Loading State -->

    <div class="main-content">
      <h3>Broadcast</h3>
      <p class="subtitle">Send broadcast messages to your audience</p>

      
      <div class="broadcast-form">
        <!-- Message Template -->
        <div class="form-group">
          <VueSelect
              label="Message template"
              v-model="selectedTemplate"
              @change="handleTemplateChange"
              :options="messageTemplates"
              placeholder="Select a template"
              :error="validationErrors.template"
            />
        </div>
        
        <!-- User Segment -->
        <div class="form-group">
          <VueSelect
            label="User segment"
            id="broadcast-segment"
            v-model="broadcastForm.userSegment"
            :options="userSegments"
            :reduce="(segment: any) => segment.value"
            placeholder="Select user segment"
            :error="validationErrors.userSegment"
          />
          
          <!-- Show loading and user count for subscribed users -->
          <div v-if="broadcastForm.userSegment === '-1'" class="subscribed-users-info">
            <div v-if="subscribedUsersLoading" class="loading-indicator">
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
         <FileUpload
           label="Upload File (CSV)"
           v-model="broadcastForm.uploadedFile"
           accept=".csv"
           :emit-raw-file="true"
           :max-size-mb="10"
           text="CSV files only"
           :error="fileUploadError"
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
          <Input
            label="Phone number"
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
              <Input
                :label="templateData.category === 'AUTHENTICATION' ? 'Authentication Code' : 'Body Variable' + ' - ' + variable.key"
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
              <Input
                :label="`Header Variable - ${templateData.variables.header.key}`"
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
              <Input
                label="File Name (optional)"
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
              <Input
                :label="`Button Variable - ${templateData.variables.button.key}`"
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
                  <Input
                    :label="`Body Variable - ${variable.key}`"
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
                  <Input
                    :label="`Button Variable - ${slide.variables.button.key}`"
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
        :loading="isBroadcastSending"
        :disabled="isSendButtonDisabled || isBroadcastSending"
        @click="handleSendBroadcast"
      >
        Send Message
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

.broadcast-form {
  margin-top: 20px;
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



.variable-fields {
  margin-top: var(--space-6);
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

.loader-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-primary);
  border-top-color: transparent;
  border-radius: 50%;
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
  color: var(--color-error);
  font-size: 0.875rem;
}

.no-users i {
  color: var(--color-error);
}


</style> 