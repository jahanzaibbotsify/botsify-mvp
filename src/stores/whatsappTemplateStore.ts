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
    otpLength: '6',
    otpExpiry: '1',
    variables: {} as any
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
    const text = section === 'header' ? template.value.header_text : block.value.text;
    const count = countVariables(text);
    return count < 1; // Header allows only 1 variable
  };

  const getVariableCount = (section: string): number => {
    const text = section === 'header' ? template.value.header_text : block.value.text;
    return countVariables(text);
  };

  // Methods
  const afterSelect = () => {
    // Handle after select
  };

  const onChangeCategory = () => {
    if (template.value.category === 'AUTHENTICATION') {
      // Auto-fill authentication template
      block.value.text = '{{1}} is your verification code. For security do not share this code.';
      template.value.footer_text = 'This code will expire in 1 minutes.';
      block.value.buttons[0].type = 'postback';
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
    block.value.image_url = '';
    block.value.video_url = '';
    block.value.attachment_link = '';
  };

  const onChangeCta = (buttonIndex: number, fieldIndex: number) => {
    // Handle CTA change
  };

  const checkForVariables = (section?: string) => {
    // Check for variables in text
  };

  const addVariable = (section?: string) => {
    // Check if we can add more variables
    if (!canAddVariable(section || 'body')) {
      return;
    }

    const currentText = section === 'header' ? template.value.header_text : block.value.text;
    const nextVarNum = extractVariables(currentText).length + 1;
    const cursorPos = (document.querySelector(`.${section}-textarea`) as HTMLTextAreaElement)?.selectionStart || currentText.length;
    
    const newText = currentText.slice(0, cursorPos) + `{{${nextVarNum}}}` + currentText.slice(cursorPos);
    
    if (section === 'header') {
      template.value.header_text = newText;
    } else {
      block.value.text = newText;
    }
  };

  const removeVariable = (section?: string) => {
    const currentText = section === 'header' ? template.value.header_text : block.value.text;
    const newText = currentText.replace(/\{\{\d+\}\}/g, '');
    
    if (section === 'header') {
      template.value.header_text = newText;
    } else {
      block.value.text = newText;
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
      const formattedButtons = block.value.buttons.map(button => ({
        api: button.type === 'postback' ? 0 : 1,
        type: button.type === 'postback' ? 'postback' : (button.type === 'web_url' ? 'url' : 'phone_number'),
        url: button.type === 'web_url' ? button.url : null,
        title: button.text || button.title || '',
        payload: button.type === 'postback' ? button.response || '' : null
      }));

      const templateData = {
        name: template.value.name || 'Template',
        text: block.value.text,
        language: block.value.language,
        template_specs: {
          category: template.value.category,
          header: template.value.header,
          button_type: template.value.type === 'media' ? 'cta' : 'qr',
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
      otpLength: '6',
      otpExpiry: '1',
      variables: {} as any
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

  const addTheButton = () => {
    // Add button logic
  };

  const removeTheButton = () => {
    // Remove button logic
  };

  const onButtonTypeChange = () => {
    // Button type change logic
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
    onButtonTypeChange
  };
}); 