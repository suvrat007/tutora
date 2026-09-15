import axios from "axios";
import toast from "react-hot-toast";
import { installGuestAdapter } from "./guest/guestAdapter.js";

const axiosInstance = axios.create({
    baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api/v1',
    timeout: 30000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

// Guest writes are answered locally and never reach the network. Reads are
// untouched, so the demo shows real data from the real API.
installGuestAdapter(axiosInstance);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isCancel(error)) return Promise.reject(error);
        if (error.code === 'ECONNABORTED') {
            error.message = 'Request timed out. Please check your connection and try again.';
        } else if (error.response?.status === 403 && error.response.data?.code === 'GUEST_READ_ONLY') {
            // The backend refusing a guest write. The adapter normally stops
            // these before they leave the browser, so reaching here means a
            // call bypassed it - tell the user plainly rather than failing mute.
            toast("Changes aren't saved in the demo.", { id: 'guest-read-only' });
        } else if (error.response?.status === 401) {
            console.warn("401 Unauthorized request:", error.config?.url);
        } else if (error.response?.status === 429) {
            const retryAfter = error.response.headers?.['retry-after'];
            const mins = retryAfter ? Math.ceil(Number(retryAfter) / 60) : 15;
            toast.error(`Too many requests. Please try again in ${mins} minute${mins !== 1 ? 's' : ''}.`, {
                id: 'rate-limit',
                duration: 6000,
            });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;


