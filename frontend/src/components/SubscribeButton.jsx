import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '@/utilities/axiosInstance.jsx';
import { setSubscription } from '@/utilities/redux/subscriptionSlice.js';
import useRazorpay from '@/hooks/useRazorpay.js';

const POLL_INTERVAL = 3000;
const POLL_MAX = 10;

const planLabels = {
    monthly: { label: 'Pro Monthly', price: '₹349/month' },
    annual: { label: 'Pro Annual', price: '₹2,999/year' },
};

const SubscribeButton = ({ planType = 'monthly', className = '', children }) => {
    const razorpayLoaded = useRazorpay();
    const user = useSelector((s) => s.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const pollStatus = async (attempt = 0) => {
        if (attempt >= POLL_MAX) {
            toast('Subscription is processing — your access will activate shortly.');
            return;
        }
        try {
            const { data } = await axiosInstance.get('subscription/status');
            if (data.isPro) {
                dispatch(setSubscription(data));
                toast.success('Subscription activated! Welcome to Pro.');
                navigate('/main');
            } else {
                setTimeout(() => pollStatus(attempt + 1), POLL_INTERVAL);
            }
        } catch {
            setTimeout(() => pollStatus(attempt + 1), POLL_INTERVAL);
        }
    };

    const handleSubscribe = async () => {
        if (!razorpayLoaded) {
            toast.error('Payment SDK not loaded. Please refresh and try again.');
            return;
        }
        setLoading(true);
        try {
            const { data } = await axiosInstance.post('subscription/create', { planType });
            const subscriptionId = data.subscriptionId;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                subscription_id: subscriptionId,
                name: 'MeriKaksha',
                description: planLabels[planType]?.label ?? 'Pro Subscription',
                image: '/logo.png',
                prefill: {
                    name: user?.name ?? '',
                    email: user?.emailId ?? '',
                },
                theme: { color: '#1a0f07' },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        toast('Payment cancelled.');
                    },
                },
                handler: async (response) => {
                    try {
                        await axiosInstance.post('subscription/verify-payment', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        toast.loading('Activating your subscription…', { id: 'sub-activate' });
                        pollStatus();
                    } catch {
                        toast.error('Payment verification failed. Contact support.');
                        setLoading(false);
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                toast.error(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            const msg = err.response?.data?.error;
            if (msg === 'Already have an active subscription') {
                toast('You already have an active subscription.');
            } else {
                toast.error('Could not initiate payment. Please try again.');
            }
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSubscribe}
            disabled={loading || !razorpayLoaded}
            className={className}
        >
            {loading ? 'Processing…' : (children ?? `Subscribe — ${planLabels[planType]?.price}`)}
        </button>
    );
};

export default SubscribeButton;
