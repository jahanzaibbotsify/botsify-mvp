
import axios from 'axios'
import { BOTSIFY_BASE_URL } from './config';

export const axiosInstance = axios.create({
  baseURL: `${BOTSIFY_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const uploadInstance = axios.create({
    baseURL: `${BOTSIFY_BASE_URL}`,
    headers: { 'Content-Type': 'multipart/form-data' },
  })