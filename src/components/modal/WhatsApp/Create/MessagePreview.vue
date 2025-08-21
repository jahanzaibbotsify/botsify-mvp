<template>
  <div>
    <h6 v-if="showTitle" class="preview-title">{{ title }}</h6>
    <div class="actual-preview" v-if="template.bodyIncludes.includes('body') || (template.type === 'generic' && slides.length > 0)">
      <!-- Media / Text Section -->
      <div class="body">
        <template v-if="template.bodyIncludes?.includes('header')">
          <p v-if="template.header === 'text'" class="header-text">
            <strong>{{ headerText }}</strong>
          </p>

          <div v-else class="media-container">
            <!-- Image -->
            <img
              v-if="isImage"
              class="media-image"
              :src="mediaSrc"
              @error="handleImageError"
              alt="media-preview"
            />

            <!-- Video -->
            <video
              v-if="isVideo"
              :key="mediaSrc"
              class="media-video"
              ref="videoRef"
              poster="/theme/images/play-poster.png"
              controls
              autoplay
              muted
            >
              <source :src="mediaSrc" type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>

            <!-- Document -->
            <img
              v-if="isDocument"
              class="media-document"
              :src="mediaSrc"
              alt="document-preview"
            />
          </div>
        </template>

        <!-- Body Text -->
        <pre
          v-if="bodyText"
          class="body-text"
          v-html="bodyText"
        ></pre>

        <!-- Footer -->
        <span v-if="template.bodyIncludes?.includes('footer')" class="footer-text">{{ template.footer_text }}</span>
      </div>

      <!-- Buttons -->
      <div v-if="showButtons" class="buttons-container">
        <div
          v-for="(button, index) in buttons"
          :key="index"
          class="button-item"
        >
          <a 
            v-if="button.type === 'URL' || button.type === 'web_url'" 
            :href="button.url" 
            target="_blank" 
            class="button-link"
          >
            <i class="fa fa-external-link" aria-hidden="true"></i> 
            {{ button.text || button.autofill_text || button.title }}
          </a>
          <strong v-else class="button-text">
            {{ button.text || button.autofill_text || button.title }}
          </strong>
        </div>
      </div>

      <!-- Generic Template Slides -->
      <div
        v-if="template.type === 'generic' && slides.length > 0"
        class="slides-container"
      >
        <div class="slides-wrapper">
          <div
            v-for="(slide, index) in slides"
            :key="index"
            class="slide-card"
          >
            <!-- Slide Media -->
            <div class="slide-media" v-if="template.slides[index] && template.slides[index].header">
              <img
                v-if="template.slides[index].header === 'image'"
                class="slide-image"
                :src="getSlideImage(index)"
                @error="$emit('onImageFailed', index)"
                alt="slide-preview"
              />
              <video
                v-else-if="template.slides[index].header === 'video'"
                class="slide-video"
                ref="videoRef"
                poster="/theme/images/play-poster.png"
                controls
              >
                <source :src="getSlideVideo(index)" type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
              <img
                v-else-if="template.slides[index].header === 'document'"
                class="slide-document"
                :src="getSlideDocument(index)"
                alt="document-preview"
              />
            </div>

            <!-- Slide Title -->
            <pre class="slide-title">{{ slideBodyText(index) }}</pre>

            <!-- Slide Buttons -->
            <div
              v-for="(btn, idx) in slide.buttons"
              :key="idx"
              class="slide-button-container"
            >
              <a
                v-if="btn.type === 'web_url'"
                :href="slideButtonUrl(index, idx)"
                class="slide-button-link"
                target="_blank"
              >
                {{ slideButtonText(index, idx) }}
              </a>
              <strong v-else class="slide-button-text">
                {{ slideButtonText(index, idx) }}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <span class="no-template-message">
        No template selected, please select template.
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';

// Props
interface Props {
  title?: string;
  showTitle?: boolean;
  template: any;
  block?: any;
  botService?: string;
  default_image?: string;
  slides_default?: any[];
  slides?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Preview',
  showTitle: true,
  block: () => ({}),
  botService: 'facebookAPI',
  default_image: '',
  slides_default: () => [],
  slides: () => []
});

