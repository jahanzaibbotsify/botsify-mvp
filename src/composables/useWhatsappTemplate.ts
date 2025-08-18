import { ref } from 'vue';

export function useWhatsAppTemplate() {
  const selectedPreviewTemplate = ref<any>(null);
  const previewTemplateData = ref<any>(null);
  const previewModalRef = ref<any>(null);

  /**
   * Clone a template
   */
  const cloneTemplate = async (template: any, emit: Function) => {
    window.$confirm(
      {
        text: "Are you sure you want to clone this template?",
        confirmButtonText: "Clone",
        cancelButtonText: "Cancel",
      },
      async () => {
        try {
          const processedTemplate = processTemplateForClone(template);

          emit('close-whatsapp-modal');
          emit('open-create-modal', processedTemplate);

          window.$toast?.success('Template cloned successfully!');
        } catch (error) {
          console.error('Failed to clone template:', error);
          window.$toast?.error('Failed to clone template');
        }
      }
    );
  };

  /**
   * Process template for preview (moved your long function here)
   */
  const processTemplateForPreview = (template: any) => {
    // Parse the template data if it's a string
    let templateData = null;
    if (template.data) {
      try {
        templateData = typeof template.data === 'string' ? JSON.parse(template.data) : template.data;
      } catch (e) {
        console.warn('Failed to parse template data:', e);
        templateData = null;
      }
    }
  
    // Parse params if they exist
    let params = [];
    if (template.params) {
      try {
        params = typeof template.params === 'string' ? JSON.parse(template.params) : template.params;
      } catch (e) {
        console.warn('Failed to parse template params:', e);
        params = [];
      }
    }
  
    // Create template data structure for MessagePreview
    const processedTemplate = {
      name: template.template_name || template.name || '',
      category: template.category || 'MARKETING',
      type: 'text',
      isGenericType: false, // Add this property
      bodyIncludes: [] as string[],
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
      buttons: [] as any[]
    };
  
    // Process template data from components
    if (templateData && templateData.components) {
      templateData.components.forEach((component: any) => {
        if (component.type === 'HEADER') {
          processedTemplate.bodyIncludes.push('header');
          const componentType = component.format ? component.format.toLowerCase() : 'text';
          processedTemplate.type = componentType;
          processedTemplate.header = componentType;
          
          if (componentType === 'text') {
            processedTemplate.header_text = component.text || '';
            
            // Extract variables from header text
            const result = component.text ? component.text.match(/{{\d+}}/g) : null;
            if (result && result.length > 0) {
              processedTemplate.variables.header = {
                key: result[0],
                value: ''
              };
            } else {
              processedTemplate.variables.header = null;
            }
          } else {
            processedTemplate.variables.header = null;
            processedTemplate.header_text = '';
          }
        }
  
        if (component.type === 'BODY') {
          processedTemplate.bodyIncludes.push('body');
          processedTemplate.body_text = component.text || '';
          
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
  
            processedTemplate.variables.body = newBodyVar;
          } else {
            processedTemplate.variables.body = [];
          }
        }
  
        if (component.type === 'FOOTER') {
          processedTemplate.bodyIncludes.push('footer');
          processedTemplate.footer_text = component.text || '';
        }
  
        if (component.type === 'BUTTONS') {
          processedTemplate.bodyIncludes.push('buttons');
          
          // Extract buttons from the component
          if (component.buttons && Array.isArray(component.buttons)) {
            processedTemplate.buttons = component.buttons.map((btn: any) => {
              // Convert WhatsApp button format to MessagePreview format
                           const convertedButton = {
                 text: btn.text || '',
                 title: btn.text || '',
                 type: btn.type === 'QUICK_REPLY' ? 'postback' : 
                       btn.type === 'URL' ? 'web_url' : 
                       btn.type === 'PHONE_NUMBER' ? 'phone_number' : 'postback',
                 url: btn.url || '',
                 value: btn.text || '',
                 phone_number: btn.phone_number || '' // Preserve phone number for phone_number buttons
               };
              
              // Check if button text contains variables
              if (btn.text && btn.text.includes('{{')) {
                const variables = btn.text.match(/{{(\d+)}}/g);
                if (variables && variables.length > 0) {
                  processedTemplate.variables.buttonText = {
                    key: variables[0],
                    value: ''
                  };
                }
              }
              
              // Check if button URL contains variables
              if (btn.url && btn.url.includes('{{')) {
                const variables = btn.url.match(/{{(\d+)}}/g);
                if (variables && variables.length > 0) {
                  processedTemplate.variables.buttonUrl = {
                    key: variables[0],
                    value: ''
                  };
                }
              }
              
              return convertedButton;
            });
          }
        }
  
               if (component.type === 'CAROUSEL' && component.cards?.length) {
           processedTemplate.type = 'generic';
           processedTemplate.isGenericType = true; // Add this flag for MessagePreview
           processedTemplate.bodyIncludes = ['body']; // Reset to only body for carousel
          
          // Process carousel slides
          component.cards.forEach((card: any, index: number) => {
            const slide = {
              id: index + 1,
              title: '',
              subtitle: '',
              type: 'button',
              image_url: '',
              attachment_link: '',
              buttons: [] as any[],
              variables: {
                body: [] as any[],
                button: null as any,
                buttonText: null as any,
                buttonUrl: null as any
              }
            };
  
            let headerFormat = 'image'; // default
  
            card.components.forEach((cardComponent: any) => {
              if (cardComponent.type === 'HEADER' && cardComponent.example?.header_handle?.[0]) {
                headerFormat = cardComponent.format.toLowerCase();
                slide.attachment_link = cardComponent.example.header_handle[0];
              }
              if (cardComponent.type === 'BODY') {
                slide.title = cardComponent.text;
                
                // Extract variables from body text
                const result = cardComponent.text ? cardComponent.text.match(/{{\d+}}/g) : null;
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
                  slide.variables.body = newBodyVar;
                }
              }
                           if (cardComponent.type === 'BUTTONS') {
                 slide.buttons = cardComponent.buttons.map((btn: any) => {
                   const convertedButton = {
                     api: 1,
                     error: false,
                     payload: btn.payload || '',
                     response: '',
                     signature_hash: '',
                     title: btn.text || btn.title || '',
                     text: btn.text || btn.title || '', // Add text property for MessagePreview
                     type: btn.type === 'url' ? 'web_url' : 
                           btn.type === 'phone_number' ? 'phone_number' : 'postback',
                     url: btn.url || '',
                     phone_number: btn.phone_number || '' // Preserve phone number for phone_number buttons
                   };
                  
                  // Check if button text contains variables
                  if (btn.text && btn.text.includes('{{')) {
                    const variables = btn.text.match(/{{(\d+)}}/g);
                    if (variables && variables.length > 0) {
                      slide.variables.buttonText = {
                        key: variables[0],
                        value: ''
                      };
                    }
                  }
                  
                                 // Check if button URL contains variables
                 if (btn.url && btn.url.includes('{{')) {
                   const variables = btn.url.match(/{{(\d+)}}/g);
                   if (variables && variables.length > 0) {
                     slide.variables.buttonUrl = {
                       key: variables[0],
                       value: ''
                     };
                     // Also set button variable for URL (MessagePreview looks for this)
                     slide.variables.button = {
                       key: variables[0],
                       value: ''
                     };
                   }
                 }
                  
                  return convertedButton;
                });
              }
            });
  
            const templateSlide = {
              header: headerFormat,
              button_type: 'cta',
              total_buttons: slide.buttons.length,
              variables: slide.variables
            };
  
            // Add the slide data to the processed template
            processedTemplate.slides.push({
              ...templateSlide,
              title: slide.title,
              subtitle: slide.subtitle,
              attachment_link: slide.attachment_link,
              buttons: slide.buttons
            });
          });
        }
      });
    }
  
    // Process params if no components data
    if (params && params.length > 0 && !templateData) {
      params.forEach((param: any) => {
        if (param.type === 'body') {
          processedTemplate.bodyIncludes.push('body');
          processedTemplate.body_text = param.parameters[0]?.text || '';
          
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
          processedTemplate.variables.body = newBodyVar;
        }
  
        if (param.type === 'button') {
          processedTemplate.bodyIncludes.push('buttons');
          
          // Create a default button structure for params-based templates
          const defaultButton = {
            text: '',
            title: '',
            type: 'postback',
            url: '',
            value: ''
          };
          
          param.parameters.forEach((variable: any) => {
            if (variable.type === 'text') {
              processedTemplate.variables.buttonText = {
                key: variable.text || '{{1}}',
                value: ''
              };
              
              // Set the button text
              defaultButton.text = variable.text || '';
              defaultButton.title = variable.text || '';
              defaultButton.value = variable.text || '';
            }
          });
          
          // Add the button to the buttons array
          processedTemplate.buttons = [defaultButton];
        }
  
               if (param.type === 'carousel') {
           processedTemplate.type = 'generic';
           processedTemplate.isGenericType = true; // Add this flag for MessagePreview
           processedTemplate.bodyIncludes = ['body'];
          
          // Process carousel slides from params
          if (param.parameters && Array.isArray(param.parameters)) {
            param.parameters.forEach((slideParam: any, index: number) => {
                           const templateSlide = {
                 header: 'image',
                 button_type: 'cta',
                 total_buttons: 1,
                 title: slideParam.text || `Slide ${index + 1}`,
                 buttons: [{
                   title: 'Button',
                   text: 'Button',
                   type: 'postback',
                   url: '',
                   payload: ''
                 }],
                 variables: {
                   body: [] as any[],
                   button: null as any,
                   buttonText: null as any,
                   buttonUrl: null as any
                 }
               };
  
              // Extract variables from slide parameters
              if (slideParam.type === 'text') {
                templateSlide.variables.body.push({
                  key: slideParam.text || `{{${index + 1}}}`,
                  value: ''
                });
              }
  
              processedTemplate.slides.push(templateSlide);
            });
          }
        }
      });
    }
  
    return processedTemplate;
  };

  /**
   * Preview a template
   */
  const previewTemplate = (template: any) => {
    const processedTemplate = processTemplateForPreview(template);

    selectedPreviewTemplate.value = template;
    previewTemplateData.value = processedTemplate;

    previewModalRef.value?.openModal();
  };

    
