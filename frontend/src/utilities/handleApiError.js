import toast from 'react-hot-toast';

export const handleApiError = (err, fallback = 'Something went wrong') => {
    const message = err?.response?.data?.message || err?.message || fallback;
    toast.error(message);
};

export const handleApiSuccess = (message) => {
    toast.success(message);
};
