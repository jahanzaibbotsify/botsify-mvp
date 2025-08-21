<script setup lang="ts">
import {onMounted, ref, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {axiosInstance} from "../../utils/axiosInstance";
import {useAuthStore} from "../../stores/authStore";
import {useBotStore} from "../../stores/botStore";

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const botStore = useBotStore()

const isProcessing = ref(true)
const isSuccess = ref<boolean | null>(null)
const message = ref('')

const token = computed(() => (route.query.token as string) || '')

/**
 * Fetch current authenticated user.
 */
const fetchCurrentUser = async () => {
  try {
    const res = await axiosInstance.get('v1/user-with-subscription')
    if (res?.data?.user) {
      authStore.setAuthData(null, res.data.user)
      return true
    }
    return false
  } catch (error) {
    return false
  }
}

/**
 * Create agent.
 */
const createAgent = async () => {
  try {
    const res = await axiosInstance.post('v1/create-bot', {bot_name: 'Echo'})
    if (res.data?.bot_api_key) {
      botStore.setApiKey(res.data.bot_api_key)
      await router.push(`/agent/${res.data.bot_api_key}`)
    }
  } catch (error) {
    await router.push('/')
  }
}

onMounted(async () => {
  if (!token.value) {
    isProcessing.value = false
    isSuccess.value = false
    message.value = 'Authentication failed. No token found.'
    return
  }

  localStorage.setItem('accessToken', JSON.stringify(token.value))

  const ok = await fetchCurrentUser()
  isProcessing.value = false
  if (ok) {
    isSuccess.value = true
    message.value = 'Authentication successful! Redirecting you shortly...'
    await createAgent();
  } else {
    isSuccess.value = false
    message.value = 'Authentication failed. Please try logging in again.'
  }
})
</script>

<template>
  <div class="auth-callback-view">
    <div class="card" :class="{ success: isSuccess, error: isSuccess === false }">
      <div class="icon-wrapper" v-if="!isProcessing">
        <svg v-if="isSuccess" class="icon" viewBox="0 0 52 52">
          <circle class="circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="check" fill="none" d="M14 27l7 7 16-16"/>
        </svg>
        <svg v-else class="icon error-icon" viewBox="0 0 52 52">
          <circle class="circle error" cx="26" cy="26" r="25" fill="none"/>
          <path class="cross" fill="none" d="M18 18l16 16M34 18l-16 16"/>
        </svg>
      </div>

      <div v-if="isProcessing" class="spinner-wrapper">
        <div class="spinner"></div>
        <p class="processing">Processing authentication…</p>
      </div>

      <div v-else>
        <h2 class="title">{{ isSuccess ? 'Authentication Successful' : 'Authentication Error' }}</h2>
        <p class="description">{{ message }}</p>
        <div v-if="isSuccess" class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-callback-view {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

.auth-callback-view::before {
  content: '';
  position: absolute;
  inset: 0;
  background: conic-gradient(
      from 180deg,
      #ff0080,
      #7928ca,
      #2afadf,
      #7928ca,
      #ff0080
  );
  filter: blur(60px);
  opacity: 0.6;
  z-index: 0;
}

.auth-callback-view::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#ffffff20 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.18;
  z-index: 1;
  mix-blend-mode: color-dodge;
  pointer-events: none;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-lg);
  padding: var(--space-7) var(--space-6);
  width: 100%;
  max-width: 440px;
  text-align: center;
  position: relative;
  z-index: 2;
}

[data-theme="dark"] .card {
  background: rgba(17, 24, 39, 0.7);
  border-color: rgba(255, 255, 255, 0.06);
}

.card.success {
  border-color: rgba(16, 185, 129, 0.3);
}

.card.error {
  border-color: rgba(239, 68, 68, 0.3);
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--space-4);
}

.icon {
  width: 80px;
  height: 80px;
  stroke: var(--color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 4px 8px rgba(0, 163, 255, 0.3));
}

.circle {
  stroke-dasharray: 157;
  stroke-dashoffset: 157;
  animation: strokeCircle 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.check {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: strokeCheck 0.5s 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.error-icon {
  stroke: var(--color-error);
}

.circle.error {
  stroke: var(--color-error);
}

.cross {
  stroke: var(--color-error);
  stroke-dasharray: 72;
  stroke-dashoffset: 72;
  animation: strokeCross 0.5s 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

@keyframes strokeCircle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes strokeCheck {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes strokeCross {
  to {
    stroke-dashoffset: 0;
  }
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
}

.description {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin-bottom: var(--space-4);
}

.spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.processing {
  color: var(--color-text-secondary);
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-dots {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dot {
  width: 10px;
  height: 10px;
  margin: 0 6px;
  background: var(--color-primary);
  border-radius: 50%;
  opacity: 0.7;
  animation: bounce 1.2s infinite both;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .card {
    padding: var(--space-5) var(--space-4);
  }

  .title {
    font-size: 1.25rem;
  }
}
</style>

