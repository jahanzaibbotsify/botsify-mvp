import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../types';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  async function login(email: string, _password: string) {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulated login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      user.value = {
        id: '1',
        name: 'Demo User',
        email,
        plan: 'free',
        avatar: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      };
    } catch (e) {
      error.value = 'Login failed. Please try again.';
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout
  };
});