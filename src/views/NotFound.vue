<template>
  <div class="notfound-container">
    <div class="notfound-card">
      <div class="icon">🧐</div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button @click="goHome">Go to Home</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui';
import { useRouter } from 'vue-router'
const router = useRouter()
function goHome() {
  router.push('/')
}
</script>

<style scoped>
.notfound-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f2fe 0%, #fff 100%);
}

.notfound-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 4px 24px 0 rgba(0,163,255,0.08);
  padding: 2.5rem 2rem;
  text-align: center;
  max-width: 350px;
  width: 100%;
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #00a3ff;
}

h1 {
  color: #0a2540;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

p {
  color: #3b4a5a;
  margin-bottom: 2rem;
  font-size: 1rem;
}
</style>