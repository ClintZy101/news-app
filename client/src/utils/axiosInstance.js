import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' ? 'https://api.productionurl.com' : 'http://localhost:5555';

const axiosInstance = axios.create({
    baseURL: baseURL,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
