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
    } else if (section === 'body_slide') {
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

  const getVariableCount = (section: string): number => {
    if (section === 'header') {
      return template.value.variables.header ? 1 : 0;
    } else if (section === 'body') {
      return template.value.variables.body.length;
    } else if (section === 'body_slide') {
      // For body_slide, we need to check the specific slide
      // This will be handled by the component that calls this function
      return 0; // Placeholder - actual count will be determined by the slide index
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
      // Create first slide with proper structure
      const firstSlide = {
        header: 'image',
        body: '',
        button_type: 'postback', // Default to postback for first slide
        total_buttons: 1,
        buttons: [{
          type: 'postback',
          text: '',
          value: '',
          title: '',
          url: '',
          response: ''
        }],
        variables: {
          body: [],
          buttons: []
        }
      };
      
      template.value.slides = [firstSlide];
      
      // Initialize block.slides for carousel with matching structure
      block.value.slides = [{
        attachment_link: '',
        body: '',
        buttons: [{
          type: 'postback',
          text: '',
          value: '',
          title: '',
          url: '',
          response: ''
        }]
      }];
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
      const templateSlide = template.value.slides?.[slideIndex];
      const blockSlide = block.value.slides?.[slideIndex];
      
      if (templateSlide && blockSlide) {
        const templateButton = templateSlide.buttons?.[buttonIndex];
        const blockButton = blockSlide.buttons?.[buttonIndex];
        
        // Set default type if not set
        if (templateButton && !templateButton.type) {
          templateButton.type = 'web_url';
        }
        
        if (blockButton && !blockButton.type) {
          blockButton.type = 'web_url';
        }
        
        // Ensure both template and block buttons have the same type
        if (templateButton && blockButton) {
          const buttonType = templateButton.type || blockButton.type || 'web_url';
          templateButton.type = buttonType;
          blockButton.type = buttonType;
        }
      }
    } else {
      const button = block.value.buttons?.[buttonIndex];
      if (button && !button.type) {
        button.type = 'web_url';
      }
    }
  };

  const checkForVariables = (section?: string, btnIndex = null, slideIndex = 0) => {
    console.log(btnIndex)
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
    } else if (section === 'body_slide') {
      // Handle carousel slide body variables
      const slide = template.value.slides[slideIndex];
      if (!slide) return;
      
      // Initialize variables if not exists
      if (!slide.variables) {
        slide.variables = { body: [] };
      }
      if (!slide.variables.body) {
        slide.variables.body = [];
      }
      
      const variables = extractVariables(slide.body || '');
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
        if (!slide) return;
        
        // Initialize variables if not exists
        if (!slide.variables) {
          slide.variables = { buttons: [] };
        }
        if (!slide.variables.buttons) {
          slide.variables.buttons = [];
        }
        
        const button = slide.buttons?.[buttonIndex];
        if (!button) return;
        
        // Check for variables in title, text, and URL fields
        const titleVariables = extractVariables(button.title || '');
        const textVariables = extractVariables(button.text || '');
        const urlVariables = extractVariables(button.url || '');
        const allVariables = [...titleVariables, ...textVariables, ...urlVariables];
        
        if (allVariables.length > 0) {
          // Update or add button variable
          const existingIndex = slide.variables.buttons.findIndex((v: any) => v.buttonIndex === buttonIndex);
          if (existingIndex >= 0) {
            slide.variables.buttons[existingIndex] = {
              buttonIndex,
              key: `{{${allVariables[0]}}}`,
              value: ''
            };
          } else {
            slide.variables.buttons.push({
              buttonIndex,
              key: `{{${allVariables[0]}}}`,
              value: ''
            });
          }
        } else {
          // Remove button variable if no variables found
          slide.variables.buttons = slide.variables.buttons.filter((v: any) => v.buttonIndex !== buttonIndex);
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
          template.value.variables.buttons = template.value.variables.buttons.filter((v: any) => v.buttonIndex !== buttonIndex);
        }
      }
    }
  };

  const addVariable = (section?: string,  addNew = true, btnIndex = null, slideIndex = 0) => {
    console.log(addNew, btnIndex)
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
    } else if (section === 'body_slide') {
      // Handle carousel slide body variables
      const slide = template.value.slides[slideIndex];
      if (!slide) return;
      
      // Initialize variables if not exists
      if (!slide.variables) {
        slide.variables = { body: [] };
      }
      if (!slide.variables.body) {
        slide.variables.body = [];
      }
      
      const currentText = slide.body || '';
      const nextVarNum = extractVariables(currentText).length + 1;
      const cursorPos = (document.querySelector(`#emoji-textarea_slide${slideIndex}`) as HTMLTextAreaElement)?.selectionStart || currentText.length;
      
      const newText = currentText.slice(0, cursorPos) + `{{${nextVarNum}}}` + currentText.slice(cursorPos);
      slide.body = newText;
      checkForVariables('body_slide', null, slideIndex);
    } else if (section?.startsWith('button')) {
      const buttonIndex = parseInt(section.split('_')[1]);
      const isGeneric = template.value.type === 'generic';
      
      if (isGeneric && slideIndex !== undefined && slideIndex >= 0) {
        // Handle carousel slide button variables
        const slide = template.value.slides[slideIndex];
        if (!slide) return;
        
        const button = slide.buttons?.[buttonIndex];
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
          checkForVariables(`button_${buttonIndex}`, null, slideIndex);
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
          checkForVariables(`button_${buttonIndex}`, null, slideIndex);
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

  const createSlide = () => {
    // Get the current button type from the first slide if it exists
    const firstSlide = template.value.slides[0];
    const currentButtonType = firstSlide?.button_type || 'postback';
    
    // Determine the expected button type for individual buttons
    const expectedButtonType = currentButtonType === 'cta' ? 'web_url' : 'postback';
    
         // Clone buttons from the first template slide if it exists, preserving their types
     const clonedButtons = firstSlide?.buttons?.map((button: any) => ({
       ...button,
       title: "",
       response: "",
       payload: "",
       url: "",
       // Preserve the button type
       type: button.type || expectedButtonType
     })) || [{
       type: expectedButtonType,
       text: '',
       value: '',
       title: '',
       url: '',
       response: ''
     }];
    
    return {
      header: 'image',
      body: '',
      button_type: currentButtonType,
      total_buttons: clonedButtons.length,
      buttons: clonedButtons,
      variables: {
        body: [],
        buttons: []
      }
    }
  };

  const createBlockSlide = () => {
    // Get the current button type from the first slide if it exists
    const firstSlide = template.value.slides[0];
    const currentButtonType = firstSlide?.button_type || 'postback';
    
    // Determine the expected button type for individual buttons
    const expectedButtonType = currentButtonType === 'cta' ? 'web_url' : 'postback';
    
    // Clone buttons from the first template slide if it exists, preserving their types
    const clonedButtons = firstSlide?.buttons?.map((button: any) => ({
      ...button,
      title: "",
      response: "",
      payload: "",
      url: "",
      // Preserve the button type
      type: button.type || expectedButtonType
    })) || [{
      type: expectedButtonType,
      text: '',
      value: '',
      title: '',
      url: '',
      response: ''
    }];
    
    return {
      attachment_link: '',
      body: '',
      buttons: clonedButtons
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
    return !block.value.text || !template.value.category || !block.value.language;
  };

  const validateData = () => {
    // Basic validation
    if (!block.value.text || !template.value.category || !block.value.language) {
      window.$toast?.error('Please fill all required fields');
      return false;
    }
    
    // Additional validation for carousel templates
    if (template.value.type === 'generic') {
      // Check if all slides have required content
      for (let i = 0; i < template.value.slides.length; i++) {
        const slide = template.value.slides[i];
        
        // Check if slide body is filled
        if (!slide.body || slide.body.trim() === '') {
          window.$toast?.error(`Please fill the body for slide ${i + 1}`);
          return false;
        }
        
        // Check if at least one button is filled
        const hasFilledButton = slide.buttons?.some((button: any) => 
          (button.title && button.title.trim() !== '') || 
          (button.text && button.text.trim() !== '') ||
          (button.url && button.url.trim() !== '')
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
        if (slide.buttons && slide.buttons.length > 0) {
          const firstButtonType = slide.buttons[0]?.type;
          const inconsistentButtons = slide.buttons.some((button: any, index: number) => {
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

    try {
      // Create copies of the data to modify
      const dataBlock = { ...block.value };
      const cTemp = { ...template.value };
      
      console.log('Original template:', cTemp);
      console.log('Original block:', dataBlock);

      // If Template base type is text
      if (cTemp.type === 'text') {
        cTemp.header = 'text';
        cTemp.bodyIncludes = ['body'];
        dataBlock.buttons = [];
        cTemp.variables = {
          header: null,
          body: [],
          buttons: []
        };
        cTemp.header_text = '';
        cTemp.footer_text = '';
      }

      // If it is text template (or) if it is media template but header is removed
      if (cTemp.header === 'text' && cTemp.type !== 'generic') {
        (dataBlock as any).type = 'button';
        dataBlock.image_url = '';
        dataBlock.video_url = '';
        dataBlock.attachment_link = '/theme/images/file-cover.png';
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
        cTemp.variables.buttons = [];
      }

      // if template does not include footer, remove footer text
      if (!cTemp.bodyIncludes.includes('footer')) {
        cTemp.footer_text = '';
      }

      // If There is no URL Button but variable is set previously, reset it while saving.
      if (cTemp.variables.buttons && cTemp.variables.buttons.length > 0) {
        const urlButton = dataBlock.buttons.find((button: any) => button.type === 'web_url');
        if (!urlButton) {
          cTemp.variables.buttons = [];
        }
      }

      // For carousel templates, preserve slides data
      if (cTemp.type === 'generic') {
        // Keep slides in both template and block
        console.log('Preserving carousel slides:', cTemp.slides);
        console.log('Preserving block slides:', dataBlock.slides);
        
        // Ensure slides have proper structure
        if (cTemp.slides && cTemp.slides.length > 0) {
          cTemp.slides.forEach((slide: any, index: number) => {
            console.log(`Slide ${index + 1} template data:`, slide);
            if (dataBlock.slides && dataBlock.slides[index]) {
              console.log(`Slide ${index + 1} block data:`, dataBlock.slides[index]);
            }
          });
        }
      } else {
        // Remove slides for non-carousel templates
        if ('slides' in cTemp) delete (cTemp as any).slides;
        if ('slides' in dataBlock) delete (dataBlock as any).slides;
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
            payload: button.type === 'postback' ? button.response || '' : null
          };
        }
      });

      const templateData = {
        name: cTemp.name || 'Template',
        text: dataBlock.text,
        language: dataBlock.language,
        template_specs: {
          category: cTemp.category,
          header: cTemp.header,
          button_type: cTemp.category === 'AUTHENTICATION' ? 'otp' : (cTemp.type === 'media' ? 'cta' : 'qr'),
          footer_text: cTemp.footer_text,
          variables: cTemp.variables || {},
          bodyIncludes: cTemp.bodyIncludes,
          // Preserve slides for carousel
          ...(cTemp.type === 'generic' && { slides: cTemp.slides })
        },
        buttons: formattedButtons,
        image_url: "",
        attachment_link: "",
        // Preserve slides in block for carousel
        ...(cTemp.type === 'generic' && { slides: dataBlock.slides })
      };

      console.log('Final template data to send:', templateData);

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

  // Check if body is filled
  if (!firstSlide.body || firstSlide.body.trim() === '') {
    window.$toast?.error('Please fill the carousel body before adding more slides');
    return;
  }

  // Check if at least one button is filled
  // The ButtonsEditor works with template slide buttons, so we need to check firstSlide.buttons
  console.log('Validating buttons for first slide:', firstSlide.buttons);
  console.log('First slide button_type:', firstSlide.button_type);
  console.log('First slide total_buttons:', firstSlide.total_buttons);
  
  // Check if buttons array exists and has proper structure
  if (!firstSlide.buttons || !Array.isArray(firstSlide.buttons)) {
    console.log('Error: firstSlide.buttons is not properly initialized');
    window.$toast?.error('Please complete the first slide before adding more');
    return;
  }
  
  let hasFilledButton = firstSlide.buttons.some((button: any) => {
    const hasTitle = button.title && button.title.trim() !== '';
    const hasText = button.text && button.text.trim() !== '';
    const hasUrl = button.url && button.url.trim() !== '';
    
    console.log('Button validation:', { 
      button, 
      hasTitle, 
      hasText, 
      hasUrl, 
      isFilled: hasTitle || hasText || hasUrl 
    });
    
    return hasTitle || hasText || hasUrl;
  });

  console.log('Has filled button:', hasFilledButton);
  console.log('First block slide buttons (for comparison):', firstBlockSlide.buttons);

  // If no filled button found in template slide, check block slide as fallback
  if (!hasFilledButton && firstBlockSlide.buttons && Array.isArray(firstBlockSlide.buttons)) {
    console.log('Checking block slide buttons as fallback...');
    const hasFilledButtonInBlock = firstBlockSlide.buttons.some((button: any) => {
      const hasTitle = button.title && button.title.trim() !== '';
      const hasText = button.text && button.text.trim() !== '';
      const hasUrl = button.url && button.url.trim() !== '';
      
      console.log('Block button validation:', { 
        button, 
        hasTitle, 
        hasText, 
        hasUrl, 
        isFilled: hasTitle || hasText || hasUrl 
      });
      
      return hasTitle || hasText || hasUrl;
    });
    
    console.log('Has filled button in block:', hasFilledButtonInBlock);
    
    if (hasFilledButtonInBlock) {
      // Synchronize the filled data from block to template
      firstBlockSlide.buttons.forEach((blockButton: any, index: number) => {
        if (firstSlide.buttons[index]) {
          firstSlide.buttons[index] = { ...blockButton };
        }
      });
      console.log('Synchronized button data from block to template');
      hasFilledButton = true;
    }
  }

  if (!hasFilledButton) {
    window.$toast?.error('Please fill at least one button before adding more slides');
    return;
  }

  // Ensure button types are properly synchronized before cloning
  if (firstSlide && firstBlockSlide) {
    firstSlide.buttons.forEach((templateButton: any, index: number) => {
      const blockButton = firstBlockSlide.buttons[index];
      if (blockButton) {
        // Ensure both buttons have the same type
        const buttonType = templateButton.type || blockButton.type || 'postback';
        templateButton.type = buttonType;
        blockButton.type = buttonType;
      }
    });
  }

  const slideIndex = template.value.slides.length;
  
  console.log('Adding slide at index:', slideIndex);
  console.log('Current template slides:', template.value.slides);
  console.log('Current block slides:', block.value.slides[0]?.buttons);
  
  console.log('First slide button type:', firstSlide?.button_type);
  console.log('First slide buttons:', firstSlide?.buttons);
  console.log('First block slide buttons:', firstBlockSlide?.buttons);
  
  // Ensure the first block slide buttons are synchronized with the template slide button type
  if (firstSlide && firstBlockSlide) {
    const expectedButtonType = firstSlide.button_type === 'cta' ? 'web_url' : 'postback';
    
    // Update the first block slide buttons to match the template slide button type
    firstBlockSlide.buttons.forEach((button: any) => {
      if (button.type !== expectedButtonType) {
        button.type = expectedButtonType;
      }
    });
  }
  
  // Clone buttons from the first slide if it exists, preserving their types
  const clonedButtons = firstSlide?.buttons?.map((button: any) => {
    const clonedButton = {
      ...button,
      title: "",
      response: "",
      payload: "",
      url: "",
      // Preserve the button type from the first slide
      type: button.type || 'postback'
    };
    
    console.log('Cloning button:', { 
      originalType: button.type, 
      clonedType: clonedButton.type,
      originalButton: button,
      clonedButton: clonedButton
    });
    
    return clonedButton;
  }) || [{
    type: 'postback',
    text: '',
    value: '',
    title: '',
    url: '',
    response: ''
  }];

  console.log('Cloned buttons:', clonedButtons);

  // Create a new block slide with cloned buttons
  const blockSlide = {
    attachment_link: '',
    body: '',
    buttons: clonedButtons
  };

  block.value.slides.push(blockSlide);

  // Clone the first template slide structure with current button type
  const currentButtonType = firstSlide?.button_type || 'postback';
  const currentTotalButtons = firstSlide?.total_buttons || 1;
  
  const templateSlide = {
    header: 'image',
    body: '',
    button_type: currentButtonType, // Use the current button type from first slide
    total_buttons: currentTotalButtons,
    buttons: clonedButtons,
    variables: {
      body: [],
      buttons: []
    }
  };

  template.value.slides.push(templateSlide);
  
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
  
  console.log('After adding slide - Template slides:', template.value.slides);
  console.log('After adding slide - Block slides:', block.value.slides);
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
        
        // Update button types in both template and block slides to match the button_type
        const expectedButtonType = templateSlide.button_type === 'cta' ? 'web_url' : 'postback';
        
        // Update template slide buttons
        templateSlide.buttons.forEach((button: any) => {
          button.type = expectedButtonType;
        });
        
        // Update block slide buttons
        blockSlide.buttons.forEach((button: any) => {
          button.type = expectedButtonType;
        });
        
        // Remove excess buttons if needed
        if (blockSlide.buttons.length > templateSlide.total_buttons) {
          const excessCount = blockSlide.buttons.length - templateSlide.total_buttons;
          for (let i = 0; i < excessCount; i++) {
            blockSlide.buttons.pop();
            templateSlide.buttons.pop();
          }
        }
        
        // If this is the first slide, update all other slides to match
        if (slideIndex === 0) {
          template.value.slides.forEach((slide: any, index: number) => {
            if (index > 0) { // Skip first slide as it's already updated
              slide.button_type = templateSlide.button_type;
              slide.total_buttons = templateSlide.total_buttons;
              
              // Update button types in this slide
              slide.buttons.forEach((button: any) => {
                button.type = expectedButtonType;
              });
              
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
                    slide.buttons.pop();
                  }
                }
              }
            }
          });
        }
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
        const slideButtons = template.value.slides[slideIndex]?.buttons || [];
        return slideButtons.length < (isCTA ? 2 : 1);
      } else {
        // Check the first slide (for backward compatibility)
        const slideButtons = template.value.slides[0]?.buttons || [];
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

    const newButtonTemplate = {
      type: 'postback',
      text: '',
      value: '',
      title: '',
      url: '',
      response: ''
    };

    if (isGeneric) {
      // If slideIndex is provided, add button only to that specific slide
      if (slideIndex !== undefined && slideIndex >= 0) {
        const slide = template.value.slides[slideIndex];
        const blockSlide = block.value.slides[slideIndex];
        
        if (slide && blockSlide) {
          const newButton = { ...newButtonTemplate };

          if (isCTA) {
            const existingButtons = slide.buttons || [];
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
            
            console.log('Adding CTA button:', { 
              existingButtons: existingButtons.map((b: any) => b.type),
              newButtonType: newButton.type,
              webUrlCount: webUrlButtons.length,
              phoneCount: phoneButtons.length
            });
          }

          // Add button to both template and block slides
          slide.buttons.push(newButton);
          blockSlide.buttons.push({ ...newButton });
        }
      } else {
        // Add button to all slides (for backward compatibility)
        template.value.slides.forEach((slide, idx) => {
          const blockSlide = block.value.slides[idx];
          if (slide && blockSlide) {
            const newButton = { ...newButtonTemplate };

            if (isCTA) {
              const existingButtons = slide.buttons || [];
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
              
              console.log('Adding CTA button (backward compatibility):', { 
                existingButtons: existingButtons.map((b: any) => b.type),
                newButtonType: newButton.type,
                webUrlCount: webUrlButtons.length,
                phoneCount: phoneButtons.length
              });
            }

            slide.buttons.push(newButton);
            blockSlide.buttons.push({ ...newButton });
          }
        });
      }
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
      // If slideIndex is provided, remove button only from that specific slide
      if (slideIndex !== undefined && slideIndex >= 0) {
        const slide = template.value.slides[slideIndex];
        const blockSlide = block.value.slides[slideIndex];
        
        if (slide && Array.isArray(slide.buttons) && slide.buttons.length > index) {
          slide.buttons.splice(index, 1);
        }
        
        if (blockSlide && Array.isArray(blockSlide.buttons) && blockSlide.buttons.length > index) {
          blockSlide.buttons.splice(index, 1);
        }
      } else {
        // Remove button from all slides (for backward compatibility)
        template.value.slides.forEach((slide, idx) => {
          const blockSlide = block.value.slides[idx];
          
          if (Array.isArray(slide.buttons) && slide.buttons.length > index) {
            slide.buttons.splice(index, 1);
          }
          
          if (blockSlide && Array.isArray(blockSlide.buttons) && blockSlide.buttons.length > index) {
            blockSlide.buttons.splice(index, 1);
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
      errors.value.file = { [template.value.header]: `Please enter a valid link, must be a ${template.value.header} file!` };
      block.value.attachment_link = '';
      return;
    }

    errors.value.file = {};
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
      errors.value.file = { [slide.header]: `Please enter a valid link, must be a ${slide.header} file!` };
      block.value.slides[slideIndex].attachment_link = '';
      return;
    }

    errors.value.file = {};
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
      errors.value.file = { [slide.header]: `Please select a valid ${slide.header} file!` };
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
      errors.value.file = {};
    } catch (error) {
      console.error('Upload failed:', error);
      errors.value.file = { [slide.header]: 'Upload failed' };
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