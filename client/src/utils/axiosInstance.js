import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : 'http://localhost:5555'
});

export default axiosInstance;
