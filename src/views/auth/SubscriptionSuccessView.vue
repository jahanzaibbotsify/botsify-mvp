<script setup lang="ts">
import {onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/authStore'
import {axiosInstance} from "@/utils/axiosInstance.ts";
import {useBotStore} from "@/stores/botStore.ts";

const router = useRouter()
const authStore = useAuthStore();

/**
 * Create new agent user newly registered user.
 */
const createAgent = async () => {
  await axiosInstance.post('v1/create-bot', {
    bot_name: 'Echo'
  })
      .then(res => {
        if (res.data.bot_api_key) {
          useBotStore().setApiKey(res.data.bot_api_key)
          router.push(`/agent/${res.data.bot_api_key}`)
        }
      }).catch(error => {
        console.log(error)
      })
}

/**
 * Get updated user with subscription information.
 * Returns true when the user with subscription is found so caller can stop retrying.
 */
const getUpdatedUser = async (attempts = 1): Promise<boolean> => {
  try {
    const res = await axiosInstance.get('v1/user-with-subscription')
    if (res.data.user && res.data.user.subs) {
      authStore.setAuthData(null, res.data.user)
      await createAgent()
      return true
    }

    if (attempts >= 3) {
      router.push('/choose-plan')
    }
    return false
  } catch (error) {
    console.log(error)
    if (attempts >= 3) {
      router.push('/choose-plan')
    }
    return false
  }
}

onMounted(() => {
  let attempts = 0
  const maxAttempts = 3

  const tryGetUser = async () => {
    if (attempts < maxAttempts) {
      attempts++
      const success = await getUpdatedUser(attempts)
      if (!success && attempts < maxAttempts) {
        setTimeout(tryGetUser, 5000)
      }
    }
  }

  tryGetUser()
})
</script>

<template>
  <div class="subscription-success-view">
    <div class="success-card">
      <!-- Animated Checkmark -->
      <div class="checkmark-wrapper">
        <svg class="checkmark" viewBox="0 0 52 52">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-check" fill="none" d="M14 27l7 7 16-16"/>
        </svg>
      </div>
      <h2 class="success-title">Subscription Successful!</h2>
      <p class="success-message">You’ll be redirected shortly. Do not refresh the page...</p>
      <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subscription-success-view {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

.subscription-success-view::before {
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

.subscription-success-view::after {
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

.success-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
  0 10px 10px -5px rgba(0, 0, 0, 0.04),
  0 0 0 1px rgba(255, 255, 255, 0.1);
  padding: var(--space-7, 48px) var(--space-6, 32px);
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
  z-index: 2;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.success-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15),
  0 15px 15px -5px rgba(0, 0, 0, 0.06),
  0 0 0 1px rgba(255, 255, 255, 0.2);
}

.checkmark-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--space-4, 16px);
}

.checkmark {
  width: 80px;
  height: 80px;
  stroke: var(--color-primary, #00A3FF);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  background: none;
  display: block;
  filter: drop-shadow(0 4px 8px rgba(0, 163, 255, 0.3));
}

.checkmark-circle {
  stroke-dasharray: 157;
  stroke-dashoffset: 157;
  stroke-width: 3;
  stroke: var(--color-primary, #00A3FF);
  animation: strokeCircle 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 3;
  stroke: var(--color-primary, #00A3FF);
  animation: strokeCheck 0.5s 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

@keyframes strokeCircle {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes strokeCheck {
  100% {
    stroke-dashoffset: 0;
  }
}

.success-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary, #00A3FF), var(--color-primary-hover, #33B5FF));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-3, 12px);
}

.success-message {
  color: var(--color-text-secondary, #666);
  font-size: 1rem;
  margin-bottom: var(--space-4, 16px);
  font-weight: 500;
}

.loading-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--space-3, 12px);
}

.dot {
  width: 12px;
  height: 12px;
  margin: 0 6px;
  background: linear-gradient(135deg, var(--color-primary, #00A3FF), var(--color-primary-hover, #33B5FF));
  border-radius: 50%;
  opacity: 0.7;
  animation: bounce 1.2s infinite both;
  box-shadow: 0 2px 4px rgba(0, 163, 255, 0.3);
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
  .success-card {
    padding: var(--space-5, 24px) var(--space-2, 8px);
    max-width: 95vw;
  }

  .success-title {
    font-size: 1.3rem;
  }
}
</style>