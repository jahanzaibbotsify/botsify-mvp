<template>
  <div class="form-group" v-show="show">
    <div class="buttons-header">
      <p class="buttons-label">buttons</p>
              <div class="buttons-controls" v-if="current == null || current <= 0">
          <Button
            type="button"
            @click="handleAddButton"
            variant="primary"
            size="small"
            :disabled="!canAddButton || props.disableControls"
          >
            Add button <i class="fa fa-plus"></i>
          </Button>
          <div class="button-type-selector" v-if="current == null || current <= 0">
                         <VueSelect
               @close="store.afterSelect"
               :clearable="false"
               v-model="props.template.button_type"
               :reduce="(b: any) => b.value"
               placeholder="Select Button Type"
               :options="buttonTypeOptions"
               @change="() => store.onButtonTypeChange(props.slideIndex)"
               :disabled="shouldDisableButtonType || props.disableControls"
             />

            <i
              v-if="current !== null && current !== undefined"
              class="fa fa-info-circle fa-lg text-info"
              title="All slide buttons must have the same label length and button type (e.g., all CTA or all Postback)."
            ></i>
          </div>
        </div>
    </div>

    <div class="buttons-body">
              <div
          class="button-item"
          v-for="(button, btnIndex) in props.block.buttons"
          :key="btnIndex"
        >
        <div class="button-header">
          <p class="button-type-label" v-if="props.template.button_type === 'postback'">
            Button {{ btnIndex + 1 }}
          </p>

          <template v-if="current == null || current <= 0">
            <div v-if="props.template.button_type === 'cta'" class="button-controls">
                             <VueSelect
                 @close="store.afterSelect"
                 :clearable="false"
                 v-model="button.type"
                 :reduce="(cta: any) => cta.value"
                 placeholder="Select Call to action"
                 :options="getAvailableCtaOptions(btnIndex)"
                 :disabled="shouldDisableButtonType || props.disableControls"
                 @change="() => store.onChangeCta(btnIndex, props.slideIndex || 0)"
               />
               <Button
                 v-if="shouldShowRemoveButton"
                 @click="store.removeTheButton(btnIndex, props.slideIndex)"
                 variant="error-outline"
                 size="small"
                 icon="pi pi-trash"
                 iconOnly
               >
               </Button>
            </div>

                         <Button
               v-else-if="props.template.button_type === 'postback' && shouldShowRemoveButton"
               @click="store.removeTheButton(btnIndex, props.slideIndex)"
               variant="error-outline"
               size="small"
               icon="pi pi-trash"
               iconOnly
             >
             </Button>
          </template>
          <p class="button-type-label" v-else>
            {{ button.type === "web_url" ? "URL" : "Phone Number" }}
          </p>
        </div>

        <!-- Button Configuration Row -->
        <div v-if="button.type === 'postback'" class="button-config-row">
          <div class="button-config-section">
            <label class="button-label">Button label</label>
                         <Input
               v-model="button.title"
               maxlength="20"
               placeholder="e.g., Yes, I'm interested"
               @input="store.checkForVariables('button_' + btnIndex, props.slideIndex || 0)"
             />
            <p class="input-hint">Keep it short and clear (max 20 characters recommended)</p>
          </div>

                     <div class="button-config-section">
             <label class="button-label">Quick reply response</label>
             <Input
               v-model="button.response"
               maxlength="20"
               placeholder="Enter the automated response that will be sent when this button is clicked..."
             />
             <p class="input-hint">This message will be sent automatically when the button is pressed</p>
           </div>
        </div>

                 <!-- CTA Button Configuration Row -->
         <div v-else-if="button.type === 'web_url'" class="button-config-row">
           <div class="button-config-section">
             <label class="button-label">Button label</label>
                           <Input
                v-model="button.title"
                maxlength="20"
                placeholder="e.g., Visit Website"
                @input="store.checkForVariables('button_' + btnIndex, props.slideIndex || 0)"
              />
             <p class="input-hint">Keep it short and clear (max 20 characters recommended)</p>
           </div>

           <div class="button-config-section">
             <label class="button-label">
              URL Configuration &nbsp; &nbsp;

              <Button
               v-if="store.canAddVariable(`button_${btnIndex}`)"
               type="button"
               @click="addVariable(btnIndex)"
               title="Add Variable"
               variant="primary"
               size="small"
               class="add-variable-btn"
               icon="pi pi-plus"
               iconOnly
             >
             </Button>
             </label>
                                                       <Input
                 type="url"
                 v-model="button.url"
                 @input="store.checkForVariables('button_' + btnIndex, props.slideIndex || 0)"
                 placeholder="https://example.com"
                 required
               />
             <p class="input-hint">Enter the URL that will open when the button is clicked</p>
           </div>
         </div>

         <div v-else-if="button.type === 'phone_number'" class="button-config-row">
           <div class="button-config-section">
             <label class="button-label">Button label</label>
                           <Input
                v-model="button.title"
                maxlength="20"
                placeholder="e.g., Call Us"
                @input="store.checkForVariables('button_' + btnIndex, props.slideIndex || 0)"
              />
             <p class="input-hint">Keep it short and clear (max 20 characters recommended)</p>
           </div>

           <div class="button-config-section">
             <label class="button-label">Phone number</label>
             <Input
               v-model="button.payload"
               placeholder="+1 631-555-5555"
             />
             <p class="input-hint">Enter the phone number that will be called when the button is clicked</p>
           </div>
         </div>
      </div>
    </div>

    <div class="buttons-footer">
      <p class="characters-count">{{ props.block.buttons.length }}/{{ props.template.total_buttons }} buttons</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { Button, Input, VueSelect } from '@/components/ui';
