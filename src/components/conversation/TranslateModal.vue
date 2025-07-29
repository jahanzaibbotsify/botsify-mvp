<script setup lang="ts">
import { ref } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)
const selectedLanguage = ref('en')
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
]

const isTranslating = ref(false)

const openModal = () => {
  modalRef.value?.openModal()
}

defineExpose({ openModal })

// Load Google Translate script

const triggerLanguageChange = (lang: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const maxAttempts = 20;
    const interval = 300;
    let attempts = 0;

    // Step 1: Click the Google Translate dropdown
    const openDropdown = () => {
      const el = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (el) {
        el.value = lang;
        el.dispatchEvent(new Event('change'));
        return true;
      }
      return false;
    };

    // Step 2: Wait for iframe and select the language
    const waitForIframe = () => {
      const iframe = document.querySelector('iframe.goog-te-menu-frame') as HTMLIFrameElement | null;
      if (iframe) {
        try {
          const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!innerDoc) return reject(new Error('No inner document in iframe'));

          const langItems = innerDoc.querySelectorAll('.goog-te-menu2-item span.text');
          const langName = languages.find(l => l.code === lang)?.name.toLowerCase() || '';

          for (let i = 0; i < langItems.length; i++) {
            const text = langItems[i].textContent?.toLowerCase() || '';
            if ((lang === 'en' && text.includes('show original')) || text.includes(langName)) {
              (langItems[i].parentElement as HTMLElement).click();
              return resolve();
            }
          }
          return reject(new Error('Language not found in menu'));
        } catch (e) {
          return reject(e);
        }
      } else if (attempts++ < maxAttempts) {
        setTimeout(waitForIframe, interval);
      } else {
        reject(new Error('Google Translate iframe not found'));
      }
    };

    // Run dropdown click first
    if (openDropdown()) {
      setTimeout(waitForIframe, 500); // Let iframe load
    } else {
      reject(new Error('Google Translate dropdown not found'));
    }
  });
};

// Translate on button click
const handleSelect = async () => {
  isTranslating.value = true
  try {
    await triggerLanguageChange(selectedLanguage.value)
    modalRef.value?.closeModal()
  } catch (e) {
    console.error('Translation error:', e)
  } finally {
    isTranslating.value = false
  }
}
</script>

<template>
  <ModalLayout ref="modalRef" title="Translate Chat" max-width="400px">
    <div class="translate-modal-body">
      <label for="language-select" class="form-label mb-2">Select Language</label>
      <select id="language-select" v-model="selectedLanguage" class="form-select mb-4" :disabled="isTranslating">
        <option v-for="lang in languages" :key="lang.code" :value="lang.code">
          {{ lang.name }}
        </option>
      </select>
      <button class="btn primary w-100" @click="handleSelect" :disabled="isTranslating">
        <span v-if="isTranslating">Translating...</span>
        <span v-else>Translate</span>
      </button>
    </div>
  </ModalLayout>
</template>

<style scoped>
.translate-modal-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.form-select {
  font-family: inherit;
  font-size: 0.95rem;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-normal);
}
.btn.primary {
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-size: 0.95rem;
  font-weight: 500;
  transition: background-color var(--transition-normal);
  border: none;
  cursor: pointer;
}
.btn.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn.primary:hover:enabled {
  background-color: var(--color-primary-hover);
}
.w-100 { width: 100%; }
</style> 