<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // Redirect to home page on load
  if (router.currentRoute.value.path === '/') {
    router.push('/');
  }
});
</script>

<template>
  <router-view />
</template>