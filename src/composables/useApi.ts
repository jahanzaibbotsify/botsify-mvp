import { useAuthStore } from '@/stores/authStore'
import { axiosInstance } from '@/utils/axiosInstance'

export function useApi() {
  const authStore = useAuthStore()

  const apiGet = async (url: string, config = {}) => {
    // You can access authStore here
    const token = authStore.accessToken || localStorage.getItem('accessToken')
    
    return axiosInstance.get(url, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    })
  }

  const apiPost = async (url: string, data = {}, config = {}) => {
    const token = authStore.accessToken || localStorage.getItem('accessToken')
    
    return axiosInstance.post(url, data, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    })
  }

  const apiPut = async (url: string, data = {}, config = {}) => {
    const token = authStore.accessToken || localStorage.getItem('accessToken')
    
    return axiosInstance.put(url, data, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    })
  }

  const apiDelete = async (url: string, config = {}) => {
    const token = authStore.accessToken || localStorage.getItem('accessToken')
    
    return axiosInstance.delete(url, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    })
  }

  return {
    apiGet,
    apiPost,
    apiPut,
    apiDelete
  }
} 