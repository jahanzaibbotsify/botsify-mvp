import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
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
      button: null as any
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
    list: ['body', 'file', 'header', 'footer'],
    body: 'The template body field is required',
    header: 'The template header field is required',
    footer: 'The template footer field is required',
    file: '',
    title_btn_var: '',
    url_btn_var: 'The URL button response is required',
    response_btn_var: '',
    slides: [
      {
        title: '',
        buttons: null as any,
        file: ''
      }
    ]
  });

  // Loading state for save operation
  const isSaving = ref(false);

  // Watch for authentication template button validation
  watch(() => block.value.buttons, (buttons: any[]) => {
    if (template.value.category === 'AUTHENTICATION' && buttons && buttons.length > 0) {
      const button = buttons[0];
      
      // Validate button title/text
      if (typeof button.text === 'string') {
        button.text = button.text.trim();
        
        if (!button.text) {
          errors.value.title_btn_var = 'The button text is required';
        } else {
          errors.value.title_btn_var = '';
        }
      }
    }
  }, { deep: true, immediate: true });

  // Watch for header text validation
  watch(() => template.value.header_text, (headerText: string) => {
    if (template.value.type === 'media' && 
        template.value.bodyIncludes.includes('header') && 
        template.value.header === 'text') {
      
      if (!headerText || headerText.trim() === '') {
        errors.value.header = 'Header text is required';
      } else {
        errors.value.header = '';
      }
    }
  }, { immediate: true });

  // Watch for footer text validation
  watch(() => template.value.footer_text, (footerText: string) => {
    if (template.value.type === 'media' && 
        template.value.bodyIncludes.includes('footer')) {
      
      if (!footerText || footerText.trim() === '') {
        errors.value.footer = 'Footer text is required';
      } else {
        errors.value.footer = '';
      }
    }
  }, { immediate: true });

  // Watch for body text validation
  watch(() => block.value.text, (bodyText: string) => {
    if (template.value.type === 'text' || template.value.type === 'media') {
      if (!bodyText || bodyText.trim() === '') {
        errors.value.body = 'The template body field is required';
      } else {
        errors.value.body = '';
      }
    }
  }, { immediate: true });

  // Watch for attachment link validation
  watch(() => block.value.attachment_link, (newValue: string) => {
    console.log("newValue", newValue)
    if (template.value.header === 'video') {
      block.value.video_url = newValue;
    } else {
      block.value.image_url = newValue;
    }

    if (!newValue) {
      errors.value.file = template.value.header + ' link is required field!';
      if (!errors.value.list.includes('file')) {
        errors.value.list.push('file');
      }
    } else {
      errors.value.file = '';
      const index = errors.value.list.indexOf('file');
      if (index !== -1) {
        errors.value.list.splice(index, 1);
      }
    }
  }, { deep: true });

  // Watch for slides validation
  watch(() => block.value.slides, (newSlides: any[]) => {
    newSlides.forEach((slide, index) => {
      if (!Array.isArray(errors.value.slides)) {
        errors.value.slides = [];
      }
      if (!errors.value.slides[index]) {
        errors.value.slides[index] = {
          title: '',
          buttons: null as any,
          file: ''
        };
      }

      // Watch for slide buttons
      watch(() => slide.buttons, (newVal: any[]) => {
        if (!newVal || newVal.length === 0) {
          errors.value.slides[index].buttons = 'Buttons are required!';
          if (!errors.value.list.includes(`slide_buttons_${index}`)) {
            errors.value.list.push(`slide_buttons_${index}`);
          }
        } else {
          delete errors.value.slides[index].buttons;
          const errIndex = errors.value.list.indexOf(`slide_buttons_${index}`);
          if (errIndex !== -1) {
            errors.value.list.splice(errIndex, 1);
          }
        }
      }, { immediate: true });

      // Watch for slide title
      watch(() => slide.title, (newVal: string) => {
        if (!newVal || newVal.trim() === '') {
          errors.value.slides[index].title = 'Slide title is required!';
          if (!errors.value.list.includes(`slide_title_${index}`)) {
            errors.value.list.push(`slide_title_${index}`);
          }
        } else {
          errors.value.slides[index].title = '';
          const errIndex = errors.value.list.indexOf(`slide_title_${index}`);
          if (errIndex !== -1) {
            errors.value.list.splice(errIndex, 1);
          }
        }
      }, { immediate: true });

      // Watch for slide attachment link
      watch(() => slide.attachment_link, (newVal: string) => {
        if (!newVal || newVal.trim() === '') {
          errors.value.slides[index].file = 'Attachment link is required!';
          if (!errors.value.list.includes(`slide_file_${index}`)) {
            errors.value.list.push(`slide_file_${index}`);
          }
        } else {
          slide.image_url = newVal;
          errors.value.slides[index].file = '';
          const errIndex = errors.value.list.indexOf(`slide_file_${index}`);
          if (errIndex !== -1) {
            errors.value.list.splice(errIndex, 1);
          }
        }
      }, { immediate: true });
    });
  }, { deep: true });

  // Update header text watch to include character limit and list management
  watch(() => template.value.header_text, (newValue: string) => {
    if(template.value.header !== 'text'){
      return;
    }
    if (newValue.length > 60) {
      template.value.header_text = newValue.substring(0, 60);
    }

    if (newValue === '') {
      errors.value.header = 'Template header is required field!';
      if (!errors.value.list.includes('header')) {
        errors.value.list.push('header');
      }
    } else {
      errors.value.header = '';
      const index = errors.value.list.indexOf('header');
      if (index !== -1) {
        errors.value.list.splice(index, 1);
      }
    }
  }, { deep: true });

  // Update footer text watch to include character limit and list management
  watch(() => template.value.footer_text, (newValue: string) => {
    if (newValue.length > 60) {
      template.value.footer_text = newValue.substring(0, 60);
    }

    if (newValue === '') {
      errors.value.footer = 'Template footer is required field!';
      if (!errors.value.list.includes('footer')) {
        errors.value.list.push('footer');
      }
    } else {
      errors.value.footer = '';
      const index = errors.value.list.indexOf('footer');
      if (index !== -1) {
        errors.value.list.splice(index, 1);
      }
    }
  }, { deep: true });

  // Watch for button changes to automatically check for variables
  watch(() => block.value.buttons, (buttons: any[]) => {
    if (buttons && buttons.length > 0) {
      // Check each button for variables
      buttons.forEach((button, index) => {
        console.log(button);
        checkForVariables(`button_${index}`);
      });
    } else {
      // Clear button variables if no buttons
      template.value.variables.button = null;
    }
  }, { deep: true });

  // Watch for slide button changes to automatically check for variables
  watch(() => block.value.slides, (slides: any[]) => {
    if (slides && slides.length > 0) {
      slides.forEach((slide, slideIndex) => {
        if (slide.buttons && slide.buttons.length > 0) {
          slide.buttons.forEach((button: any, buttonIndex: number) => {
            console.log(button);
            checkForVariables(`button_${buttonIndex}`, slideIndex);
          });
        } else {
          // Clear slide button variables if no buttons
          if (template.value.slides[slideIndex]?.variables) {
            template.value.slides[slideIndex].variables.button = null;
          }
        }
      });
    }
  }, { deep: true });

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
    } else if (section === 'slider') {
      return true; // Slide body can have multiple variables
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

  const getVariableCount = (section: string, slideIndex = 0): number => {
    if (section === 'header') {
      return template.value.variables.header ? 1 : 0;
    } else if (section === 'body') {
      return template.value.variables.body.length;
    } else if (section === 'slider') {
      // For slider, check the specific slide variables
      const slide = template.value.slides[slideIndex];
      return slide?.variables?.body?.length || 0;
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
      template.value.bodyIncludes = ['body', 'buttons'];
      block.value.text = '{{1}} is your verification code. For security do not share this code.';
      template.value.footer_text = 'This code will expire in 1 minutes.';
      template.value.button_type = 'otp';
      template.value.variables.body = [{ key: '{{1}}', value: '' }];
      template.value.type = 'media'
      block.value.buttons = [{
        type: 'copy_code',
        text: '',
        value: '',
        title: '',
        url: '',
        response: ''
      }];
    } else if(template.value.category === 'MARKETING'){
      template.value.bodyIncludes = ['body'];
    } else if(template.value.category === 'UTILITY'){
      template.value.bodyIncludes = ['body'];
    }
  };

  const onChangeTemplateType = () => {
    // Handle template type change
    if (template.value.type === 'text') {
      template.value.bodyIncludes = ['body'];
    } else if (template.value.type === 'media') {
      template.value.bodyIncludes = ['body'];
    } else if (template.value.type === 'generic') {
      template.value.bodyIncludes = ['body'];
      // Create first slide with proper structure matching the new format
      const firstSlide = {
        header: 'image',
        button_type: 'cta',
        total_buttons: 2,
        variables: {
          body: [],
          button: null
        }
      };
      
      template.value.slides = [firstSlide];
      
      // Initialize block.slides for carousel with matching structure
      block.value.slides = [{
        id: 1,
        title: '',
        subtitle: '',
        type: 'button',
        image_url: '',
        attachment_link: '',
        buttons: [{
          api: 1,
          error: false,
          type: 'web_url',
          title: '',
          response: '',
          payload: '',
          url: '',
          signature_hash: ''
        }]
      }];
    }
  };

  const onChangeHeaderType = () => {
    // Ensure default header type
    if (!template.value.header) {
      template.value.header = 'text';
    }
    // Clear previous header content when type changes
    template.value.variables.header = null;
    block.value.image_url = '';
    block.value.video_url = '';
    block.value.attachment_link = '';
    // Validate header requirement
    if (template.value.header !== 'text') {
      errors.value.header = '';
    } else if (template.value.header === 'text' && !template.value.header_text) {
      errors.value.header = 'The template header field is required';
    }
  };
  

  const onChangeCta = (buttonIndex: number, slideIndex: number) => {
    const isGeneric = template.value.type === 'generic';

    if (isGeneric) {
      const blockSlide = block.value.slides?.[slideIndex];
      
      if (blockSlide) {
        const blockButton = blockSlide.buttons?.[buttonIndex];
        
        // Set default type if not set
        if (blockButton && !blockButton.type) {
          blockButton.type = 'web_url';
        }
        
        // Re-check variables for this slide after button type change
        checkForVariables('slider', slideIndex);
      }
    } else {
      const button = block.value.buttons?.[buttonIndex];
      if (button && !button.type) {
        button.type = 'web_url';
      }
    }
  };

  const checkForVariables = (section?: string, slideIndex = 0) => {
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
    } else if (section === 'slider') {
      // Handle carousel slide title variables
      const slide = template.value.slides[slideIndex];
      const blockSlide = block.value.slides[slideIndex];
      if (!slide || !blockSlide) return;
      
      // Initialize variables if not exists
      if (!slide.variables) {
        slide.variables = { body: [] };
      }
      if (!slide.variables.body) {
        slide.variables.body = [];
      }
      
      const variables = extractVariables(blockSlide.title || '');
      slide.variables.body = variables.map(num => ({
        key: `{{${num}}}`,
        value: ''
      }));
    } else if (section?.startsWith('button_')) {
      const buttonIndex = parseInt(section.split('_')[1]);
      const isGeneric = template.value.type === 'generic';
      
      if (isGeneric && slideIndex !== undefined && slideIndex >= 0) {
        // Handle carousel slide button variables
        const slide = template.value.slides[slideIndex];
        const blockSlide = block.value.slides[slideIndex];
        if (!slide || !blockSlide) return;
        
        // Initialize variables if not exists
        if (!slide.variables) {
          slide.variables = { button: null };
        }
        if (!slide.variables.button) {
          slide.variables.button = null;
        }
        
        const button = blockSlide.buttons?.[buttonIndex];
        if (!button) return;
        
        // Check for variables in title, text, and URL fields
        const titleVariables = extractVariables(button.title || '');
        const textVariables = extractVariables(button.text || '');
        const urlVariables = extractVariables(button.url || '');
        const allVariables = [...titleVariables, ...textVariables, ...urlVariables];
        
        if (allVariables.length > 0) {
          // Update or add button variable
          slide.variables.button = {
            key: `{{${allVariables[0]}}}`,
            value: ''
          };
        } else {
          // Remove button variable if no variables found
          slide.variables.button = null;
        }
      } else {
        // Handle regular template button variables
        const button = block.value.buttons[buttonIndex];
        if (!button) return;
        
        // Check for variables in title, text, and URL fields
        const titleVariables = extractVariables(button.title || '');
        const textVariables = extractVariables(button.text || '');
        const urlVariables = extractVariables(button.url || '');
        const allVariables = [...titleVariables, ...textVariables, ...urlVariables];
        
        if (allVariables.length > 0) {
          // Update or add button variable
          template.value.variables.button = {
            key: `{{${allVariables[0]}}}`,
            value: ''
          };
        } else {
          // Remove button variable if no variables found
          template.value.variables.button = null;
        }
      }
    }
  };

  const addVariable = (section?: string, _addNew = true, _btnIndex = null, slideIndex = 0) => {
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
    } else if (section === 'slider') {
      // Handle carousel slide body variables
      const slide = template.value.slides[slideIndex];
      const blockSlide = block.value.slides[slideIndex];
      if (!slide || !blockSlide) return;
      
      // Initialize variables if not exists
      if (!slide.variables) {
        slide.variables = { body: [] };
      }
      if (!slide.variables.body) {
        slide.variables.body = [];
      }
      
      const currentText = blockSlide.title || '';
      const nextVarNum = extractVariables(currentText).length + 1;
      const cursorPos = (document.querySelector(`#emoji-textarea_slide${slideIndex}`) as HTMLTextAreaElement)?.selectionStart || currentText.length;
      
      const newText = currentText.slice(0, cursorPos) + `{{${nextVarNum}}}` + currentText.slice(cursorPos);
      blockSlide.title = newText;
      checkForVariables('slider', slideIndex);
    } else if (section?.startsWith('button')) {
      const buttonIndex = parseInt(section.split('_')[1]);
      const isGeneric = template.value.type === 'generic';
      
      if (isGeneric && slideIndex !== undefined && slideIndex >= 0) {
        // Handle carousel slide button variables
        const slide = template.value.slides[slideIndex];
        const blockSlide = block.value.slides[slideIndex];
        if (!slide || !blockSlide) return;
        
        const button = blockSlide.buttons?.[buttonIndex];
        if (!button) return;
        
        // For buttons, we need to determine which field to add the variable to
        // Check if it's a URL button or title field
        if (button.type === 'web_url') {
          // Add variable to URL field for web_url buttons
          const currentText = button.url || '';
          const nextVarNum = extractVariables(currentText).length + 1;
          const newText = currentText + `{{${nextVarNum}}}`;
          button.url = newText;
          checkForVariables(`button_${buttonIndex}`, slideIndex);
        } else {
          // Add variable to title field for other button types
          const currentText = button.title || '';
          const nextVarNum = extractVariables(currentText).length + 1;
          const newText = currentText + `{{${nextVarNum}}}`;
          button.title = newText;
          checkForVariables(`button_${buttonIndex}`, slideIndex);
        }
      } else {
        // Handle regular template button variables
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
          // if (button.text !== undefined) {
          //   button.text = newText;
          // }
          checkForVariables(`button_${buttonIndex}`);
        } else {
          // Add variable to title field for other button types
          const currentText = button.title || button.text || '';
          const nextVarNum = extractVariables(currentText).length + 1;
          const newText = currentText + `{{${nextVarNum}}}`;
          button.title = newText;
          // Also update the text field if it exists
          // if (button.text !== undefined) {
          //   button.text = newText;
          // }
          checkForVariables(`button_${buttonIndex}`);
        }
      }
    }
  };

  const removeVariable = (section?: string, slideIndex = 0) => {
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
      const isGeneric = template.value.type === 'generic';
      
      if (isGeneric && slideIndex !== undefined && slideIndex >= 0) {
        // Handle carousel slide button variables
        const blockSlide = block.value.slides[slideIndex];
        const button = blockSlide?.buttons?.[buttonIndex];
        if (!button) return;
        
        // Remove variables from title, text, and URL fields
        const newTitle = (button.title || '').replace(/\{\{\d+\}\}/g, '');
        const newText = (button.text || '').replace(/\{\{\d+\}\}/g, '');
        const newUrl = (button.url || '').replace(/\{\{\d+\}\}/g, '');
        
        button.title = newTitle;
        button.text = newText;
        button.url = newUrl;
        
        // Update variables tracking
        checkForVariables(`button_${buttonIndex}`, slideIndex);
      } else {
        // Handle regular template button variables
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

  const createSlide = () => {
    // Get the current button type from the first slide if it exists
    const firstSlide = template.value.slides[0];
    const currentButtonType = firstSlide?.button_type || 'cta';
    
    return {
      header: 'image',
      button_type: currentButtonType,
      total_buttons: currentButtonType === 'cta' ? 2 : 1,
      variables: {
        body: [],
        button: null
      }
    }
  };

  const createBlockSlide = () => {
    // Get the current button type from the first slide if it exists
    const firstSlide = template.value.slides[0];
    const currentButtonType = firstSlide?.button_type || 'postback';
    
    // Get the next slide ID
    const nextId = block.value.slides.length + 1;
    
    // Create default button based on button type
    const defaultButton = {
      api: 1,
      error: false,
      type: currentButtonType === 'cta' ? 'web_url' : 'postback',
      title: '',
      response: '',
      payload: '',
      url: '',
      signature_hash: ''
    };
    
    return {
      id: nextId,
      title: '',
      subtitle: '',
      type: 'button',
      image_url: '',
      attachment_link: '',
      buttons: [defaultButton]
    }
  };

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
    const { type, category, bodyIncludes } = template.value;
    
    // Authentication template validation
    if(category === 'AUTHENTICATION'){
      if(errors.value.title_btn_var !== '') return true;
      return false;
    }
    
    // Text validation
    if (type === 'text' && errors.value.body !== '') {
      return true;
    }
    
    // Media validation
    if (type === 'media') {
      if (errors.value.body !== '') return true;
      if (bodyIncludes.includes('header') && errors.value.header !== '') return true;
      if (bodyIncludes.includes('footer') && errors.value.footer !== '') return true;
      if (bodyIncludes.includes('buttons')){
        return block.value.buttons.some((button: any) => {
          if (!button.title || button.title.trim() === '') return true;
          if (button.type === 'postback' && (!button.response || button.response.trim() === '')) return true;
          if (button.type === 'web_url' && (!button.url || button.url.trim() === '')) return true;
          if (button.type === 'phone_number' && (!button.payload || button.payload.trim() === '')) return true;
        });
      }
    }

    // Generic validation
    if (type === 'generic') {
      const slides = block.value.slides;
      if (!slides.length) return true;
      const expectedButtonCount = slides[0].buttons.length;
      if (expectedButtonCount === 0) return true;
      for (const slide of slides) {
        if (!slide.title || slide.title.trim() === '') return true;
        if (slide.buttons.length !== expectedButtonCount) return true;
        return slide.buttons.some((button: any) => {
          if (!button.title || button.title.trim() === '') return true;
          if (button.type === 'postback' && (!button.response || button.response.trim() === '')) return true;
          if (button.type === 'web_url' && (!button.url || button.url.trim() === '')) return true;
          if (button.type === 'phone_number' && (!button.payload || button.payload.trim() === '')) return true;
        });
      }
    }
    
    return false;
  };

  const validateData = () => {
    const { type, category, bodyIncludes } = template.value;
    
    // Basic validation
    if (!block.value.text || !template.value.category || !block.value.language) {
      window.$toast?.error('Please fill all required fields');
      return false;
    }
    
    // Authentication template validation
    if (category === 'AUTHENTICATION') {
      if (errors.value.title_btn_var !== '') {
        window.$toast?.error('Please fill the button text for authentication template');
        return false;
      }
    }
    
    // Text template validation
    if (type === 'text') {
      if (errors.value.body !== '') {
        window.$toast?.error('Please fill the template body');
        return false;
      }
    }
    
    // Media template validation
    if (type === 'media') {
      if (errors.value.body !== '') {
        window.$toast?.error('Please fill the template body');
        return false;
      }
      if (bodyIncludes.includes('header') && errors.value.header !== '') {
        window.$toast?.error('Please fill the header text');
        return false;
      }
      if (bodyIncludes.includes('footer') && errors.value.footer !== '') {
        window.$toast?.error('Please fill the footer text');
        return false;
      }
    }
    
    // Generic template validation
    if (type === 'generic') {
      // Check if all slides have required content
      for (let i = 0; i < template.value.slides.length; i++) {
        const slide = template.value.slides[i];
        const blockSlide = block.value.slides[i];
        
        if (!slide || !blockSlide) {
          window.$toast?.error(`Slide ${i + 1} is missing data`);
          return false;
        }
        
        // Check if slide title is filled
        if (!blockSlide.title || blockSlide.title.trim() === '') {
          window.$toast?.error(`Please fill the title for slide ${i + 1}`);
          return false;
        }
        
        // Check if at least one button is filled
        const hasFilledButton = blockSlide.buttons?.some((button: any) => 
          (button.title && button.title.trim() !== '') || 
          (button.url && button.url.trim() !== '') ||
          (button.payload && button.payload.trim() !== '')
        );
        
        if (!hasFilledButton) {
          window.$toast?.error(`Please fill at least one button for slide ${i + 1}`);
          return false;
        }
        
        // Validate that all slides have consistent button types
        if (i > 0) {
          const firstSlideButtonType = template.value.slides[0]?.button_type;
          if (slide.button_type !== firstSlideButtonType) {
            window.$toast?.error(`Slide ${i + 1} must have the same button type as the first slide`);
            return false;
          }
        }
        
        // Validate button types are consistent within each slide
        if (blockSlide.buttons && blockSlide.buttons.length > 0) {
          const firstButtonType = blockSlide.buttons[0]?.type;
          const inconsistentButtons = blockSlide.buttons.some((button: any, index: number) => {
            if (index === 0) return false; // Skip first button
            return button.type !== firstButtonType;
          });
          
          if (inconsistentButtons) {
            window.$toast?.error(`All buttons in slide ${i + 1} must have the same type`);
            return false;
          }
        }
      }
    }
    
    return true;
  };

  const saveBlock = async () => {
    if (!validateData()) {
      return;
    }

    isSaving.value = true;

    try {
      // Create copies of the data to modify
      const dataBlock = { ...block.value };
      const cTemp = { ...template.value };
      // If Template base type is text
      if (cTemp.type === 'text') {
        cTemp.header = 'text';
        cTemp.bodyIncludes = ['body'];
        dataBlock.buttons = [];
        cTemp.variables = {
          header: null,
          body: [],
          button: null
        };
        cTemp.header_text = '';
        cTemp.footer_text = '';
      }
      
      // If it is text template (or) if it is media template but header is removed
      if (cTemp.header === 'text' && cTemp.type !== 'generic') {
        cTemp.type = 'button';
        dataBlock.image_url = '';
        dataBlock.video_url = '';
        dataBlock.attachment_link = '/theme/images/file-cover.png';
      } 
      if(cTemp.bodyIncludes.includes('header') && cTemp.header !== 'text'){
        cTemp.type = cTemp.header;
      }

      // If it is not a text template (or) if template does not include header, remove header variable
      if (cTemp.header !== 'text' && cTemp.type !== 'generic' && !cTemp.bodyIncludes.includes('header')) {
        cTemp.header = 'text';
        cTemp.variables.header = null;
        cTemp.header_text = '';
      }

      // If there are no buttons (or) template does not include buttons, remove button Variable
      if (!dataBlock.buttons || dataBlock.buttons.length === 0 || !cTemp.bodyIncludes.includes('buttons')) {
        dataBlock.buttons = [];
        cTemp.variables.button = null;
      } else {
        // Set button variable to the first button if buttons exist
        cTemp.variables.button = dataBlock.buttons[0] || null;
      }

      // if template does not include footer, remove footer text
      if (!cTemp.bodyIncludes.includes('footer')) {
        cTemp.footer_text = '';
      }

      // If There is no URL Button but variable is set previously, reset it while saving.
      if (cTemp.variables.button) {
        const urlButton = dataBlock.buttons.find((button: any) => button.type === 'web_url');
        if (!urlButton) {
          cTemp.variables.button = null;
        }
      }

      // Format buttons according to API requirements
      const formattedButtons = dataBlock.buttons.map((button: any) => {
        if (cTemp.category === 'AUTHENTICATION') {
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
            payload: button.payload,
            response: button.type === 'postback' ? button.response || '' : null
          };
        }
      });

      // Format slides for carousel according to new structure
      let formattedSlides: any[] = [];
      if (cTemp.type === 'generic' && dataBlock.slides && dataBlock.slides.length > 0) {
        formattedSlides = dataBlock.slides.map((slide: any) => ({
          id: slide.id,
          title: slide.title,
          subtitle: slide.subtitle,
          type: slide.type,
          image_url: slide.image_url,
          attachment_link: slide.attachment_link,
          buttons: slide.buttons.map((button: any) => ({
            api: button.api,
            error: button.error,
            type: button.type,
            title: button.title,
            response: button.response,
            payload: button.payload,
            url: button.url,
            signature_hash: button.signature_hash
          }))
        }));
      }

      const templateData = {
        name: cTemp.name || 'Template',
        text: dataBlock.text,
        language: dataBlock.language,
        type: cTemp.type,
        template_specs: {
          category: cTemp.category,
          header: cTemp.header,
          button_type: cTemp.category === 'AUTHENTICATION' ? 'otp' : (cTemp.type === 'media' ? 'cta' : 'postback'),
          footer_text: cTemp.footer_text,
          header_text: cTemp.header_text,
          variables: cTemp.variables || {},
          bodyIncludes: cTemp.bodyIncludes,
          // Preserve slides for carousel with new format
          ...(cTemp.type === 'generic' && { slides: cTemp.slides })
        },
        buttons: formattedButtons,
        image_url: dataBlock.image_url,
        attachment_link: dataBlock.attachment_link,
        video_url: dataBlock.video_url,
        // Preserve slides in block for carousel with new format
        ...(cTemp.type === 'generic' && { slides: formattedSlides })
      };

      const result = await publishApi.createTemplate(templateData);
      if (result.success) {
        console.log(result.data, "result data")
        if(result.data.status === "error"){
          window.$toast?.error(result.data.message);
          return { success: false, error: result.data.message };
        }
        // Clear the templates cache in publishStore
        const { usePublishStore } = await import('@/stores/publishStore');
        const publishStore = usePublishStore();
        publishStore.cache.templates = null;
        publishStore.cacheValid.templates = false;
        
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
    } finally {
      isSaving.value = false;
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
        button: null
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
      list: ['body', 'file', 'header', 'footer'],
      body: 'The template body field is required',
      header: 'The template header field is required',
      footer: 'The template footer field is required',
      file: '',
      title_btn_var: '',
      url_btn_var: 'The URL button response is required',
      response_btn_var: '',
      slides: [
        {
          title: '',
          buttons: null,
          file: ''
        }
      ]
    };
  };

  
const addSlide = () => {
  if (template.value.slides.length >= 10) {
    window.$toast?.error('Cannot add more than 10 slides');
    return;
  }

  // Validate that the first slide has required content
  const firstSlide = template.value.slides[0];
  const firstBlockSlide = block.value.slides[0];
  
  if (!firstSlide || !firstBlockSlide) {
    window.$toast?.error('Please complete the first slide before adding more');
    return;
  }

  // Check if at least one button is filled in the block slide
  let hasFilledButton = firstBlockSlide.buttons.some((button: any) => {
    const hasTitle = button.title && button.title.trim() !== '';
    const hasUrl = button.url && button.url.trim() !== '';
    const hasPayload = button.payload && button.payload.trim() !== '';
    
    return hasTitle || hasUrl || hasPayload;
  });

  if (!hasFilledButton) {
    window.$toast?.error('Please fill at least one button before adding more slides');
    return;
  }

  // const slideIndex = template.value.slides.length;
  
  // Create new template slide
  const templateSlide = createSlide();
  template.value.slides.push(templateSlide);

  // Create new block slide
  const blockSlide = createBlockSlide();
  block.value.slides.push(blockSlide);
  
  // Ensure all slides have consistent button types
  const firstSlideButtonType = template.value.slides[0]?.button_type;
  if (firstSlideButtonType) {
    template.value.slides.forEach((slide: any, index: number) => {
      if (index > 0) { // Skip first slide as it's the reference
        slide.button_type = firstSlideButtonType;
        slide.total_buttons = firstSlideButtonType === 'cta' ? 2 : 1;
      }
    });
  }
  
  // Push default error object for new slide
  errors.value.slides.push({
    title: '',
    buttons: null as any,
    file: ''
  });
};

const removeSlide = (index: number) => {
  if (template.value.slides.length > 1) {
    template.value.slides.splice(index, 1);
    // Also remove from block.slides
    block.value.slides.splice(index, 1);
  }
};
  const onButtonTypeChange = (slideIndex = 0) => {
    if (template.value.type === 'generic') {
      const templateSlide = template.value.slides[slideIndex];
      const blockSlide = block.value.slides[slideIndex];
      
      if (templateSlide && blockSlide) {
        templateSlide.total_buttons = templateSlide.button_type == 'cta' ? 2 : 1;
        
        // Update button types in block slide to match the button_type
        const expectedButtonType = templateSlide.button_type === 'cta' ? 'web_url' : 'postback';
        
        // Update block slide buttons
        blockSlide.buttons.forEach((button: any) => {
          button.type = expectedButtonType;
        });
        
        // Remove excess buttons if needed
        if (blockSlide.buttons.length > templateSlide.total_buttons) {
          const excessCount = blockSlide.buttons.length - templateSlide.total_buttons;
          for (let i = 0; i < excessCount; i++) {
            blockSlide.buttons.pop();
          }
        }
        
        // If this is the first slide, update all other slides to match
        if (slideIndex === 0) {
          template.value.slides.forEach((slide: any, index: number) => {
            if (index > 0) { // Skip first slide as it's already updated
              slide.button_type = templateSlide.button_type;
              slide.total_buttons = templateSlide.total_buttons;
              
              // Also update corresponding block slide
              const correspondingBlockSlide = block.value.slides[index];
              if (correspondingBlockSlide) {
                correspondingBlockSlide.buttons.forEach((button: any) => {
                  button.type = expectedButtonType;
                });
                
                // Remove excess buttons if needed
                if (correspondingBlockSlide.buttons.length > slide.total_buttons) {
                  const excessCount = correspondingBlockSlide.buttons.length - slide.total_buttons;
                  for (let i = 0; i < excessCount; i++) {
                    correspondingBlockSlide.buttons.pop();
                  }
                }
                
                // Re-check variables for this slide after button changes
                checkForVariables('slider', index);
              }
            }
          });
        }
        
        // Re-check variables for the current slide after button changes
        checkForVariables('slider', slideIndex);
      }
    } else {
      template.value.total_buttons = template.value.button_type == 'cta' ? 2 : 3;
    }
  };

  const canAddButton = (slideIndex?: number): boolean => {
    const isGeneric = template.value.type === 'generic';
    const isCTA = isGeneric
      ? template.value.slides[slideIndex || 0]?.button_type === 'cta'
      : template.value.button_type === 'cta';

    if (isGeneric) {
      // If slideIndex is provided, check that specific slide
      if (slideIndex !== undefined && slideIndex >= 0) {
        const blockSlide = block.value.slides[slideIndex];
        const slideButtons = blockSlide?.buttons || [];
        return slideButtons.length < (isCTA ? 2 : 1);
      } else {
        // Check the first slide (for backward compatibility)
        const blockSlide = block.value.slides[0];
        const slideButtons = blockSlide?.buttons || [];
        return slideButtons.length < (isCTA ? 2 : 1);
      }
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

    if (isGeneric) {
      // If slideIndex is provided, add button only to that specific slide
      if (slideIndex !== undefined && slideIndex >= 0) {
        const blockSlide = block.value.slides[slideIndex];
        
        if (blockSlide) {
          const newButton = {
            api: 1,
            error: false,
            type: 'postback',
            title: '',
            response: '',
            payload: '',
            url: '',
            signature_hash: ''
          };

          if (isCTA) {
            const existingButtons = blockSlide.buttons || [];
            const webUrlButtons = existingButtons.filter((btn: any) => btn.type === 'web_url');
            const phoneButtons = existingButtons.filter((btn: any) => btn.type === 'phone_number');
            
            // Maintain proper order: web_url first, then phone_number
            if (webUrlButtons.length === 0) {
              newButton.type = 'web_url';
            } else if (phoneButtons.length === 0) {
              newButton.type = 'phone_number';
            } else {
              // If both types exist, add web_url (this shouldn't happen with max 2 buttons)
              newButton.type = 'web_url';
            }
          }

          blockSlide.buttons.push(newButton);
          
          // Re-check variables for this slide after adding button
          checkForVariables('slider', slideIndex);
        }
      } else {
        // Add button to all slides (for backward compatibility)
        block.value.slides.forEach((blockSlide, _idx) => {
          if (blockSlide) {
            const newButton = {
              api: 1,
              error: false,
              type: 'postback',
              title: '',
              response: '',
              payload: '',
              url: '',
              signature_hash: ''
            };

            if (isCTA) {
              const existingButtons = blockSlide.buttons || [];
              const webUrlButtons = existingButtons.filter((btn: any) => btn.type === 'web_url');
              const phoneButtons = existingButtons.filter((btn: any) => btn.type === 'phone_number');
              
              // Maintain proper order: web_url first, then phone_number
              if (webUrlButtons.length === 0) {
                newButton.type = 'web_url';
              } else if (phoneButtons.length === 0) {
                newButton.type = 'phone_number';
              } else {
                // If both types exist, add web_url (this shouldn't happen with max 2 buttons)
                newButton.type = 'web_url';
              }
            }

            blockSlide.buttons.push(newButton);
            
            // Re-check variables for this slide after adding button
            checkForVariables('slider', _idx);
          }
        });
      }
    } else {
      const newButton = {
        type: 'postback',
        text: '',
        value: '',
        title: '',
        url: '',
        response: ''
      };

      if (isCTA) {
        const firstButtonType = block.value.buttons?.[0]?.type;
        newButton.type = firstButtonType === 'web_url' ? 'phone_number' : 'web_url';
      }

      block.value.buttons.push(newButton);
    }
  };

  const removeTheButton = (index: number, slideIndex = 0) => {
    if (template.value.type === 'generic') {
      // If slideIndex is provided, remove button only from that specific slide
      if (slideIndex !== undefined && slideIndex >= 0) {
        const blockSlide = block.value.slides[slideIndex];
        
        if (blockSlide && Array.isArray(blockSlide.buttons) && blockSlide.buttons.length > index) {
          blockSlide.buttons.splice(index, 1);
          
          // Re-check variables for this slide after removing button
          checkForVariables('slider', slideIndex);
        }
      } else {
        // Remove button from all slides (for backward compatibility)
        block.value.slides.forEach((blockSlide, _idx) => {
          if (blockSlide && Array.isArray(blockSlide.buttons) && blockSlide.buttons.length > index) {
            blockSlide.buttons.splice(index, 1);
            
            // Re-check variables for this slide after removing button
            checkForVariables('slider', _idx);
          }
        });
      }
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

    if (extensionMap[template.value.header] && !extensionMap[template.value.header].test(attachmentLink)) {
      errors.value.file = `Please enter a valid link, must be a ${template.value.header} file!`;
      block.value.attachment_link = '';
      return;
    }

    errors.value.file = '';
  };

  const onUpdateCarouselAttachmentLink = (slideIndex: number) => {
    const slide = template.value.slides[slideIndex];
    if (!slide) return;
    
    const attachmentLink = block.value.slides[slideIndex]?.attachment_link;
    
    if (typeof attachmentLink === 'string') {
      block.value.slides[slideIndex].attachment_link = attachmentLink.trim().replace(/ /g, '%20');
    }
    
    const extensionMap: Record<string, RegExp> = {
      image: /\.(jpg|jpeg|png|gif)$/i,
      video: /\.(mp4)$/i,
      document: /\.(pdf)$/i
    };

    if (extensionMap[slide.header] && !extensionMap[slide.header].test(attachmentLink)) {
      errors.value.file = `Please enter a valid link, must be a ${slide.header} file!`;
      block.value.slides[slideIndex].attachment_link = '';
      return;
    }

    errors.value.file = '';
  };

  const onUploadCarouselFile = async (event: Event, slideIndex: number) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const slide = template.value.slides[slideIndex];
    if (!slide) return;

    // Validate file type
    const extensionMap: Record<string, RegExp> = {
      image: /\.(jpg|jpeg|png|gif)$/i,
      video: /\.(mp4)$/i,
      document: /\.(pdf)$/i
    };

    if (extensionMap[slide.header] && !extensionMap[slide.header].test(file.name)) {
      errors.value.file = `Please select a valid ${slide.header} file!`;
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      // You would need to implement the actual upload API call here
      // const response = await axios.post("/upload-sample-file-whatsapp", formData);
      // if (response.data.status === 'success') {
      //   block.value.slides[slideIndex].attachment_link = response.data.file_handle;
      // }

      // For now, we'll just clear the error
      errors.value.file = '';
    } catch (error) {
      console.error('Upload failed:', error);
      errors.value.file = 'Upload failed';
    }
  };

  const getAcceptedFileTypes = (header: string): string => {
    switch (header) {
      case 'video':
        return 'video/mp4';
      case 'image':
        return 'image/*';
      case 'document':
        return '.pdf';
      default:
        return '*/*';
    }
  };

  return {
    // State
    views,
    template,
    block,
    errors,
    isSaving,
    
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
    createBlockSlide,
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
    onUpdateCarouselAttachmentLink,
    onUploadCarouselFile,
    canAddButton,
    getAcceptedFileTypes,
    addSlide,
removeSlide
  };
}); 