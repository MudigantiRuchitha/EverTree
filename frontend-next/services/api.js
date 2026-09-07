import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('evertree_token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authAPI = {
    sendOtp: (data) => api.post('/auth/send-otp', data),
    verifyOtp: (data) => api.post('/auth/verify-otp', data),
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
    getPendingVerifications: () => api.get('/auth/pending-verifications'),
    approveUser: (user_id) => api.post('/auth/approve-user', { user_id })
};

export const propertyAPI = {
    getProperties: (params) => api.get('/properties', { params }),
    getPropertyById: (id) => api.get(`/properties/${id}`),
    createProperty: (formData) => api.post('/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getMyListings: () => api.get('/properties/my-listings'),
    toggleFavorite: (property_id) => api.post('/properties/favorite', { property_id }),
    getFavorites: () => api.get('/properties/favorites'),
    createEnquiry: (data) => api.post('/properties/enquiry', data),
    getEnquiries: () => api.get('/properties/enquiries')
};

export const chatAPI = {
    getConversations: () => api.get('/chat/conversations'),
    getMessages: (partnerId) => api.get(`/chat/messages/${partnerId}`),
    uploadChatFile: (formData) => api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const serviceAPI = {
    submitLead: (leadData) => api.post('/services/lead', leadData),
    calculateEmi: (data) => api.post('/services/emi-calculator', data)
};

export default api;