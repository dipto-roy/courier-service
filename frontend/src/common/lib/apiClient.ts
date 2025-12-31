import axios from 'axios';
import { eventBus } from './eventBus';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch CSRF token from backend
let csrfToken: string | null = null;
const fetchCsrfToken = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/csrf/token`,
      { withCredentials: true }
    );
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Initialize CSRF token on app start
if (typeof window !== 'undefined') {
  fetchCsrfToken();
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for non-GET requests
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken },
          );

          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed, logout user
        eventBus.emit('auth:logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
