import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePublishStore } from './publishStore';

export const useWhatsAppTemplateStore = defineStore('whatsappTemplate', () => {
  // Store
  const publishStore = usePublishStore();

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
    footer_text: '',
    slides: [] as any[],
    otpLength: '6',
    otpExpiry: '1',
    variables: {} as any
  });

  const block = ref({
    language: 'en',
    text: '',
    buttons: [
      {
        type: 'postback',
        text: '',
        value: ''
      }
    ],
    attachment_link: '',
    slides: [] as any[]
  });

  const errors = ref({
    body: '',
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

  const onChangeCta = (buttonIndex: number, fieldIndex: number) => {
    // Handle CTA change
  };

  const checkForVariables = (section?: string) => {
    // Check for variables in text
  };

  const addVariable = () => {
    const currentText = block.value.text;
    const nextVarNum = extractVariables(currentText).length + 1;
    const cursorPos = (document.querySelector('.body-textarea') as HTMLTextAreaElement)?.selectionStart || currentText.length;
    
    const newText = currentText.slice(0, cursorPos) + `{{${nextVarNum}}}` + currentText.slice(cursorPos);
    block.value.text = newText;
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
      const templateData = {
        name: template.value.name || 'Template',
        category: template.value.category,
        language: block.value.language,
        type: template.value.type,
        body: block.value.text,
        footer: template.value.footer_text,
        buttons: block.value.buttons,
        bodyIncludes: template.value.bodyIncludes,
        slides: template.value.slides,
        otpLength: template.value.otpLength,
        otpExpiry: template.value.otpExpiry
      };

      const result = await publishStore.createTemplate(templateData);
      
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
      footer_text: '',
      slides: [] as any[],
      otpLength: '6',
      otpExpiry: '1',
      variables: {} as any
    };
    block.value = {
      language: 'en',
      text: '',
      buttons: [{ type: 'postback', text: '', value: '' }],
      attachment_link: '',
      slides: [] as any[]
    };
    views.value = { fields: 'current', settings: 'hidden' };
    errors.value = {
      body: '',
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
    
    // Methods
    afterSelect,
    onChangeCategory,
    onChangeTemplateType,
    onChangeCta,
    checkForVariables,
    addVariable,
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