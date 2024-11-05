import axios from 'axios';  // Pastikan axios sudah diinstall

// Debug log untuk memastikan file diload
console.log('Loading api.js...');

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => localStorage.getItem('token');

// Buat instance axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://backend-kejaksaan-production.up.railway.app',
  timeout: 5000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json', 
    'Accept': 'application/json'
  }
});

// Tambahkan validasi untuk memastikan api terdefinisi
if (!api) {
  console.error('Axios instance not created properly');
}

// Request interceptor dengan logging
api.interceptors.request.use(
  config => {
    // Tambahkan token dari localStorage
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Hapus penambahan /api karena sudah ada di backend URL
    if (config.url.startsWith('/api')) {
      config.url = config.url.substring(4);
    }

    // Log request
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data || null,  // Tambahkan null check
      headers: config.headers
    });

    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor dengan logging
api.interceptors.response.use(
  response => {
    // Log successful response
    console.log('API Response:', {
      status: response.status,
      data: response.data || null,  // Tambahkan null check
      url: response.config.url
    });
    return response;
  },
  error => {
    // Log error response dengan detail lebih lengkap
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data || null,  // Tambahkan null check
      url: error.config?.url,
      message: error.message,
      stack: error.stack
    });

    // Handle berbagai status code
    switch (error.response?.status) {
      case 401:
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        console.error('Access forbidden');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 500:
        console.error('Server error');
        break;
      default:
        console.error('Unhandled error status:', error.response?.status);
    }

    return Promise.reject({
      ...error,
      message: error.response?.data?.message || error.message
    });
  }
);

// Helper functions untuk endpoint umum
const apiHelpers = {
  // Profile endpoints
  profile: {
    get: async () => {
      console.log('Calling profile.get()'); // Debug log
      if (!api) throw new Error('API instance not initialized');
      return api.get('/profile');
    },
    update: async (data) => {
      console.log('Calling profile.update() with data:', data); // Debug log
      if (!api) throw new Error('API instance not initialized');
      return api.put('/profile', data);
    },
    uploadAvatar: async (formData) => {
      console.log('Calling profile.uploadAvatar()'); // Debug log
      if (!api) throw new Error('API instance not initialized');
      return api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  },
  
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      console.log('Calling auth.login()'); // Debug log
      if (!api) throw new Error('API instance not initialized');
      return api.post('/auth/login', credentials);
    },
    logout: async () => {
      console.log('Calling auth.logout()'); // Debug log
      if (!api) throw new Error('API instance not initialized');
      return api.post('/auth/logout');
    },
    register: (userData) => api.post('/auth/register', userData)
  }
};

export { apiHelpers };
export default api;