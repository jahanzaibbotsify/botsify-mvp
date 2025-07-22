
import axios from 'axios'
import { BOTSIFY_AUTH_TOKEN, BOTSIFY_BASE_URL } from './config';

export const axiosInstance = axios.create({
  baseURL: `${BOTSIFY_BASE_URL}`,
  headers: {
    'Authorization': `Bearer ${BOTSIFY_AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
})

export const uploadInstance = axios.create({
    baseURL: `${BOTSIFY_BASE_URL}`,
    headers: { 
      'Authorization': `Bearer ${BOTSIFY_AUTH_TOKEN}`,
      'Content-Type': 'multipart/form-data',
     },
  })