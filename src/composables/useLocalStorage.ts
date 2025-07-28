import { ref, watch } from 'vue';

export interface StorageOptions {
  defaultValue?: any;
  serializer?: (value: any) => string;
  deserializer?: (value: string) => any;
  immediate?: boolean;
}

export function useLocalStorage<T>(
  key: string,
  options: StorageOptions = {}
) {
  const {
    defaultValue,
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    immediate = true
  } = options;

  // Get initial value from localStorage or use default
  const getStoredValue = (): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue as T;
      }
      return deserializer(item);
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}":`, error);
      return defaultValue as T;
    }
  };

  const storedValue = ref<T>(getStoredValue());

  // Set value in localStorage
  const setValue = (value: T) => {
    try {
      storedValue.value = value;
      const serializedValue = serializer(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Failed to set localStorage key "${key}":`, error);
    }
  };

  // Remove value from localStorage
  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      storedValue.value = defaultValue as T;
    } catch (error) {
      console.error(`Failed to remove localStorage key "${key}":`, error);
    }
  };

  // Check if localStorage is available
  const isAvailable = (): boolean => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  };

  // Watch for changes and update localStorage
  if (immediate) {
    watch(storedValue, (newValue) => {
      setValue(newValue);
    }, { deep: true });
  }

  return {
    value: storedValue,
    setValue,
    removeValue,
    isAvailable
  };
}

// Specialized composables for common data types
export function useStringStorage(key: string, defaultValue: string = '') {
  return useLocalStorage<string>(key, {
    defaultValue,
    serializer: (value) => value,
    deserializer: (value) => value
  });
}

export function useNumberStorage(key: string, defaultValue: number = 0) {
  return useLocalStorage<number>(key, {
    defaultValue,
    serializer: (value) => value.toString(),
    deserializer: (value) => Number(value)
  });
}

export function useBooleanStorage(key: string, defaultValue: boolean = false) {
  return useLocalStorage<boolean>(key, {
    defaultValue,
    serializer: (value) => value.toString(),
    deserializer: (value) => value === 'true'
  });
}

export function useArrayStorage<T>(key: string, defaultValue: T[] = []) {
  return useLocalStorage<T[]>(key, { defaultValue });
}

export function useObjectStorage<T extends Record<string, any>>(
  key: string, 
  defaultValue: T = {} as T
) {
  return useLocalStorage<T>(key, { defaultValue });
} 