// Emits
defineEmits<{
  'onImageFailed': [index: number];
}>();

// Reactive data for media handling
const mediaCache = ref<{ [key: string]: string }>({});
const slidesMediaCache = ref<{ [key: string]: string }>({});

// Computed properties
const headerText = computed(() => {
  let result = props.template.header_text || '';
  const variable = props.template.variables?.header;

  if (variable && variable.value !== '') {
    // Replace the variable placeholder with the actual value
    // const beforeReplace = result;
    result = result.replace(variable.key, variable.value);
  }
  
  return result;
});

const bodyText = computed(() => {
  let result = props.block?.text || props.template.body_text || '';
  const bodyVars = props.template.variables?.body || [];

  // Replace each body variable with its value
  bodyVars.forEach((item: any) => {
    if (item.value !== '') {
      // const beforeReplace = result;
      result = result.replace(item.key, item.value);
    }
  });
  
  return result;
});

const mediaSrc = computed(() => {
  const link = props.block?.attachment_link || props.template.attachment_link;
  
  // Check if we have a cached version
  if (mediaCache.value[link]) {
    return mediaCache.value[link];
  }

  // Check if link is a valid URL
  const isValidUrl = typeof link === 'string' && /^https?:\/\/.+/.test(link);

  if (isValidUrl) {
    return link;
  }

  // Return fallback image
  return props.default_image || '/theme/images/file-cover.png';
});

const isImage = computed(() => {
  return props.template.type === 'image' || props.template.header === 'image';
});

const isVideo = computed(() => {
  return props.template.type === 'video' || props.template.header === 'video';
});

const isDocument = computed(() => {
  return props.template.type === 'document' || props.template.header === 'document';
});

const showButtons = computed(() => {
  return props.template.bodyIncludes?.includes('buttons') && (props.template.type === 'media' || props.template.buttons?.length);
});

const buttons = computed(() => {
  const buttons = props.block?.buttons || props.template.buttons || [];
  // Replace variables in button URLs and text
  return buttons.map((button: any, index: number) => {
    let updatedButton = { ...button };
    // Replace variables in button URL
    if ((!button.text && !button.title) && props.template?.buttons?.[index]) {
      updatedButton.text = props.template.buttons[index]?.text || '';
      updatedButton.title = props.template.buttons[index]?.title || '';
    }

    if (button.url) {
      let url = button.url;
      const buttonUrlVar = props.template.variables?.buttonUrl;
      if (buttonUrlVar && buttonUrlVar.value !== '') {
        url = url.replace(buttonUrlVar.key, buttonUrlVar.value);
      }
      updatedButton.url = url;
    }

    // Replace variables in button text
    if (button.text || button.title) {
      let text = button.text || button.title || '';
      const buttonTextVar = props.template.variables?.buttonText;

      if (buttonTextVar && buttonTextVar.value !== '') {
        text = text.replace(buttonTextVar.key, buttonTextVar.value);
      }
      updatedButton.text = text;
      updatedButton.title = text;
    }
    
    return updatedButton;
  });
});

const slides = computed(() => {
  // Use the slides prop if provided, otherwise fall back to template slides
  return props.slides && props.slides.length > 0 ? props.slides : (props.template.slides || []);
});

// Methods
const handleImageError = (event: Event) => {
  (event.target as HTMLImageElement).src = '/theme/images/file-cover.png';
};

