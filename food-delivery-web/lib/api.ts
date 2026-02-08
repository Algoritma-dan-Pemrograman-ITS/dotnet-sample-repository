import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token && token.trim() !== '' && token !== 'undefined' && token !== 'null') {
            // Remove any extra quotes if they exist
            const cleanToken = token.replace(/^"|"$/g, '');

            // Basic JWT format check (header.payload.signature) - at least 2 dots
            if (cleanToken.split('.').length >= 2) {
                config.headers.Authorization = `Bearer ${cleanToken}`;
            } else {
                console.warn('[API Interceptor] Token does not look like a valid JWT (missing dots). Skipping Auth header.', cleanToken);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                // Optional: Redirect to login or dispatch an event
                // window.location.href = '/login'; 
            }
        }
        return Promise.reject(error);
    }
);
