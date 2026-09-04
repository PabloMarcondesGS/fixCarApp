import { Platform } from 'react-native';

const DEV_API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000/api'
  : 'http://18.118.131.155:3000/api';
const PROD_API_URL = 'http://18.118.131.155:3000/api';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const API_ENDPOINTS = {
  WORKSHOPS: `${API_BASE_URL}/workshops`,
  VEHICLES: `${API_BASE_URL}/vehicles`,
  APPOINTMENTS: `${API_BASE_URL}/appointments`,
  PLANS: `${API_BASE_URL}/plans`,
  LOGIN: `${API_BASE_URL}/login`,
  BLOCKED_SLOTS: `${API_BASE_URL}/blocked-slots`,
  REVIEWS: `${API_BASE_URL}/reviews`
};

export const apiFetch = async (url: string, token?: string | null, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, { ...options, headers });
};
