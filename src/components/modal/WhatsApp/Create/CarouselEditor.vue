<script setup lang="ts">
import { Input, Button, VueSelect } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";

const store = useWhatsAppTemplateStore();

const headerTypes = [
  { label: 'Text', value: 'text' },
  { label: 'Video', value: 'video' },
  { label: 'Image', value: 'image' },
  { label: 'Document', value: 'document' }
];

const buttonTypes = [
  { label: 'Postback', value: 'postback' },
  { label: 'Action', value: 'action' }
];

const actionTypes = [
  { label: 'Phone Number', value: 'phone' },
  { label: 'Web URL', value: 'url' }
];

const maxButtons = 3;

const addCarouselItem = () => {
  if (store.template.slides.length < 10) {
    store.template.slides.push(store.createSlide());
  }
};

const removeCarouselItem = (index: number) => {
  store.template.slides.splice(index, 1);
};

const addCarouselButton = (slideIndex: number) => {
  const slide = store.template.slides[slideIndex];
  if (slide.buttons.length < maxButtons) {
    slide.buttons.push({
      text: '',
      type: 'postback',
      value: '',
      actionType: 'phone'
    });
  }
};

const removeCarouselButton = (slideIndex: number, buttonIndex: number) => {
  store.template.slides[slideIndex].buttons.splice(buttonIndex, 1);
};

const handleButtonActionTypeChange = (slide: any, button: any, value: any) => {
  const singleValue = Array.isArray(value) ? value[0] : value;
  button.actionType = singleValue;
};

// Helper function for file icons
const getFileIcon = (fileType: string): string => {
  switch (fileType) {
    case 'image':
      return 'pi pi-image';
    case 'video':
      return 'pi pi-video';
    case 'document':
      return 'pi pi-file';
    default:
      return 'pi pi-file';
  }
};
</script>

<template>
  <div class="carousel-section">
    <div class="section-header">
      <h4>Carousel Items</h4>
      <Button
        v-if="store.template.slides.length < 10"
        variant="secondary"
        size="small"
        icon="pi pi-plus"
        @click="addCarouselItem"
      >
        Add Item
      </Button>
    </div>
    
    <div class="carousel-items">
      <div 
        v-for="(slide, index) in store.template.slides" 
        :key="index"
        class="carousel-item"
      >
        <div class="carousel-item-header">
          <span>Item {{ index + 1 }}</span>
          <div class="carousel-item-actions">
            <Button
              v-if="store.template.slides.length > 1"
              variant="error"
              size="small"
              icon="pi pi-times"
              @click="removeCarouselItem(index)"
            />
          </div>
        </div>
        
        <!-- Carousel Item Header -->
        <div class="form-group">
          <label>Header Type</label>
          <VueSelect
            :model-value="slide.header"
            @update:model-value="(value: any) => slide.header = value"
            :options="headerTypes"
            placeholder="Select header type"
          />
        </div>
        
        <div class="form-group">
          <label>Upload {{ slide.header }}</label>
          <div class="file-upload-field">
            <Input
              :value="slide.file?.name || ''"
              :placeholder="`Select ${slide.header}`"
              readonly
            />
            <Button
              variant="secondary"
              size="small"
              :icon="getFileIcon(slide.header)"
            >
              Upload
            </Button>
          </div>
        </div>
        
        <!-- Carousel Item Body -->
        <div class="form-group">
          <label>Body Text</label>
          <textarea 
            v-model="slide.body"
            placeholder="Enter body text..."
            class="carousel-body-textarea"
            rows="3"
          ></textarea>
        </div>
        
        <!-- Carousel Item Buttons -->
        <div class="form-group">
          <label>Button Type</label>
          <VueSelect
            :model-value="slide.buttonType || 'postback'"
            @update:model-value="(value: any) => slide.buttonType = value"
            :options="buttonTypes"
            placeholder="Select button type"
          />
        </div>
        
        <div class="carousel-buttons-list">
          <div 
            v-for="(button, buttonIndex) in slide.buttons" 
            :key="buttonIndex"
            class="button-item"
          >
            <div class="button-header">
              <span>Button {{ buttonIndex + 1 }}</span>
              <Button
                variant="error"
                size="small"
                icon="pi pi-times"
                @click="removeCarouselButton(index, buttonIndex)"
              />
            </div>
            
            <div class="form-group">
              <label>Button Text</label>
              <Input
                v-model="button.text"
                placeholder="Enter button text"
              />
            </div>
            
            <div v-if="slide.buttonType === 'action'" class="form-group">
              <label>Action Type</label>
              <VueSelect
                :model-value="button.actionType"
                @update:model-value="(value: any) => handleButtonActionTypeChange(slide, button, value)"
                :options="actionTypes"
                placeholder="Select action type"
              />
            </div>
            
            <div class="form-group">
              <label>{{ slide.buttonType === 'postback' ? 'Response' : 'Value' }}</label>
              <Input
                v-model="button.value"
                :placeholder="slide.buttonType === 'postback' ? 'Enter response' : 'Enter value'"
              />
            </div>
          </div>
          
          <Button
            v-if="slide.buttons.length < maxButtons"
            variant="secondary"
            size="small"
            icon="pi pi-plus"
            @click="addCarouselButton(index)"
          >
            Add Button
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-section {
  margin-bottom: var(--space-6);
}

.carousel-section h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.carousel-items {
  margin-top: var(--space-3);
}

.carousel-item {
  margin-bottom: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.carousel-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.carousel-item-header span {
  font-weight: 600;
  color: var(--color-text-primary);
}

.carousel-item-actions {
  display: flex;
  gap: var(--space-2);
}

.carousel-body-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.carousel-body-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.carousel-buttons-list {
  margin-top: var(--space-3);
}

.button-item {
  margin-bottom: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.button-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.button-header span {
  font-weight: 600;
  color: var(--color-text-primary);
}

.file-upload-field {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.file-upload-field .input {
  flex: 1;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}
</style> 