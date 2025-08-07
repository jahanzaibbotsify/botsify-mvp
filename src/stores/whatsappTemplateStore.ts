import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { publishApi } from '@/services/publishApi';

export const useWhatsAppTemplateStore = defineStore('whatsappTemplate', () => {
  // Views management
  const views = ref({
    fields: 'current',
    settings: 'hidden'
  });

  // Template data structure
  const template = ref({
    name: '',
    category: 'MARKETING',
    type: 'text',
    bodyIncludes: ['body'],
    header: 'text',
    header_text: '',
    footer_text: '',
    slides: [] as any[],
    button_type: 'postback',
    total_buttons: 3,
    variables: {
      header: null as any,
      body: [] as any[],
      buttons: [] as any[]
    }
  });

  const block = ref({
    language: 'en',
    text: '',
    image_url: '',
    video_url: '',
    attachment_link: '',
    buttons: [
      {
        type: 'postback',
        text: '',
        value: '',
        title: '',
        url: '',
        response: ''
      }
    ],
    slides: [] as any[]
  });

  const errors = ref({
    body: '',
    header: '',
    footer: '',
    file: {} as Record<string, string>
  });

  // Options
  const template_types = [
    { label: 'Standard (text only)', value: 'text' },
    { label: 'Media & Interactive', value: 'media' },
    { label: 'Media Carousel', value: 'generic' }
  ];

  const categories = [
    { label: 'MARKETING', value: 'MARKETING' },
    { label: 'Utility', value: 'UTILITY' },
    { label: 'Authentication', value: 'AUTHENTICATION' }
  ];

  const languages = [
    { label: "English (en)", value: "en" },
    { label: "Spanish (es)", value: "es" },
    { label: "French (fr)", value: "fr" },
    { label: "German (de)", value: "de" },
    { label: "Italian (it)", value: "it" },
    { label: "Portuguese (pt)", value: "pt" },
    { label: "Russian (ru)", value: "ru" },
    { label: "Chinese (zh)", value: "zh" },
    { label: "Japanese (ja)", value: "ja" },
    { label: "Korean (ko)", value: "ko" }
  ];

  const ctaOptions = [
    { label: 'Postback', value: 'postback' },
    { label: 'URL', value: 'url' },
    { label: 'Phone Number', value: 'phone' }
  ];

  // Computed properties
  const isAuthenticationCategory = computed(() => template.value.category === 'AUTHENTICATION');
  const isMediaType = computed(() => template.value.type === 'media');
  const isGenericType = computed(() => template.value.type === 'generic');

  // Variable counting functions
  const countVariables = (text: string): number => {
    const regex = /\{\{(\d+)\}\}/g;
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  };

  const canAddVariable = (section: string): boolean => {
    if (section === 'header') {
      return !template.value.variables.header;
    } else if (section === 'body') {
      return true; // Body can have multiple variables
    } else if (section.startsWith('button')) {
      const buttonIndex = parseInt(section.split('_')[1]);
      const button = block.value.buttons[buttonIndex];
      if (!button) return false;
      
             // Check for variables in title, text, and URL fields
       const titleVariables = countVariables(button.title || '');
       const textVariables = countVariables(button.text || '');
       const urlVariables = countVariables(button.url || '');
       const totalVariables = titleVariables + textVariables + urlVariables;
      
      return totalVariables < 1; // Each button can have max 1 variable
    }
    return true;
  };

  const getVariableCount = (section: string): number => {
    if (section === 'header') {
      return template.value.variables.header ? 1 : 0;
    } else if (section === 'body') {
      return template.value.variables.body.length;
    } else if (section.startsWith('button')) {
      const buttonIndex = parseInt(section.split('_')[1]);
      const button = block.value.buttons[buttonIndex];
      if (!button) return 0;
      
             // Check for variables in title, text, and URL fields
       const titleVariables = countVariables(button.title || '');
       const textVariables = countVariables(button.text || '');
       const urlVariables = countVariables(button.url || '');
       return titleVariables + textVariables + urlVariables;
    }
    return 0;
  };

  // Methods
  const afterSelect = () => {
    // Handle after select
  };

  const onChangeCategory = () => {
    // Reset state when category changes
    // resetForm();
    if (template.value.category === 'AUTHENTICATION') {
      // Auto-fill authentication template
      block.value.text = '{{1}} is your verification code. For security do not share this code.';
      template.value.footer_text = 'This code will expire in 1 minutes.';
      block.value.buttons[0].type = 'copy_code';
      template.value.button_type = 'otp';
      template.value.variables.body = [{ key: '{{1}}', value: '' }];
    }
  };

  const onChangeTemplateType = () => {
    // Handle template type change
    if (template.value.type === 'text') {
      template.value.bodyIncludes = ['body'];
    } else if (template.value.type === 'media') {
      template.value.bodyIncludes = ['body'];
    } else if (template.value.type === 'generic') {
      template.value.slides = [createSlide()];
    }
  };

  const onChangeHeaderType = () => {
    // Clear previous header content when type changes
    template.value.header_text = '';
    template.value.variables.header = null;
    block.value.image_url = '';
    block.value.video_url = '';
    block.value.attachment_link = '';
  };

  const onChangeCta = (buttonIndex: number, slideIndex: number) => {
    const isGeneric = template.value.type === 'generic';

      if (isGeneric) {
        const button = block.value.slides?.[slideIndex]?.buttons?.[buttonIndex];
        if (button && !button.type) {
          button.type = 'web_url';
        }
      } else {
        const button = block.value.buttons?.[buttonIndex];
        if (button && !button.type) {
          button.type = 'web_url';
        }
      }
  };

  const checkForVariables = (section?: string) => {
    // Check for variables in text and update variables structure
    if (section === 'header') {
      const variables = extractVariables(template.value.header_text || '');
      if (variables.length > 0) {
        template.value.variables.header = {
          key: `{{${variables[0]}}}`,
          value: ''
        };
      } else {
        template.value.variables.header = null;
      }
    } else if (section === 'body') {
      const variables = extractVariables(block.value.text || '');
      template.value.variables.body = variables.map(num => ({
        key: `{{${num}}}`,
        value: ''
      }));
    } else if (section?.startsWith('button_')) {
      const buttonIndex = parseInt(section.split('_')[1]);
      const button = block.value.buttons[buttonIndex];
      if (!button) return;
      
             // Check for variables in title, text, and URL fields
       const titleVariables = extractVariables(button.title || '');
       const textVariables = extractVariables(button.text || '');
       const urlVariables = extractVariables(button.url || '');
       const allVariables = [...titleVariables, ...textVariables, ...urlVariables];
      
      if (allVariables.length > 0) {
        // Update or add button variable
        const existingIndex = template.value.variables.buttons.findIndex(v => v.buttonIndex === buttonIndex);
        if (existingIndex >= 0) {
          template.value.variables.buttons[existingIndex] = {
            buttonIndex,
            key: `{{${allVariables[0]}}}`,
            value: ''
          };
        } else {
          template.value.variables.buttons.push({
            buttonIndex,
            key: `{{${allVariables[0]}}}`,
            value: ''
          });
        }
      } else {
        // Remove button variable if no variables found
        template.value.variables.buttons = template.value.variables.buttons.filter(v => v.buttonIndex !== buttonIndex);
      }
    }
  };

  const addVariable = (section?: string) => {
    // Check if we can add more variables
    if (!canAddVariable(section || 'body')) {
      return;
    }
    if (section === 'header') {
      const currentText = template.value.header_text || '';
      const nextVarNum = extractVariables(currentText).length + 1;
      const cursorPos = (document.querySelector('.header-textarea') as HTMLTextAreaElement)?.selectionStart || currentText.length;
      
      const newText = currentText.slice(0, cursorPos) + `{{${nextVarNum}}}` + currentText.slice(cursorPos);
      template.value.header_text = newText;
      checkForVariables('header');
    } else if (section === 'body') {
      const currentText = block.value.text || '';
      const nextVarNum = extractVariables(currentText).length + 1;
      const cursorPos = (document.querySelector('.body-textarea') as HTMLTextAreaElement)?.selectionStart || currentText.length;
      
      const newText = currentText.slice(0, cursorPos) + `{{${nextVarNum}}}` + currentText.slice(cursorPos);
      block.value.text = newText;
      checkForVariables('body');
    } else if (section?.startsWith('button')) {
      const buttonIndex = parseInt(section.split('_')[1]);
      const button = block.value.buttons[buttonIndex];
      if (!button) return;
      
             // For buttons, we need to determine which field to add the variable to
       // Check if it's a URL button or title field
       if (button.type === 'web_url') {
         // Add variable to URL field for web_url buttons
         const currentText = button.url || '';
         const nextVarNum = extractVariables(currentText).length + 1;
         const newText = currentText + `{{${nextVarNum}}}`;
         button.url = newText;
         // Also update the text field if it exists
         if (button.text !== undefined) {
           button.text = newText;
         }
         checkForVariables(`button_${buttonIndex}`);
       } else {
         // Add variable to title field for other button types
         const currentText = button.title || button.text || '';
         const nextVarNum = extractVariables(currentText).length + 1;
         const newText = currentText + `{{${nextVarNum}}}`;
         button.title = newText;
         // Also update the text field if it exists
         if (button.text !== undefined) {
           button.text = newText;
         }
         checkForVariables(`button_${buttonIndex}`);
       }
    }
  };

  const removeVariable = (section?: string) => {
    if (section === 'header') {
      const currentText = template.value.header_text || '';
      const newText = currentText.replace(/\{\{\d+\}\}/g, '');
      template.value.header_text = newText;
      template.value.variables.header = null;
    } else if (section === 'body') {
      const currentText = block.value.text || '';
      const newText = currentText.replace(/\{\{\d+\}\}/g, '');
      block.value.text = newText;
      template.value.variables.body = [];
    } else if (section?.startsWith('button')) {
      const buttonIndex = parseInt(section.split('_')[1]);
      const button = block.value.buttons[buttonIndex];
      if (!button) return;
      
             // Remove variables from title, text, and URL fields
       const newTitle = (button.title || '').replace(/\{\{\d+\}\}/g, '');
       const newText = (button.text || '').replace(/\{\{\d+\}\}/g, '');
       const newUrl = (button.url || '').replace(/\{\{\d+\}\}/g, '');
       
       button.title = newTitle;
       button.text = newText;
       button.url = newUrl;
      
      // Update variables tracking
      checkForVariables(`button_${buttonIndex}`);
    }
  };

  const extractVariables = (text: string): number[] => {
    const regex = /\{\{(\d+)\}\}/g;
    const variables: number[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      variables.push(parseInt(match[1]));
    }
    return [...new Set(variables)].sort((a, b) => a - b);
  };

  const createSlide = () => ({
    header: 'image',
    body: '',
    buttons: []
  });

  const goNext = () => {
    if (views.value.fields === 'current') {
      views.value.fields = 'hidden';
      views.value.settings = 'current';
    }
  };

  const goBack = () => {
    if (views.value.settings === 'current') {
      views.value.settings = 'hidden';
      views.value.fields = 'current';
    }
  };

  const isNextDisabled = () => {
    return !block.value.text || !template.value.category || !block.value.language;
  };

  const validateData = () => {
    return block.value.text && template.value.category && block.value.language;
  };

  const saveBlock = async () => {
    if (!validateData()) {
      return;
    }

    try {
             // Format buttons according to API requirements
       const formattedButtons = block.value.buttons.map(button => {
         if (template.value.category === 'AUTHENTICATION') {
           return {
             api: 1,
             error: false,
             payload: '',
             response: '',
             signature_hash: '',
             title: button.text || button.title || '',
             type: 'copy_code',
             url: ''
           };
         } else {
           return {
             api: button.type === 'postback' ? 0 : 1,
             type: button.type === 'postback' ? 'postback' : (button.type === 'web_url' ? 'url' : 'phone_number'),
             url: button.type === 'web_url' ? button.url : null,
             title: button.text || button.title || '',
             payload: button.type === 'postback' ? button.response || '' : null
           };
         }
       });

             const templateData = {
         name: template.value.name || 'Template',
         text: block.value.text,
         language: block.value.language,
         template_specs: {
           category: template.value.category,
           header: template.value.header,
           button_type: template.value.category === 'AUTHENTICATION' ? 'otp' : (template.value.type === 'media' ? 'cta' : 'qr'),
           footer_text: template.value.footer_text,
           variables: template.value.variables || {}
         },
         buttons: formattedButtons
       };
      const result = await publishApi.createTemplate(templateData);
      if (result.success) {
        window.$toast?.success('Template created successfully!');
        return { success: true, data: templateData };
      } else {
        window.$toast?.error('Failed to create template');
        return { success: false, error: 'Failed to create template' };
      }
    } catch (error) {
      console.error('Failed to create template:', error);
      window.$toast?.error('Failed to create template');
      return { success: false, error: 'Failed to create template' };
    }
  };

  const resetForm = () => {
    template.value = {
      name: '',
      category: 'MARKETING',
      type: 'text',
      bodyIncludes: ['body'],
      header: 'text',
      header_text: '',
      footer_text: '',
      slides: [] as any[],
      button_type: 'postback',
      total_buttons: 3,
      variables: {
        header: null,
        body: [],
        buttons: []
      }
    };
    block.value = {
      language: 'en',
      text: '',
      image_url: '',
      video_url: '',
      attachment_link: '',
      buttons: [{ type: 'postback', text: '', value: '', title: '', url: '', response: '' }],
      slides: [] as any[]
    };
    views.value = { fields: 'current', settings: 'hidden' };
    errors.value = {
      body: '',
      header: '',
      footer: '',
      file: {}
    };
  };

  const onButtonTypeChange = (slideIndex = 0) => {
    if (template.value.type === 'generic') {
      template.value.slides[slideIndex].total_buttons = template.value.slides[slideIndex].button_type == 'cta' ? 2 : 1;
    } else {
      template.value.total_buttons = template.value.button_type == 'cta' ? 2 : 3;
    }
  };

  const canAddButton = (): boolean => {
    const isGeneric = template.value.type === 'generic';
    const isCTA = isGeneric
      ? template.value.slides[0]?.button_type === 'cta'
      : template.value.button_type === 'cta';

    if (isGeneric) {
      const slideButtons = block.value.slides[0]?.buttons || [];
      return slideButtons.length < (isCTA ? 2 : 1);
    } else {
      const currentButtons = block.value.buttons.filter(btn => btn.title && btn.title.trim() !== '');
      return currentButtons.length < (isCTA ? 2 : 3);
    }
  };

  const addTheButton = (slideIndex = 0) => {
    const isGeneric = template.value.type === 'generic';
    const isCTA = isGeneric
      ? template.value.slides[slideIndex]?.button_type === 'cta'
      : template.value.button_type === 'cta';

    const newButtonTemplate = {
      type: 'postback',
      text: '',
      value: '',
      title: '',
      url: '',
      response: ''
    };

    if (isGeneric) {
      block.value.slides.forEach((slide, idx) => {
        const newButton = { ...newButtonTemplate };

        if (isCTA) {
          const firstButtonType = slide.buttons?.[0]?.type;
          newButton.type = firstButtonType === 'web_url' ? 'phone_number' : 'web_url';
        }

        slide.buttons.push(newButton);
      });
    } else {
      const newButton = { ...newButtonTemplate };

      if (isCTA) {
        const firstButtonType = block.value.buttons?.[0]?.type;
        newButton.type = firstButtonType === 'web_url' ? 'phone_number' : 'web_url';
      }

      block.value.buttons.push(newButton);
    }
  };

  const removeTheButton = (index: number, slideIndex = 0) => {
    if (template.value.type === 'generic') {
      block.value.slides.forEach(slide => {
        if (Array.isArray(slide.buttons) && slide.buttons.length > index) {
          slide.buttons.splice(index, 1);
        }
      });
    } else {
      block.value.buttons.splice(index, 1);
    }
  };

  const onUpdateAttachmentLink = () => {
    const attachmentLink = block.value.attachment_link;
    
    if (typeof attachmentLink === 'string') {
      block.value.attachment_link = attachmentLink.trim().replace(/ /g, '%20');
    }
    
    const extensionMap: Record<string, RegExp> = {
      image: /\.(jpg|jpeg|png|gif)$/i,
      video: /\.(mp4)$/i,
      document: /\.(pdf)$/i
    };

    const messages: Record<string, string> = {
      image: "Please select a valid Image (.jpg, .jpeg, .png, .gif)",
      video: "Please select a valid Video (.mp4)",
      document: "Please select a valid File (.pdf)"
    };

    if (extensionMap[template.value.header] && !extensionMap[template.value.header].test(attachmentLink)) {
      errors.value.file = { [template.value.header]: `Please enter a valid link, must be a ${template.value.header} file!` };
      block.value.attachment_link = '';
      return;
    }

    errors.value.file = {};
  };

  return {
    // State
    views,
    template,
    block,
    errors,
    
    // Options
    template_types,
    categories,
    languages,
    ctaOptions,
    
    // Computed
    isAuthenticationCategory,
    isMediaType,
    isGenericType,
    
    // Variable functions
    countVariables,
    canAddVariable,
    getVariableCount,
    
    // Methods
    afterSelect,
    onChangeCategory,
    onChangeTemplateType,
    onChangeHeaderType,
    onChangeCta,
    checkForVariables,
    addVariable,
    removeVariable,
    extractVariables,
    createSlide,
    goNext,
    goBack,
    isNextDisabled,
    validateData,
    saveBlock,
    resetForm,
    addTheButton,
    removeTheButton,
    onButtonTypeChange,
    onUpdateAttachmentLink,
    canAddButton
  };
}); 