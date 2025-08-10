<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Input, Badge, Button, ModalLayout } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import MessagePreview from "./Create/MessagePreview.vue";

// Props
interface Props {
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  paginationData?: {
    page: number;
    perPage: number;
    total: number;
    to: number;
    prev_page_url: string | null;
  } | null;
  itemsPerPage?: number;
  isLoadingTemplates?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  currentPage: 1,
  totalPages: 1,
  paginationData: null,
  itemsPerPage: 20,
  isLoadingTemplates: false
});

// Store
const publishStore = usePublishStore();

// Emits
const emit = defineEmits<{
  'create-template': [block: any];
  'delete-template': [id: number];
  'clone-template': [block: any];
  'preview-template': [block: any];
  'copy-payload': [block: any];
  'open-create-modal': [];
  'close-whatsapp-modal': [];
  'search-templates': [params: { query: string; page: number }];
  'set-templates': [templatesData: any];
  'fetch-templates': [page: number, perPage: number];
  'page-change': [page: number];
  'pagination-update': [paginationData: {
    page: number;
    perPage: number;
    total: number;
    to: number;
    prev_page_url: string | null;
  } | null];
  'set-loading': [loading: boolean];
}>();

// Local reactive data
const templates = ref<any[]>([]);

const searchQuery = ref('');
// Remove local pagination state since it's now managed by parent
// const currentPage = ref(1);
// const itemsPerPage = 20; // Match the API per_page default
// const isLoadingTemplates = ref(false);
const isTemplatesLoaded = ref(false);

// Preview modal state
const previewModalRef = ref<InstanceType<typeof ModalLayout> | null>(null);
const selectedPreviewTemplate = ref<any>(null);
const previewTemplateData = ref<any>(null);

// Computed properties
const filteredTemplates = computed(() => {
  // For server-side pagination, we don't filter locally
  // The API should handle filtering
  return templates.value;
});

const paginatedTemplates = computed(() => {
  // For server-side pagination, all templates are already paginated
  return filteredTemplates.value;
});

const totalPages = computed(() => {
  if (props.paginationData) {
    return Math.ceil(props.paginationData.total / props.paginationData.perPage);
  }
  return 1;
});

// Methods
const fetchTemplates = async (page: number = 1, perPage: number = 20) => {
  // Prevent multiple simultaneous calls
  if (props.isLoadingTemplates) return;
  
  // If templates are already loaded for the same page, use cached data
  if (isTemplatesLoaded.value && props.paginationData && props.paginationData.page === page) {
    return;
  }
  
  // Emit loading state to parent
  emit('set-loading', true);
  
  try {
    const result = await publishStore.fetchWhatsAppTemplates(page, perPage);
    if (result.success && result.data && result.data.templates && result.data.templates.data && Array.isArray(result.data.templates.data)) {
      templates.value = result.data.templates.data;
      
      // Emit pagination update to parent
      const paginationData = {
        page: result.data.templates.page || page,
        perPage: result.data.templates.per_page || perPage,
        total: result.data.templates.total || 0,
        to: result.data.templates.to || 0,
        prev_page_url: result.data.templates.prev_page_url || null
      };
      
      emit('pagination-update', paginationData);
      isTemplatesLoaded.value = true;
    } else {
      console.warn('No templates data or invalid format:', result);
      templates.value = [];
      emit('pagination-update', null);
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    templates.value = [];
    emit('pagination-update', null);
  } finally {
    // Emit loading state to parent
    emit('set-loading', false);
  }
};

const setTemplates = (templatesData: any) => {
  if (templatesData && templatesData.data) {
    templates.value = templatesData.data;
    
    // Emit pagination update to parent
    const paginationData = {
      page: templatesData.page || 1,
      perPage: templatesData.per_page || 20,
      total: templatesData.total || 0,
      to: templatesData.to || 0,
      prev_page_url: templatesData.prev_page_url || null
    };
    
    emit('pagination-update', paginationData);
    isTemplatesLoaded.value = true;
  } else {
    templates.value = [];
    emit('pagination-update', null);
  }
};

const openCreateModal = () => {
  // Emit to close WhatsApp modal and open create modal
  emit('close-whatsapp-modal');
  emit('open-create-modal');
};

const deleteTemplate = async (id: number) => {
  try {
    window.$confirm({
      text: "Are you sure you want to delete this template?",
    }, async () => {
      const result = await publishStore.deleteWhatsAppTemplate(id);
      if (result.success) {
        // Remove from local state
        templates.value = templates.value.filter(template => template.id !== id);
        window.$toast?.success('Template deleted successfully!');
        
        // Refresh templates if we're on the last page and it's now empty
        if (templates.value.length === 0 && props.paginationData && props.paginationData.page > 1) {
          fetchTemplates(props.paginationData.page - 1, props.itemsPerPage);
        }
      } else {
        window.$toast?.error('Failed to delete template');
      }
    });
  } catch (error) {
    console.error('Failed to delete template:', error);
    window.$toast?.error('Failed to delete template');
  }
};

// const cloneTemplate = async (template: any) => {
//   try {
//     // Create a clone of the template
//     const clonedTemplate = {
//       ...template,
//       id: undefined, // Remove ID so it creates a new one
//       template_name: `${template.template_name || template.name} (Copy)`,
//       name: `${template.template_name || template.name} (Copy)`,
//       created_at: new Date().toISOString().split('T')[0],
//       status: 0 // Set as not approved initially
//     };
    
//     // Call the API to create the cloned template
//     const result = await publishApi.createTemplate(clonedTemplate);
//     if (result.success) {
//       window.$toast?.success('Template cloned successfully!');
//       // Refresh templates to show the new cloned template
//       fetchTemplates(currentPage.value, itemsPerPage);
//     } else {
//       window.$toast?.error('Failed to clone template');
//     }
//   } catch (error) {
//     console.error('Failed to clone template:', error);
//     window.$toast?.error('Failed to clone template');
//   }
// };

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
              value: btn.text || ''
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
    });
  }

  return processedTemplate;
};

