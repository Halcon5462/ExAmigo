import axios from 'axios';
import API_URL from './api_url.js'


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/token/refresh/') {
            originalRequest._retry = true;

            try {
                const refresh = localStorage.getItem('refresh');
                if (!refresh) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/token/refresh/`, {
                    refresh,
                });

                const { access } = response.data;
                localStorage.setItem('access', access);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;