import { useEffect, useState } from 'react';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

const useRazorpay = () => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
            setLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT;
        script.onload = () => setLoaded(true);
        script.onerror = () => console.error('Failed to load Razorpay SDK');
        document.body.appendChild(script);
    }, []);

    return loaded;
};

export default useRazorpay;
