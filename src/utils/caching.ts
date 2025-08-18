import { ref } from "vue";

export function createResource<T, P extends any[]>(
    fetcher: (...params: P) => Promise<T>
  ) {
    const data = ref<T | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const valid = ref(false);
    let lastParams: P | null = null;
  
    const load = async (...params: P) => {
      // If params are the same and valid, reuse cache
      if (valid.value && lastParams && JSON.stringify(params) === JSON.stringify(lastParams)) {
        return data.value;
      }
      if (loading.value) return data.value;
  
      loading.value = true;
      error.value = null;
      try {
        const result = await fetcher(...params);
        data.value = result;
        valid.value = true;
        lastParams = params;
        return result;
      } catch (e: any) {
        error.value = e.message;
        throw e;
      } finally {
        loading.value = false;
      }
    };
  
    const invalidate = () => {
      valid.value = false;
    };

    const clear = () => {
      data.value = null;
      loading.value = false;
      error.value = null;
      valid.value = false;
      lastParams = null;
    };
  
    return { data, loading, error, valid, load, invalidate, clear };
  }
  
  