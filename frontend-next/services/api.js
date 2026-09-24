// import axios from 'axios';

// const API_BASE_URL = '/api';

// const api = axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });

// api.interceptors.request.use((config) => {
//     const token = typeof window !== 'undefined' ? localStorage.getItem('evertree_token') : null;
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// }, (error) => {
//     return Promise.reject(error);
// });

// export const authAPI = {
//     sendOtp: (data) => api.post('/auth/send-otp', data),
//     verifyOtp: (data) => api.post('/auth/verify-otp', data),
//     register: (userData) => api.post('/auth/register', userData),
//     login: (credentials) => api.post('/auth/login', credentials),
//     getProfile: () => api.get('/auth/profile'),
//     getPendingVerifications: () => api.get('/auth/pending-verifications'),
//     approveUser: (user_id) => api.post('/auth/approve-user', { user_id })
// };

// export const propertyAPI = {
//     getProperties: (params) => api.get('/properties', { params }),
//     getPropertyById: (id) => api.get(`/properties/${id}`),
//     createProperty: (formData) => api.post('/properties', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//     }),
//     getMyListings: () => api.get('/properties/my-listings'),
//     toggleFavorite: (property_id) => api.post('/properties/favorite', { property_id }),
//     getFavorites: () => api.get('/properties/favorites'),
//     createEnquiry: (data) => api.post('/properties/enquiry', data),
//     getEnquiries: () => api.get('/properties/enquiries')
// };

// export const chatAPI = {
//     getConversations: () => api.get('/chat/conversations'),
//     getMessages: (partnerId) => api.get(`/chat/messages/${partnerId}`),
//     uploadChatFile: (formData) => api.post('/chat/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//     })
// };

// export const serviceAPI = {
//     submitLead: (leadData) => api.post('/services/lead', leadData),
//     calculateEmi: (data) => api.post('/services/emi-calculator', data)
// };

// export default api;
import axios from 'axios';

const API_BASE_URL = '/api';


// =====================================================
// AXIOS INSTANCE
// =====================================================

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        Accept: 'application/json'
    }
});


// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
    (config) => {

        // -------------------------------------------------
        // JWT TOKEN
        // -------------------------------------------------

        if (typeof window !== 'undefined') {

            const token =
                localStorage.getItem('evertree_token');

            if (token) {

                config.headers =
                    config.headers || {};

                config.headers.Authorization =
                    `Bearer ${token}`;
            }
        }


        // -------------------------------------------------
        // FORM DATA / JSON CONTENT TYPE
        // -------------------------------------------------

        /*
         * IMPORTANT:
         *
         * For FormData requests, DO NOT manually set
         * Content-Type.
         *
         * The browser will automatically generate:
         *
         * multipart/form-data;
         * boundary=---------------------------
         *
         * This is required by Multer on the backend.
         */

        if (
            typeof FormData !== 'undefined' &&
            config.data instanceof FormData
        ) {

            delete config.headers['Content-Type'];
            delete config.headers['content-type'];

        } else {

            config.headers =
                config.headers || {};

            config.headers['Content-Type'] =
                'application/json';
        }


        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(

    (response) => {
        return response;
    },

    (error) => {

        console.error(
            'API Error:',
            error.config?.method?.toUpperCase(),
            error.config?.url,
            error.response?.status,
            error.response?.data || error.message
        );

        return Promise.reject(error);
    }
);


// =====================================================
// AUTH API
// =====================================================

export const authAPI = {
    sendOtp: (data) => api.post('/auth/send-otp', data),
    verifyOtp: (data) => api.post('/auth/verify-otp', data),
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
    changePassword: (data) => api.post('/auth/change-password', data),
    getPendingVerifications: () => api.get('/auth/pending-verifications'),
    approveUser: (user_id) => api.post('/auth/approve-user', { user_id })
};


// =====================================================
// PROPERTY API
// =====================================================

export const propertyAPI = {

    // -------------------------------------------------
    // Get all properties
    // -------------------------------------------------

    getProperties: (params = {}) =>
        api.get(
            '/properties',
            {
                params
            }
        ),


    // -------------------------------------------------
    // Get single property
    // -------------------------------------------------

    getPropertyById: (id) => {

        if (!id) {

            return Promise.reject(
                new Error(
                    'Property ID is required.'
                )
            );
        }

        return api.get(
            `/properties/${id}`
        );
    },


    // -------------------------------------------------
    // Create property
    // -------------------------------------------------

    createProperty: (formData) => {

        if (
            typeof FormData !== 'undefined' &&
            !(formData instanceof FormData)
        ) {

            return Promise.reject(
                new Error(
                    'createProperty requires FormData.'
                )
            );
        }

        return api.post(
            '/properties',
            formData
        );
    },


    // -------------------------------------------------
    // Seller listings
    // -------------------------------------------------

    getMyListings: () =>
        api.get(
            '/properties/my-listings'
        ),


    // -------------------------------------------------
    // Delete seller property
    // -------------------------------------------------

    deleteProperty: (propertyId) => {

        if (!propertyId) {

            return Promise.reject(
                new Error(
                    'Property ID is required.'
                )
            );
        }

        return api.delete(
            `/properties/${Number(propertyId)}`
        );
    },


    // -------------------------------------------------
    // Toggle wishlist
    // -------------------------------------------------

    toggleFavorite: (property_id) => {

        if (!property_id) {

            return Promise.reject(
                new Error(
                    'Property ID is required.'
                )
            );
        }

        return api.post(
            '/properties/favorite',
            {
                property_id:
                    Number(property_id)
            }
        );
    },


    // -------------------------------------------------
    // Get logged-in user's wishlist
    // -------------------------------------------------

    getFavorites: () =>
        api.get(
            '/properties/favorites'
        ),


    // -------------------------------------------------
    // Create enquiry
    // -------------------------------------------------

    createEnquiry: (data) =>
        api.post(
            '/properties/enquiry',
            data
        ),


    // -------------------------------------------------
    // Get enquiries
    // -------------------------------------------------

    getEnquiries: () =>
        api.get(
            '/properties/enquiries'
        )
};


// =====================================================
// CHAT API
// =====================================================

export const chatAPI = {
    getConversations: () => api.get('/chat/conversations'),
    getMessages: (partnerId) => api.get(`/chat/messages/${partnerId}`),
    getAdminConversations: () => api.get('/chat/admin/conversations'),
    sendMessage: (data) => api.post('/chat/messages', data),
    
    uploadChatFile: (formData) => api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};


// =====================================================
// SERVICE API
// =====================================================

export const serviceAPI = {

    submitLead: (leadData) =>
        api.post(
            '/services/lead',
            leadData
        ),

    calculateEmi: (data) =>
        api.post(
            '/services/emi-calculator',
            data
        ),

    getBrokerRequests: () =>
        api.get(
            '/services/broker-requests'
        )
};

export const adminAPI = {
    getOverview: () => api.get('/admin/overview'),

    getUsers: () => api.get('/admin/users'),

    getPendingUsers: () => api.get('/admin/users/pending'),

    approveUser: (id) =>
        api.patch(`/admin/users/${id}/approve`),

    rejectUser: (id, remarks) =>
        api.patch(`/admin/users/${id}/reject`, { remarks }),

    getProperties: () =>
        api.get('/admin/properties'),

    updatePropertyStatus: (id, status, remarks) =>
        api.patch(`/admin/properties/${id}/status`, {
            status,
            remarks
        })
};

export default api;