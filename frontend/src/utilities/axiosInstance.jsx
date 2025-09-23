import axios from "axios";
import {BASE_URL} from "./constants.js";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: '36000m',
    headers: {
        "Content-Type": "application/json",
    }
})
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle 401 Unauthorized errors (e.g., redirect to login)
            // You can dispatch a logout action here or redirect to the login page
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;


