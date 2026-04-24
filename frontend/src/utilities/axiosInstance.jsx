import axios from "axios";
import {BASE_URL} from "./constants.js";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 3600000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle 401 Unauthorized errors gracefully instead of full page reload.
            // The ProtectedRoute or component level will handle redirecting the user if needed.
            console.warn("401 Unauthorized request:", error.config.url);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;


