// Centralized API configuration
// Substitua pelo seu IP local para teste em dispositivos físicos (Desenvolvimento)
// Substitua pela URL do seu servidor para produção (Beta/Play Store)

const DEV_API_URL = 'http://192.168.15.9:3000/api';
const PROD_API_URL = 'https://api.seudominio.com/api'; // <--- ALTERE PARA O SEU SERVIDOR REAL

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
