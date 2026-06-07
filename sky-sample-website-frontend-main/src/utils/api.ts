import axios from 'axios';

// Centralized Axios client configured to use the company template's backend API base URL
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_BASE_URL || '') + '/api'
});

// Automatically inject Bearer Token on every request if it exists in localStorage (matching template storage key 'token')
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.Accept = 'application/json';
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 403) {
            const msg = error.response?.data?.message || 'You do not have permission to perform this action.';
            window.dispatchEvent(new CustomEvent('permission-denied', { detail: msg }));
        }
        return Promise.reject(error?.response ?? error);
    }
);

export default api;
