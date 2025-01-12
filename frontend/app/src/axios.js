import axios from 'axios';

const api = axios.create({
    baseURL: 'http://98.85.96.246:3003', // Base URL for the backend
    withCredentials: true, // Allow cookies
});

export default api;