import { useWhatsAppTemplateStore } from '@/stores/whatsappTemplateStore';

// Props
interface Props {
  show: boolean;
  current?: number | null;
  template: any;
  block: any;
  errors: any;
  slideIndex?: number;
  disableControls?: boolean;
}

const props = defineProps<Props>();



// Data
const store = useWhatsAppTemplateStore();

const buttonTypeOptions = [
  { label: 'Quick Reply', value: 'postback' },
  { label: 'Call to action', value: 'cta' },
];

const ctaOptions = [
  { label: 'URL', value: 'web_url' },
  { label: 'Phone Number', value: 'phone_number' },
];

// Computed properties
const canAddButton = computed(() => {
  return store.canAddButton(props.slideIndex);
});

// Check if we should disable button type changes based on button count
const shouldDisableButtonType = computed(() => {
  // For carousel slides, check if this slide has more than 1 button
  if (props.slideIndex !== undefined) {
    return props.block.buttons.length > 1;
  }
  // For regular templates, check the main block buttons
  return props.block.buttons.length > 1;
});

// Check if we should show remove button
const shouldShowRemoveButton = computed(() => {
  // For carousel slides, show remove button if more than 1 button
  if (props.slideIndex !== undefined) {
    return props.block.buttons.length > 1;
  }
  // For regular templates, show remove button if more than 1 button
  return props.block.buttons.length > 1;
});

// Additional validation to prevent manipulation
const validateButtonCount = () => {
  const currentButtonCount = props.block.buttons.length;
  const maxButtons = props.template.total_buttons || 0;
  
  if (currentButtonCount > maxButtons) {
    // If somehow we have more buttons than allowed, remove the excess
    const excessCount = currentButtonCount - maxButtons;
    for (let i = 0; i < excessCount; i++) {
      store.removeTheButton(props.block.buttons.length - 1, props.slideIndex);
    }
  }
};

// Methods
const getAvailableCtaOptions = (currentButtonIndex: number) => {
  const usedTypes = props.block.buttons
    .map((btn: any, index: number) => ({ type: btn.type, index }))
    .filter((item: any) => item.index !== currentButtonIndex)
    .map((item: any) => item.type);

  return ctaOptions.filter((option: any) => !usedTypes.includes(option.value));
};

const addVariable = (btnIndex: number) => {
  console.log(btnIndex, "btnIndex")
  store.addVariable(`button_${btnIndex}`, true, null, props.slideIndex || 0);
};

const handleAddButton = () => {
  // Don't add button if controls are disabled
  if (props.disableControls) {
    return;
  }
  
  // Double-check before adding to prevent manipulation
  if (canAddButton.value) {
    store.addTheButton(props.slideIndex);
  }
};

// Watch for template button type changes to set default CTA type
watch(() => props.template.button_type, (newType) => {
  if (newType === 'cta' && props.block.buttons.length > 0) {
    // Set the first button to web_url by default if it doesn't have a type yet
    const firstButton = props.block.buttons[0];
    if (firstButton && !firstButton.type) {
      firstButton.type = 'web_url';
    }
  }
}, { immediate: true });

// Watch for button count changes and validate
watch(() => props.block.buttons.length, () => {
  validateButtonCount();
}, { immediate: true });
</script>

<style scoped>
.buttons-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.buttons-label {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.buttons-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.button-type-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-type-selector i {
  margin-left: var(--space-2);
  cursor: pointer;
  color: var(--color-primary);
}

.buttons-body {
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  padding: var(--space-3);
  background: white;
}

.button-item {
  margin-bottom: var(--space-4);  
  border: 1px dashed var(--color-border-secondary);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
}

.button-item:last-child {
  margin-bottom: 0;
}

.button-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  border-bottom: 1px dashed var(--color-border-secondary);
}

.button-type-label {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.button-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.button-config-row {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-3);
  margin-bottom: var(--space-3);
  padding: var(--space-2) var(--space-4);
}

.button-config-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.button-config-section.full-width {
  flex: 1;
}

.button-config-section .button-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.input-hint {
  margin: var(--space-1) 0 0 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.add-variable-btn{
  position: absolute;
  top: -5px;
}


.button-description {
  /* border: 1px dashed var(--color-border-secondary);
  border-top: none; */
  border-bottom: none;
  padding: var(--space-2);
}

.button-description .button-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.button-response-container {
  position: relative;
}

.button-response-container .button-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.buttons-footer {
  display: flex;
  justify-content: flex-end;
  border: 1px dashed var(--color-border-secondary);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  padding: var(--space-2);
  background-color: var(--color-bg-secondary);
}

.text-info {
  color: var(--color-primary);
}
</style>
  