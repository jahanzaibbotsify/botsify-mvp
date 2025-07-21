<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
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
  // Add more as needed
]

const isTranslating = ref(false)

const openModal = () => {
  modalRef.value?.openModal()
}

defineExpose({ openModal })

// Google Translate script loader
const scriptLoaded = ref(false)
const scriptId = 'google-translate-script'

const loadGoogleTranslateScript = () => {
  if (document.getElementById(scriptId)) {
    scriptLoaded.value = true
    return
  }
  const script = document.createElement('script')
  script.id = scriptId
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.onload = () => { scriptLoaded.value = true }
  document.head.appendChild(script)
}

// TypeScript: declare google on window
declare global {
  interface Window {
    google?: any
    googleTranslateElementInit?: () => void
  }
}

// Google Translate widget init
function googleTranslateElementInit() {
  if (
    (window as any).google &&
    (window as any).google.translate &&
    (window as any).google.translate.TranslateElement
  ) {
    new (window as any).google.translate.TranslateElement({
      pageLanguage: 'en',
      autoDisplay: false,
      includedLanguages: languages.map(l => l.code).join(','),
      layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element')
  }
}

onMounted(() => {
  window.googleTranslateElementInit = googleTranslateElementInit
  loadGoogleTranslateScript()
})

// Helper: Poll for the Google Translate iframe and trigger language change
const triggerLanguageChange = (lang: string) => {
  return new Promise<void>((resolve, reject) => {
    let attempts = 0
    const maxAttempts = 10 // 10 * 200ms = 2s
    const poll = () => {
      const iframe = document.querySelector('iframe.goog-te-menu-frame') as HTMLIFrameElement | null
      if (iframe) {
        setTimeout(() => {
          const innerDoc = iframe.contentDocument || (iframe as any).contentWindow?.document
          if (!innerDoc) return reject('No innerDoc')
          const langItems = innerDoc.querySelectorAll('.goog-te-menu2-item span.text')
          let found = false
          for (let i = 0; i < langItems.length; i++) {
            const langName = languages.find(l => l.code === lang)?.name.toLowerCase() || ''
            if (lang === 'en' && langItems[i].innerText.toLowerCase().includes('show original')) {
              (langItems[i].parentElement as HTMLElement).click()
              found = true
              break
            } else if (lang !== 'en' && langItems[i].innerText.toLowerCase().includes(langName)) {
              (langItems[i].parentElement as HTMLElement).click()
              found = true
              break
            }
          }
          if (found) {
            resolve()
          } else {
            reject('Language not found in menu')
          }
        }, 200)
      } else if (attempts < maxAttempts) {
        attempts++
        setTimeout(poll, 200)
      } else {
        reject('Google Translate iframe not found')
      }
    }
    poll()
  })
}

const handleSelect = async () => {
  isTranslating.value = true
  try {
    await nextTick()
    await triggerLanguageChange(selectedLanguage.value)
    // Keep selectedLanguage as is
    modalRef.value?.closeModal()
  } catch (e) {
    // Optionally show error
    // window.$toast?.error('Could not translate page')
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
      <div v-if="!scriptLoaded" class="mt-4 text-center" style="font-size: 0.9rem; color: var(--color-text-tertiary);">
        Loading Google Translate...
      </div>
      <div id="google_translate_element" style="display:none;"></div>
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