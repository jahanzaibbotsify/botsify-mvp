import axios from 'axios'
import {BOTSIFY_BASE_URL} from './config';

// Get initial token from localStorage
const getInitialToken = () => {
    const token = localStorage.getItem('accessToken');
    return token ? JSON.parse(token) : null;
}

export const axiosInstance = axios.create({
    baseURL: `${BOTSIFY_BASE_URL}`,
    headers: {
        'Authorization': `Bearer ${getInitialToken()}`,
        'Content-Type': 'application/json'
    }
})

export const uploadInstance = axios.create({
    baseURL: `${BOTSIFY_BASE_URL}`,
    headers: {
        'Authorization': `Bearer ${getInitialToken()}`,
        'Content-Type': 'multipart/form-data',
    },
})

// Add request interceptor to dynamically get token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${JSON.parse(token)}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add request interceptor for upload instance
uploadInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${JSON.parse(token)}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const errorResponse = error.response;
        if (errorResponse?.status === 401 && errorResponse?.data?.message?.includes('Unauthenticated')) {
            // Clear auth data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            // Redirect to unauthenticated page
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

// Add response interceptor for upload instance
uploadInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const errorResponse = error.response;
        if (errorResponse?.status === 401 && errorResponse?.data?.message?.includes('Unauthenticated')) {
            // Clear auth data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            // Redirect to unauthenticated page
            window.location.href = '/unauthenticated';
        }
        return Promise.reject(error);
    }
);