const previewTemplate = (template: any) => {
  console.log('Previewing template:', template);
  
  // Process the template data for preview
  const processedTemplate = processTemplateForPreview(template);
  
  // Set the preview data
  selectedPreviewTemplate.value = template;
  previewTemplateData.value = processedTemplate;
  
  // Show the preview modal
  previewModalRef.value?.openModal();
};

const copyPayload = (template: any) => {
  const payload = JSON.stringify(template, null, 2);
  navigator.clipboard.writeText(payload);
  window.$toast?.success('Template payload copied to clipboard!');
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
  // Reset to first page when searching
  fetchTemplates(1, props.itemsPerPage);
};

// Initialize templates when component is mounted
onMounted(() => {
  // Don't fetch templates on mount - wait for tab activation
  fetchTemplates(1, props.itemsPerPage);
});

// Expose methods for parent component
defineExpose({
  totalPages,
  filteredTemplates,
  setTemplates,
  paginationData: computed(() => props.paginationData),
  fetchTemplates,
  isLoadingTemplates: computed(() => props.isLoadingTemplates)
});
</script>

<template>
  <div class="tab-panel">
    <div class="search-section">
      <div class="search-create-wrapper">
        <Input 
          v-model="searchQuery" 
          placeholder="Search templates..."
          searchable
          @search="handleSearch"
        />
        
        <Button 
          variant="primary"
          icon="pi pi-plus"
          @click="openCreateModal"
        >
          Create
        </Button>
      </div>
    </div>

    <div class="table-section">
      <Table>
        <TableHead>
          <TableHeader>Name</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader>Language</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Date</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableHead>
        
        <TableBody>
          <!-- Loading skeleton -->
          <TableRow v-if="props.isLoadingTemplates" v-for="i in 5" :key="`skeleton-${i}`" skeleton>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="badge"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="actions"></TableCell>
          </TableRow>
          
          <!-- Empty state -->
          <TableRow v-else-if="paginatedTemplates.length === 0" noData>
            <TableCell noData colspan="6">
              <div class="empty-state">
                <i class="pi pi-file-o"></i>
                <p>No templates found</p>
              </div>
            </TableCell>
          </TableRow>
          
          <!-- Template rows -->
          <TableRow v-else v-for="template in paginatedTemplates" :key="template.id">
            <TableCell>{{ template.template_name || template.name }}</TableCell>
            <TableCell>{{ template.type }}</TableCell>
            <TableCell>{{ template.language || 'en' }}</TableCell>
            <TableCell>
              <Badge 
                :variant="template.status === 1 ? 'success' : 'warning'"
                size="small"
              >
                {{ template.status === 1 ? 'Approved' : 'Not Approved' }}
              </Badge>
            </TableCell>
            <TableCell>{{ new Date(template.created_at).toLocaleDateString() }}</TableCell>
            <TableCell>
              <div class="action-buttons">
                <Button
                  variant="error-outline"
                  size="small"
                  icon="pi pi-trash"
                  iconOnly
                  @click="deleteTemplate(template.id)"
                  title="Delete template"
                />
                <!-- <Button
                  variant="primary-outline"
                  size="small"
                  icon="pi pi-copy"
                  iconOnly
                  @click="cloneTemplate(template)"
                  title="Clone template"
                /> -->
                <Button
                  variant="success-outline"
                  size="small"
                  icon="pi pi-eye"
                  iconOnly
                  @click="previewTemplate(template)"
                  title="Preview template"
                />
                <Button
                  variant="warning-outline"
                  size="small"
                  icon="pi pi-id-card"
                  iconOnly
                  @click="copyPayload(template)"
                  title="Copy payload"
                />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>



    <!-- Template Preview Modal -->
    <ModalLayout
      ref="previewModalRef"
      title="Template Preview"
      :max-width="'600px'"
    >
      <div v-if="selectedPreviewTemplate" class="template-info">
        <div class="template-details">
          <h4>{{ selectedPreviewTemplate.template_name || selectedPreviewTemplate.name }}</h4>
          <div class="template-meta">
            <span class="template-type">{{ selectedPreviewTemplate.type }}</span>
            <span class="template-language">{{ selectedPreviewTemplate.language || 'en' }}</span>
            <Badge 
              :variant="selectedPreviewTemplate.status === 1 ? 'success' : 'warning'"
              size="small"
            >
              {{ selectedPreviewTemplate.status === 1 ? 'Approved' : 'Not Approved' }}
            </Badge>
          </div>
        </div>
      </div>
      
      <div class="preview-content">
        <MessagePreview 
          v-if="previewTemplateData"
          :template="previewTemplateData"
          :block="{ text: previewTemplateData.body_text || '', buttons: previewTemplateData.buttons || [] }"
          :show-title="false"
        />
      </div>
    </ModalLayout>
  </div>
</template>

<style scoped>
.search-section {
  margin-bottom: var(--space-4);
}

.search-create-wrapper {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: end;
}

.table-section {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: var(--space-1);
  align-items: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--color-text-tertiary);
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}



.template-info {
  margin-bottom: var(--space-4);
}

.template-details h4 {
  margin: 0 0 var(--space-2) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.template-meta {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.template-type,
.template-language {
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.preview-content {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
}
</style> 