import axios from "axios";

const axiosInstance = axios.create({
    baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api/v1',
    timeout: 30000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isCancel(error)) return Promise.reject(error);
        if (error.code === 'ECONNABORTED') {
            error.message = 'Request timed out. Please check your connection and try again.';
        } else if (error.response?.status === 401) {
            console.warn("401 Unauthorized request:", error.config?.url);
        } else if (error.response?.status === 403) {
            const code = error.response?.data?.code;
            if (code === 'UPGRADE_TO_PRO' || code === 'STUDENT_LIMIT_REACHED') {
                window.dispatchEvent(new CustomEvent('merikaksha:upgrade', {
                    detail: { reason: error.response.data.error ?? code },
                }));
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;


