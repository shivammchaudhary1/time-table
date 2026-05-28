import axios from 'axios';

const resolveApiBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_URL?.trim();

  if (!rawUrl) {
    console.warn('⚠️ VITE_API_URL not set, using default production URL');
    return 'https://smart-timetable-1-smts.onrender.com/api';
  }

  return rawUrl.replace(/\/+$/, '').replace(/\/api$/, '') + '/api';
};

const API = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

const refreshAccessTokenSilently = async () => {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;

  try {
    refreshPromise = axios.post(
      `${API.defaults.baseURL}/auth/refresh`,
      {},
      { withCredentials: true }
    );

    const res = await refreshPromise;
    const { accessToken } = res.data;

    localStorage.setItem('accessToken', accessToken);
    API.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    console.log('✅ Token refreshed successfully');
    return accessToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);
    localStorage.removeItem('accessToken');
    window.location.href = '/';
    throw error;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

// Request interceptor - Add token to Authorization header
API.interceptors.request.use((config) => {
  console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);

  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Access token attached to request');
  }

  return config;
});

// Response interceptor - Handle token expiration and refresh
API.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);

    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      console.log('💾 Access token saved to localStorage');
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isTokenExpired = error.response?.data?.code === 'TOKEN_EXPIRED';
    const hasToken = !!localStorage.getItem('accessToken');

    // If not 401 or already retried, reject immediately
    if (!isUnauthorized || originalRequest._retry) {
      console.error(`❌ ${error.response?.status || 'Network'} Error:`, error.message);
      return Promise.reject(error);
    }

    // If 401 but NO token in localStorage, user is not logged in - just reject
    if (!hasToken) {
      console.log('ℹ️ No token found, user is not logged in');
      return Promise.reject(error);
    }

    // If 401 with token, try to refresh
    originalRequest._retry = true;

    if (isTokenExpired) {
      console.log('🔄 Access token expired, attempting refresh...');
      try {
        const newToken = await refreshAccessTokenSilently();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        console.log('🔁 Retrying original request with new token');
        return API(originalRequest);
      } catch (refreshError) {
        console.error('🔐 Failed to refresh token, user logged out');
        localStorage.removeItem('accessToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // Other 401 errors with token = invalid token, logout
    console.warn('🔐 Invalid token, logging out');
    localStorage.removeItem('accessToken');
    window.location.href = '/';
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const refreshAccessToken = () => API.post('/auth/refresh');
export const logout = async () => {
  localStorage.removeItem('accessToken');
  return API.post('/auth/logout');
};

// Courses
export const getCourses = () => API.get('/courses');
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);

// Constraints
export const getConstraints = () => API.get('/constraints');
export const updateConstraints = (data) => API.put('/constraints', data);

// Timetable
export const generateTimetable = () => API.post('/timetable/generate');
export const getTimetable = () => API.get('/timetable');
export const getConflicts = () => API.get('/timetable/conflicts');

// Rooms
export const getRooms = () => API.get('/rooms');
export const createRoom = (data) => API.post('/rooms', data);
export const updateRoom = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);

export default API;
