import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const PAYMENT_API_URL = process.env.REACT_APP_PAYMENT_API_URL;

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message || error);
  }
);

// Payment API client
const paymentClient = axios.create({
  baseURL: PAYMENT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  register: (userData) =>
    apiClient.post('/auth/register', userData),

  getMe: () =>
    apiClient.get('/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return apiClient.post('/auth/logout');
  }
};

// Properties APIs
export const propertiesAPI = {
  getAll: () => apiClient.get('/properties'),

  getById: (id) => apiClient.get(`/properties/${id}`),

  create: (propertyData) =>
    apiClient.post('/properties', propertyData),

  update: (id, propertyData) =>
    apiClient.put(`/properties/${id}`, propertyData),

  delete: (id) =>
    apiClient.delete(`/properties/${id}`),

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);

    return apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Note: setUploadProgress should be handled by the component using this API
        return percentCompleted;
      },
      timeout: 300000 // 5 minutes timeout for large files
    });
  }
};

// Bookings APIs
export const bookingsAPI = {
  getAll: () => apiClient.get('/bookings'),

  getByAgent: (agentId) =>
    apiClient.get(`/bookings/agent/${agentId}`),

  getById: (id) =>
    apiClient.get(`/bookings/${id}`),

  create: (bookingData) =>
    apiClient.post('/bookings', bookingData),

  update: (id, bookingData) =>
    apiClient.put(`/bookings/${id}`, bookingData),

  getUnavailableDates: (propertyId, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiClient.get(`/bookings/unavailable-dates/${propertyId}`, { params });
  },

  getUnavailableRanges: (propertyId) =>
    apiClient.get(`/bookings/unavailable-ranges/${propertyId}`),

  cancel: (id) =>
    apiClient.post(`/bookings/${id}/cancel`),

  // ADD THIS METHOD
  processPayment: (paymentData) =>
    apiClient.post(`/bookings/${paymentData.bookingId}/payment`, paymentData)
};

// Agents APIs
export const agentsAPI = {
  getAll: () => apiClient.get('/agents'),

  // Aggregated stats: { agentId, name, totalAmount, bookingCount }
  getStats: (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiClient.get('/agents/stats', { params });
  },

  getById: (id) =>
    apiClient.get(`/agents/${id}`),

  approve: (id) =>
    apiClient.post(`/agents/${id}/approve`),

  suspend: (id) =>
    apiClient.post(`/agents/${id}/suspend`),

  updateCommission: (id, rate) =>
    apiClient.put(`/agents/${id}/commission`, { commissionRate: rate })
};

// Commissions APIs
export const commissionsAPI = {
  getAll: () => apiClient.get('/commissions'),

  getByAgent: (agentId) =>
    apiClient.get(`/commissions/agent/${agentId}`),

  processPayout: (commissionId, paymentData) =>
    apiClient.post(`/commissions/${commissionId}/process`, paymentData),

  getMyPayouts: () =>
    apiClient.get('/commissions/my-payouts'),

  requestPayout: (agentId, payoutAmount, description) =>
    apiClient.post('/commissions/request-payout', {agentId, payoutAmount, description }),
  
  getAllPayouts: (status = null) => {
    if (status != null) {
      return apiClient.get(`/commissions/admin/payouts?status=${status}`);
    }
    return apiClient.get('/commissions/admin/payouts')
  },

  approvePayout: (id, approvedAmount, adminNote) =>
    apiClient.post(`/commissions/admin/payouts/${id}/approve`, { approvedAmount, adminNote }),

  approvePayoutWithAmount: (id, approvedAmount, adminNote) =>
    apiClient.post(`/commissions/admin/payouts/${id}/approve`, { approvedAmount, adminNote }),

  denyPayout: (id, adminNote) =>
    apiClient.post(`/commissions/admin/payouts/${id}/deny`, { adminNote }),

  modifyPayout: (id, modifiedAmount, adminNote) =>
    apiClient.put(`/commissions/admin/payouts/${id}/modify`, { modifiedAmount, adminNote }),
  
  getComissionStats: () =>
    apiClient.get('/commissions/admin/stats')
};

// Calendar APIs
export const calendarAPI = {
  getAvailability: (propertyId, startDate, endDate) =>
    apiClient.get(`/calendar/availability`, {
      params: { propertyId, start: startDate, end: endDate }
    }),

  blockDates: (propertyId, dates) =>
    apiClient.post('/calendar/block', { propertyId, dates })
};

// Payment APIs
export const paymentAPI = {
  createPaymentLink: (bookingData) =>
    paymentClient.post('/payments/create-link', bookingData),

  getPaymentStatus: (reference) =>
    paymentClient.get(`/payments/${reference}/status`),

  verifyPayment: async (reference) => {
    console.log('🔧 API: Verifying payment with reference:', reference);
    try {
      const response = await paymentClient.post('/payments/verify', { reference });
      console.log('🔧 API: Verify response:', response);
      return response;
    } catch (error) {
      console.error('🔧 API: Verify error:', error);
      throw error;
    }
  }
};