const retrieveMedia = async (attachmentLink: string, slideIndex?: number) => {
  const FALLBACK_IMAGE = '/theme/images/file-cover.png';
  const isGeneric = props.template.type === 'generic' && props.template.slides.length > 0;
  const isUrl = attachmentLink?.startsWith('http://') || attachmentLink?.startsWith('https://');

  if (isUrl) {
    if (isGeneric && slideIndex !== undefined) {
      slidesMediaCache.value[`${slideIndex}_${attachmentLink}`] = attachmentLink;
    } else {
      mediaCache.value[attachmentLink] = attachmentLink;
    }
    return;
  }

  if (!attachmentLink || attachmentLink === FALLBACK_IMAGE) {
    return;
  }

  try {
    // For now, we'll use the attachment link directly
    // In a real implementation, you might want to make an API call here
    if (isGeneric && slideIndex !== undefined) {
      slidesMediaCache.value[`${slideIndex}_${attachmentLink}`] = attachmentLink;
    } else {
      mediaCache.value[attachmentLink] = attachmentLink;
    }
  } catch (error) {
    console.error('Failed to retrieve media:', error);
    if (isGeneric && slideIndex !== undefined) {
      slidesMediaCache.value[`${slideIndex}_${attachmentLink}`] = FALLBACK_IMAGE;
    } else {
      mediaCache.value[attachmentLink] = FALLBACK_IMAGE;
    }
  }
};

const slideBodyText = (index = 0) => {
  const slide = slides.value[index];
  if (!slide) return '';
  
  let result = slide.title || '';
  // For carousel slides, check if variables exist in the template slides
  const templateSlide = props.template.slides?.[index];
  const vars = templateSlide?.variables?.body || [];
  
  vars.forEach((item: any) => {
    if (item.value !== '') {
      result = result.replace(item.key, item.value);
    }
  });
  return result;
};

const slideButtonText = (slideIndex: number, buttonIndex: number) => {
  const slide = slides.value[slideIndex];
  if (!slide) return '';
  
  const button = slide.buttons?.[buttonIndex];
  if (!button) return '';
  
  let result = button.title || button.text || '';
  
  // Check for button text variables in template slide
  const templateSlide = props.template.slides?.[slideIndex];
  const buttonTextVar = templateSlide?.variables?.buttonText;
  if (buttonTextVar && buttonTextVar.value !== '') {
    result = result.replace(buttonTextVar.key, buttonTextVar.value);
  }
  
  return result;
};

const slideButtonUrl = (slideIndex: number, buttonIndex: number) => {
  const slide = slides.value[slideIndex];
  if (!slide) return '';
  
  const button = slide.buttons?.[buttonIndex];
  if (!button || !button.url) return '';
  
  let url = button.url;
  
  // Check for button URL variables in template slide
  const templateSlide = props.template.slides?.[slideIndex];
  const buttonUrlVar = templateSlide?.variables?.button;
  if (buttonUrlVar && buttonUrlVar.value !== '') {
    url = url.replace(buttonUrlVar.key, buttonUrlVar.value);
  }
  
  return url;
};

const getSlideImage = (index: number) => {
  const slide = slides.value[index];
  if (!slide) return '/theme/images/file-cover.png';
  
  const attachmentLink = slide?.attachment_link || props.block?.slides?.[index]?.attachment_link;
  
  const cacheKey = `${index}_${attachmentLink}`;
  if (slidesMediaCache.value[cacheKey]) {
    return slidesMediaCache.value[cacheKey];
  }

  const isValidUrl = typeof attachmentLink === 'string' && /^https?:\/\/.+/.test(attachmentLink);
  return isValidUrl ? attachmentLink : '/theme/images/file-cover.png';
};

const getSlideVideo = (index: number) => {
  const slide = slides.value[index];
    if (!slide) return '/theme/images/file-cover.png';
    
  const attachmentLink = slide?.attachment_link || props.block?.slides?.[index]?.attachment_link;
  
  const cacheKey = `${index}_${attachmentLink}`;
  if (slidesMediaCache.value[cacheKey]) {
    return slidesMediaCache.value[cacheKey];
  }

  const isValidUrl = typeof attachmentLink === 'string' && /^https?:\/\/.+/.test(attachmentLink);
  return isValidUrl ? attachmentLink : '/theme/images/file-cover.png';
};

