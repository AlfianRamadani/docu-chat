import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export const AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {}
});
