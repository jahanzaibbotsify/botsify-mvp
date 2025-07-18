<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import ChatMessage from './ChatMessage.vue'
import MessageSkeleton from './MessageSkeleton.vue'
import ImageModal from './ImageModal.vue'
import type { Message } from '@/types'

const props = defineProps<{
  hasSelectedConversation: boolean
  messages: Message[]
  loading?: boolean
  error?: string | null
  conversationTitle?: string
}>()

const emit = defineEmits<{
  'retry': []
  'start-new-conversation': []
}>()

const messagesContainer = ref<HTMLDivElement>()
const selectedImage = ref<string | null>(null)
const showImageModal = ref(false)

// Group messages by date
const groupedMessages = computed(() => {
  const groups: { date: string; messages: Message[] }[] = []
  let currentDate = ''
  let currentGroup: Message[] = []

  props.messages.forEach(message => {
    const messageDate = new Date(message.timestamp).toDateString()
    
    if (messageDate !== currentDate) {
      if (currentGroup.length > 0) {
        groups.push({ date: currentDate, messages: currentGroup })
      }
      currentDate = messageDate
      currentGroup = [message]
    } else {
      currentGroup.push(message)
    }
  })

  if (currentGroup.length > 0) {
    groups.push({ date: currentDate, messages: currentGroup })
  }

  return groups
})

// Format date for display
const formatDateHeader = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
}

// Check if message should show avatar (first message from sender in a group)
const shouldShowAvatar = (message: Message, index: number, messages: Message[]) => {
  if (index === 0) return true
  const prevMessage = messages[index - 1]
  return prevMessage.sender !== message.sender
}

// Check if message should show timestamp
const shouldShowTimestamp = (message: Message, index: number, messages: Message[]) => {
  if (index === messages.length - 1) return true
  const nextMessage = messages[index + 1]
  if (nextMessage.sender !== message.sender) return true
  
  // Show timestamp if more than 5 minutes apart
  const timeDiff = new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime()
  return timeDiff > 5 * 60 * 1000
}

// Auto-scroll to bottom when new messages are added
const scrollToBottom = async (smooth = true) => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }
}

// Handle image click
const handleImageClick = (url: string) => {
  selectedImage.value = url
  showImageModal.value = true
}

// Handle attachment download
const handleAttachmentDownload = (attachment: any) => {
  // Create a temporary link and trigger download
  const link = document.createElement('a')
  link.href = attachment.url
  link.download = attachment.name
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Watch for messages changes to auto-scroll
watch(() => props.messages.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    scrollToBottom()
  }
})

// Watch for conversation changes
watch(() => props.hasSelectedConversation, (hasConversation) => {
  if (hasConversation) {
    nextTick(() => scrollToBottom(false))
  }
})

onMounted(() => {
  if (props.hasSelectedConversation && props.messages.length > 0) {
    scrollToBottom(false)
  }
})
</script>

<template>
  <div class="chat-messages">
    <!-- No Conversation Selected -->
     
    <div 
      v-if="!hasSelectedConversation" 
      class="no-conversation"
    >
      <div class="no-conversation-content">
        <div class="no-conversation-icon">💬</div>
        <h3>No Conversation Selected</h3>
        <p>Select a conversation from the sidebar to start chatting.</p>
      </div>
    </div>
    
    <!-- Loading State -->
    <div 
      v-else-if="loading" 
      class="loading-messages"
    >
      <div class="messages-skeleton-list">
        <MessageSkeleton v-for="i in 6" :key="`skeleton-${i}`" :lines="Math.floor(Math.random() * 3) + 1" :is-user="i % 2 === 0" />
      </div>
    </div>
    
    
    <!-- Error State -->
     <div 
      v-else-if="error" 
      class="error-messages"
    >
      <div class="error-icon">
        <i class="pi pi-exclamation-triangle"></i>
      </div>
      <p class="error-text">Failed to load messages</p>
      <p class="error-subtext">{{ error }}</p>
      <button class="retry-btn" @click="emit('retry')">
        <i class="pi pi-refresh btn-icon"></i>
        Try Again
      </button>
    </div>
    
    <!-- Messages Container -->
    <div v-else class="messages-wrapper">
      <!-- Conversation Header -->
      <div v-if="conversationTitle" class="conversation-header">
        <h2 class="conversation-title">{{ conversationTitle }}</h2>
        <div class="conversation-status">
          <div class="status-indicator active"></div>
          <span class="status-text">Active</span>
        </div>
      </div>

      <!-- Messages -->
      <div 
        ref="messagesContainer"
        class="messages-container"
      >
        <!-- Empty Messages State -->
        <div v-if="messages.length === 0" class="no-messages-state">
          <div class="no-messages-content">
            <div class="no-messages-icon">💬</div>
            <h3 class="no-messages-title">No Messages Yet</h3>
            <p class="no-messages-description">
              Start the conversation by sending your first message.
            </p>
          </div>
        </div>
        
        <!-- Message Groups -->
        <div v-else class="messages-list">
          <div 
            v-for="group in groupedMessages" 
            :key="group.date"
            class="message-group"
          >
            <!-- Date Header -->
            <div class="date-header">
              <span class="date-text">{{ formatDateHeader(group.date) }}</span>
            </div>
            
            <!-- Messages in Group -->
            <div class="group-messages">
              <ChatMessage 
                v-for="(message, index) in group.messages" 
                :key="message.id" 
                :message="message"
                :show-avatar="shouldShowAvatar(message, index, group.messages)"
                :show-timestamp="shouldShowTimestamp(message, index, group.messages)"
                :compact="!shouldShowAvatar(message, index, group.messages)"
                @image-click="handleImageClick"
                @attachment-download="handleAttachmentDownload"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <ImageModal 
      v-if="showImageModal && selectedImage"
      :image-url="selectedImage"
      @close="showImageModal = false"
    />
  </div>
</template>

<style scoped>
.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  overflow: hidden;
  position: relative;
}

/* Empty State */

.no-conversation,
.no-messages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.no-conversation-content,
.no-messages-content {
  text-align: center;
  max-width: 400px;
}

.no-conversation-icon,
.no-messages-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.no-conversation-content h3,
.no-messages-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.no-conversation-content p,
.no-messages-content p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Loading State */
.loading-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-4) var(--space-6);
}

.messages-skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 1000px;
  margin: 0 auto;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}


.conversation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
}

.status-indicator.active {
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Error State */
.error-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  text-align: center;
}

.error-icon {
  margin-bottom: var(--space-3);
  opacity: 0.5;
  color: var(--color-error);
}

.error-text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-1) 0;
}

.error-subtext {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
  margin: 0 0 var(--space-3) 0;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.retry-btn:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

/* Messages Wrapper */
.messages-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  scroll-behavior: smooth;
}

.no-messages-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.no-messages-content {
  text-align: center;
  max-width: 300px;
  margin: 0 auto;
}

.no-messages-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-messages-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.no-messages-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.messages-list {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.message-group {
  margin-bottom: 2rem;
}

.date-header {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.date-header::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-bg-tertiary), transparent);
}

.date-text {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  position: relative;
  z-index: 1;
}

.group-messages {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Custom Scrollbar */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive Design */

/* Responsive Design */
@media (max-width: 768px) {
  .messages-container {
    padding: var(--space-3);
  }
  
  .no-conversation,
  .no-messages,
  .loading-messages,
  .error-messages {
    padding: var(--space-4);
  }
  
  .no-conversation-icon,
  .no-messages-icon {
    font-size: 3rem;
  }
}
</style>