const processTemplateForClone = (template: any) => {
    // Parse the template data if it's a string
    let templateData = null;
    if (template.data) {
      try {
        templateData = typeof template.data === 'string' ? JSON.parse(template.data) : template.data;
      } catch (e) {
        console.warn('Failed to parse template data:', e);
        templateData = null;
      }
    }
  
    // Parse params if they exist
    let params = [];
    if (template.params) {
      try {
        params = typeof template.params === 'string' ? JSON.parse(template.params) : template.params;
      } catch (e) {
        console.warn('Failed to parse template params:', e);
        params = [];
      }
    }
  
       // Create template data structure for cloning
     const clonedTemplate = {
       name: `${template.template_name || template.name || 'Template'} (Cloned)`,
       category: templateData?.category || 'MARKETING',
       type: 'text', // Default type, will be updated based on components
       bodyIncludes: [] as string[],
       header: 'text',
       header_text: '',
       footer_text: '',
       body_text: '', // Add body_text property
       slides: [] as any[],
       button_type: 'postback',
       total_buttons: 3,
       variables: {
         header: null as any,
         body: [] as any[],
         button: null as any
       }
     };
  
    const clonedBlock = {
      language: template.language || 'en',
      text: '',
      image_url: '',
      video_url: '',
      attachment_link: '',
      buttons: [] as any[],
      slides: [] as any[]
    };
  
    // Process template data from components
    if (templateData && templateData.components) {
      templateData.components.forEach((component: any) => {
        if (component.type === 'HEADER') {
          clonedTemplate.bodyIncludes.push('header');
          const componentType = component.format ? component.format.toLowerCase() : 'text';
          clonedTemplate.type = componentType === 'button' ? 'media' : componentType;
          clonedTemplate.header = componentType;
          
          if (componentType === 'text') {
            clonedTemplate.header_text = component.text || '';
            
            // Extract variables from header text
            const result = component.text ? component.text.match(/{{\d+}}/g) : null;
            if (result && result.length > 0) {
              clonedTemplate.variables.header = {
                key: result[0],
                value: ''
              };
            } else {
              clonedTemplate.variables.header = null;
            }
          } else {
            clonedTemplate.variables.header = null;
            clonedTemplate.header_text = '';
            
            // Handle media header
            if (component.example?.header_handle?.[0]) {
              clonedBlock.attachment_link = component.example.header_handle[0];
            }
          }
        }
  
        if (component.type === 'BODY') {
          clonedTemplate.bodyIncludes.push('body');
          clonedBlock.text = component.text || '';
          
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
  
            clonedTemplate.variables.body = newBodyVar;
          } else {
            clonedTemplate.variables.body = [];
          }
        }
  
        if (component.type === 'FOOTER') {
          clonedTemplate.bodyIncludes.push('footer');
          clonedTemplate.footer_text = component.text || '';
        }
  
        if (component.type === 'BUTTONS') {
          clonedTemplate.bodyIncludes.push('buttons');
          // Extract buttons from the component
          if (component.buttons && Array.isArray(component.buttons)) {
            clonedBlock.buttons = component.buttons.map((btn: any) => ({
               api: 1,
               error: false,
               type: btn.type === 'QUICK_REPLY' ? 'postback' : 
                     btn.type === 'URL' ? 'web_url' : 
                     btn.type === 'PHONE_NUMBER' ? 'phone_number' : 'postback',
               title: btn.text || btn.title || '',
               text: btn.text || btn.title || '',
               url: btn.url || '',
               payload: btn.payload || btn.phone_number || '',
               response: btn.response,
             }));
          }
        }
  
        if (component.type === 'CAROUSEL' && component.cards?.length) {
           clonedTemplate.type = 'generic';
           clonedTemplate.bodyIncludes = ['body'];
           clonedTemplate.body_text = clonedBlock.text; // Preserve the main body text
          
           clonedBlock.slides = [];
           clonedTemplate.slides = [];
  
          component.cards.forEach((card: any, index: number) => {
            const slide = {
              id: index + 1,
              title: '',
              subtitle: '',
              type: 'button',
              image_url: '',
              attachment_link: '',
              buttons: [] as any[]
            };
  
            let headerFormat = 'image'; // default
  
            card.components.forEach((cardComponent: any) => {
              if (cardComponent.type === 'HEADER' && cardComponent.example?.header_handle?.[0]) {
                headerFormat = cardComponent.format.toLowerCase();
                slide.attachment_link = cardComponent.example.header_handle[0];
              }
              if (cardComponent.type === 'BODY') {
                slide.title = cardComponent.text;
              }
                           if (cardComponent.type === 'BUTTONS') {
                 slide.buttons = cardComponent.buttons.map((btn: any) => {
                   const convertedButton = {
                     api: 1,
                     error: false,
                     payload: btn.payload || btn.phone_number || '',
                     response: btn.response || '',
                     signature_hash: '',
                     title: btn.text || btn.title || '',
                     text: btn.text || btn.title || '', // Add text property for consistency
                     type: btn.type === 'url' ? 'web_url' : 
                           btn.type === 'phone_number' ? 'phone_number' : 'postback',
                     url: btn.url || '',
                   };
                   return convertedButton;
                 });
               }
            });
  
                       const templateSlide = {
               header: headerFormat,
               button_type: 'cta',
               total_buttons: slide.buttons.length,
               title: slide.title,
               subtitle: slide.subtitle,
               attachment_link: slide.attachment_link,
               buttons: slide.buttons,
               variables: {
                 body: [],
                 button: null,
                 buttonText: null,
                 buttonUrl: null
               }
             };
  
             clonedBlock.slides.push(slide);
             clonedTemplate.slides.push(templateSlide);
          });
        }
      });
    }
  
    // Process params if no components data
    if (params && params.length > 0 && !templateData) {
      params.forEach((param: any) => {
        if (param.type === 'body') {
          clonedTemplate.bodyIncludes.push('body');
          clonedBlock.text = param.parameters[0]?.text || '';
          
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
          clonedTemplate.variables.body = newBodyVar;
        }
  
        if (param.type === 'button') {
          clonedTemplate.bodyIncludes.push('buttons');
          
          // Create a default button structure for params-based templates
          const defaultButton = {
            text: '',
            title: '',
            type: 'postback',
            url: '',
            value: '',
            response: '',
            payload: ''
          };
          
          param.parameters.forEach((variable: any) => {
            if (variable.type === 'text') {
              clonedTemplate.variables.button = {
                key: variable.text || '{{1}}',
                value: ''
              };
              
              // Set the button text
              defaultButton.text = variable.text || '';
              defaultButton.title = variable.text || '';
              defaultButton.value = variable.text || '';
            }
          });
          
          // Add the button to the buttons array
          clonedBlock.buttons = [defaultButton];
        }
      });
    }
  
    // Handle authentication template special case
    if (clonedTemplate.category === 'AUTHENTICATION') {
      clonedTemplate.footer_text = "This code will expire in 1 minutes.";
      clonedTemplate.bodyIncludes = ['body', 'buttons'];
      clonedTemplate.button_type = 'otp';
      
      // Update button type for authentication
      if (clonedBlock.buttons.length > 0) {
        clonedBlock.buttons[0].type = 'copy_code';
      }
    }
  
    return {
      template: clonedTemplate,
      block: clonedBlock
    };
  };

  
const copyPayload = (id: string) => {
    navigator.clipboard.writeText(`WHATSAPP_TEMPLATE_ID-${id}`);
    window.$toast?.success('Template payload copied to clipboard!');
  };
  
  
  return {
    // state
    selectedPreviewTemplate,
    previewTemplateData,
    previewModalRef,

    // actions
    cloneTemplate,
    previewTemplate,
    copyPayload
  };
}
