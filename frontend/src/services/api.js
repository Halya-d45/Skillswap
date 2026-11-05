import axios from 'axios';
import { disconnectSocket } from './socket';

// Base URL for the Express backend API
// Configured from environment variable VITE_API_URL or fallback to localhost
const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5001/api';

// Normalize URL: trim whitespace, strip trailing slashes, ensure it ends with /api
const cleanApiUrl = rawApiUrl.trim().replace(/\/+$/, '');
export const API_BASE_URL = cleanApiUrl.endsWith('/api')
  ? cleanApiUrl
  : `${cleanApiUrl}/api`;

/**
 * Helper to produce friendly, diagnostic error messages
 */
export const getErrorMessage = (err, fallback = 'Something went wrong. Please check your connection and try again.') => {
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  const isHosted =
    typeof window !== 'undefined' &&
    !['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (isHosted && API_BASE_URL.includes('localhost')) {
    return 'Backend URL is not configured on Vercel! Please add VITE_API_URL in your Vercel Project Settings pointing to your deployed backend URL.';
  }

  if (!err?.response) {
    return 'Cannot reach the backend server. If using a free host like Render, it may take 30-50s to wake up from sleep. Please check your backend status.';
  }

  return fallback;
};

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Automatically attach JWT Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: If 401 Unauthorized, automatically clear invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token only if on a protected route request failure
      if (localStorage.getItem('token')) {
        console.warn('Session expired or unauthorized. Clearing stored token.');
      }
    }
    return Promise.reject(error);
  }
);

/* ============================================================
   AUTHENTICATION SERVICE
============================================================ */

export const authService = {
  // Register new user: POST /api/auth/register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Note: Registration does not issue a JWT token until email OTP verification succeeds
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Verify email using 6-digit OTP: POST /api/auth/verify-email
  verifyEmail: async ({ email, otp }) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Resend registration verification OTP: POST /api/auth/resend-verification-otp
  resendVerificationOtp: async ({ email }) => {
    const response = await api.post('/auth/resend-verification-otp', { email });
    return response.data;
  },

  // Request password reset OTP: POST /api/auth/forgot-password
  forgotPassword: async ({ email }) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password using email, OTP, and new password: POST /api/auth/reset-password
  resetPassword: async ({ email, otp, newPassword }) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  // Log in user: POST /api/auth/login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Log out user
  logout: () => {
    disconnectSocket();
    localStorage.removeItem('token');
    localStorage.removeItem('skillswap_user');
  },

  // Get logged-in user profile: GET /api/auth/profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update profile: PUT /api/auth/profile
  updateProfile: async (updatedData) => {
    const response = await api.put('/auth/profile', updatedData);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Get all registered users: GET /api/auth/users
  getAllUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
};

/* ============================================================
   SKILL MANAGEMENT SERVICE
============================================================ */

export const skillService = {
  // View all available skills with search and category filters: GET /api/skills
  getAllSkills: async (params = {}) => {
    const response = await api.get('/skills', { params });
    return response.data;
  },

  // Search skills specifically by keyword: GET /api/skills/search?q=...
  searchSkills: async (keyword) => {
    const response = await api.get('/skills/search', {
      params: { q: keyword },
    });
    return response.data;
  },

  // View skill by ID: GET /api/skills/:id
  getSkillById: async (skillId) => {
    const response = await api.get(`/skills/${skillId}`);
    return response.data;
  },

  // Create/Add a skill: POST /api/skills
  createSkill: async (skillData) => {
    const response = await api.post('/skills', skillData);
    return response.data;
  },

  // Update a skill: PUT /api/skills/:id
  updateSkill: async (skillId, skillData) => {
    const response = await api.put(`/skills/${skillId}`, skillData);
    return response.data;
  },

  // Delete a skill: DELETE /api/skills/:id
  deleteSkill: async (skillId) => {
    const response = await api.delete(`/skills/${skillId}`);
    return response.data;
  },

  // View skills by logged-in user: GET /api/skills/user
  getUserSkills: async () => {
    const response = await api.get('/skills/user');
    return response.data;
  },
};

/* ============================================================
   SKILL EXCHANGE REQUESTS SERVICE
============================================================ */

export const requestService = {
  // Send skill exchange request: POST /api/requests
  sendRequest: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  // View sent requests: GET /api/requests/sent
  getSentRequests: async () => {
    const response = await api.get('/requests/sent');
    return response.data;
  },

  // View received requests: GET /api/requests/received
  getReceivedRequests: async () => {
    const response = await api.get('/requests/received');
    return response.data;
  },

  // Accept incoming request: PUT /api/requests/:id/accept
  acceptRequest: async (requestId) => {
    const response = await api.put(`/requests/${requestId}/accept`);
    return response.data;
  },

  // Reject incoming request: PUT /api/requests/:id/reject
  rejectRequest: async (requestId) => {
    const response = await api.put(`/requests/${requestId}/reject`);
    return response.data;
  },

  // Cancel pending sent request: DELETE /api/requests/:id
  cancelRequest: async (requestId) => {
    const response = await api.delete(`/requests/${requestId}`);
    return response.data;
  },

  // Update request status (backward compatibility): PUT /api/requests/:id/status
  updateRequestStatus: async (requestId, status) => {
    const response = await api.put(`/requests/${requestId}/status`, { status });
    return response.data;
  },
};

/* ============================================================
   PRIVATE REAL-TIME CHAT SERVICE
============================================================ */

export const chatService = {
  // Get all active conversation threads for accepted requests: GET /api/chat/conversations
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  // Get message history for a specific accepted request: GET /api/chat/messages/:requestId
  getMessages: async (requestId) => {
    const response = await api.get(`/chat/messages/${requestId}`);
    return response.data;
  },

  // Send a message via REST endpoint: POST /api/chat/messages/:requestId
  sendMessage: async (requestId, text) => {
    const response = await api.post(`/chat/messages/${requestId}`, { text });
    return response.data;
  },

  // Mark all unread messages in conversation as read: PUT /api/chat/messages/:requestId/read
  markAsRead: async (requestId) => {
    const response = await api.put(`/chat/messages/${requestId}/read`);
    return response.data;
  },
};

export default api;