const getSlideDocument = (index: number) => {
  const slide = slides.value[index];
  const attachmentLink = slide?.attachment_link || props.block?.slides?.[index]?.attachment_link;
  
  const cacheKey = `${index}_${attachmentLink}`;
  if (slidesMediaCache.value[cacheKey]) {
    return slidesMediaCache.value[cacheKey];
  }

  const isValidUrl = typeof attachmentLink === 'string' && /^https?:\/\/.+/.test(attachmentLink);
  return isValidUrl ? attachmentLink : '/theme/images/file-cover.png';
};

// Watch for template changes to retrieve media
watch(() => props.template.attachment_link, (newLink) => {
  if (newLink) {
    retrieveMedia(newLink);
  }
});

watch(() => slides.value, (newSlides) => {
  if (newSlides && props.template.type === 'generic') {
    newSlides.forEach((slide: any, index: number) => {
      if (slide.attachment_link) {
        retrieveMedia(slide.attachment_link, index);
      }
    });
  }
}, { deep: true });

// Initialize media retrieval on mount
onMounted(() => {
  if (props.template.type === 'generic' && Array.isArray(slides.value)) {
    slides.value.forEach((slide: any, index: number) => {
      if (slide.attachment_link) {
        retrieveMedia(slide.attachment_link, index);
      }
    });
  } else if (props.template.attachment_link) {
    retrieveMedia(props.template.attachment_link);
  }
});
</script>

<style scoped>
.preview-title {
  text-transform: uppercase;
  margin-bottom: var(--space-4);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.actual-preview {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
}

.body {
  margin-bottom: var(--space-2);
}

.header-text {
  margin-bottom: var(--space-2);
  font-weight: 600;
  color: var(--color-text-primary);
}

.media-container {
  display: flex;
  justify-content: flex-start;
  padding: 0;
  border: 0;
  margin-bottom: var(--space-2);
}

.media-image,
.media-video,
.media-document {
  height: 150px;
  object-fit: cover;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-md);
}

.media-video {
  width: 100%;
}

.body-text {
  margin-bottom: 0;
  white-space: break-spaces;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.footer-text {
  color: var(--color-text-tertiary);
  font-size: 12px;
  margin-top: var(--space-2);
}

.buttons-container {
  margin-top: var(--space-3);
}

.button-item {
  text-align: center;
  margin-bottom: var(--space-1);
  width: 100%;
}

.button-link,
.button-text {
  display: block;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 14px;
  text-align: center;
  transition: all var(--transition-normal);
}

.button-link:hover {
  background: var(--color-primary);
  color: white;
  text-decoration: none;
}

.slides-container {
  margin-bottom: var(--space-3);
  overflow-x: auto;
  white-space: nowrap;
  scroll-behavior: smooth;
  max-width: 500px;
}

.slides-wrapper {
  display: flex;
  flex-wrap: nowrap;
  padding: 0;
  border: 0;
  gap: var(--space-4);
}

.slide-card {
  background: white;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  width: 200px;
  flex: 0 0 auto;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.slide-media {
  display: flex;
  justify-content: center;
  padding: var(--space-1);
  overflow: hidden;
}

.slide-image,
.slide-video {
  height: 130px;
  object-fit: cover;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-md);
}

.slide-video {
  width: 100%;
}

.slide-title {
  margin: var(--space-1) 0;
  white-space: break-spaces;
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}

.slide-button-container {
  text-align: center;
  margin-bottom: var(--space-1);
  border: 0;
  padding: 0;
}

.slide-button-link,
.slide-button-text {
  display: block;
  width: 100%;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 12px;
  text-align: center;
  transition: all var(--transition-normal);
}

.slide-button-link:hover {
  background: var(--color-primary);
  color: white;
  text-decoration: none;
}

.no-template-message {
  display: flex;
  justify-content: center;
  padding: var(--space-4);
  font-weight: 600;
  color: var(--color-text-secondary);
}

/* Scrollbar styling */
.slides-container::-webkit-scrollbar {
  height: 6px;
}

.slides-container::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.slides-container {
  scrollbar-width: thin;
}
</style>
  