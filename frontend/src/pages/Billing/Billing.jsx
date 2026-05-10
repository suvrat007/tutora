import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { CreditCard, Zap, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setSubscription } from "@/utilities/redux/subscriptionSlice.js";
import SubscribeButton from "@/components/SubscribeButton.jsx";

const STATUS_CONFIG = {
    active: { label: "Active", color: "text-green-700 bg-green-50 border-green-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    pending: { label: "Pending (retrying)", color: "text-yellow-700 bg-yellow-50 border-yellow-200", icon: <Clock className="w-3.5 h-3.5" /> },
    halted: { label: "Halted — payment failed", color: "text-red-700 bg-red-50 border-red-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    cancelled: { label: "Cancelled", color: "text-gray-600 bg-gray-50 border-gray-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    authenticated: { label: "Activating…", color: "text-blue-700 bg-blue-50 border-blue-200", icon: <Clock className="w-3.5 h-3.5" /> },
    none: { label: "Free plan", color: "text-[#8b5e3c] bg-[#fef3e8] border-[#d08f56]/30", icon: null },
    free: { label: "Free plan", color: "text-[#8b5e3c] bg-[#fef3e8] border-[#d08f56]/30", icon: null },
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const Billing = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const subscription = useSelector((s) => s.subscription);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const statusKey = subscription?.status === 'none' ? 'none' : (subscription?.planType === 'free' ? 'free' : subscription?.status);
    const statusConfig = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.none;

    const handleCancel = async () => {
        setCancelLoading(true);
        try {
            await axiosInstance.post("subscription/cancel");
            const { data } = await axiosInstance.get("subscription/status");
            dispatch(setSubscription(data));
            toast.success("Subscription cancelled. Access continues until your billing period ends.");
            setShowCancelConfirm(false);
        } catch (err) {
            toast.error(err.response?.data?.error ?? "Failed to cancel. Please try again.");
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto space-y-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-[#fef3e8] border border-[#e6c8a8]">
                        <CreditCard className="w-5 h-5 text-[#a0683f]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1a0f07]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Plan & Billing
                    </h1>
                </div>

                {/* Current plan card */}
                <div className="rounded-2xl border border-[#e6c8a8] bg-white p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <p className="text-xs text-[#9b8778] uppercase tracking-wider font-semibold mb-1">Current plan</p>
                            <p className="text-xl font-bold text-[#1a0f07]">
                                {subscription?.planType === 'annual' ? 'Pro Annual'
                                    : subscription?.planType === 'monthly' ? 'Pro Monthly'
                                    : 'Free'}
                            </p>
                        </div>

                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#f0e0cc]">
                        <div>
                            <p className="text-xs text-[#9b8778] mb-0.5">
                                {subscription?.isPro ? 'Next billing date' : 'Student limit'}
                            </p>
                            <p className="text-sm font-medium text-[#3d2b1a]">
                                {subscription?.isPro
                                    ? formatDate(subscription.currentPeriodEnd)
                                    : '12 students'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[#9b8778] mb-0.5">Payments made</p>
                            <p className="text-sm font-medium text-[#3d2b1a]">{subscription?.paidCount ?? 0}</p>
                        </div>
                    </div>
                </div>

                {/* Upgrade or manage */}
                {!subscription?.isPro ? (
                    <div className="rounded-2xl border border-[#e6c8a8] bg-white p-6">
                        <p className="text-sm font-semibold text-[#1a0f07] mb-1">Upgrade to Pro</p>
                        <p className="text-xs text-[#9b8778] mb-5">
                            Unlock unlimited students, parent portal, and test management.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <SubscribeButton
                                planType="annual"
                                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1a0f07] text-white text-sm font-semibold hover:bg-[#2c1a0e] transition-colors flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                Annual — ₹2,999/year
                            </SubscribeButton>
                            <SubscribeButton
                                planType="monthly"
                                className="flex-1 py-2.5 px-4 rounded-xl border border-[#d08f56] text-[#8b5e3c] text-sm font-semibold hover:bg-[#fef3e8] transition-colors"
                            >
                                Monthly — ₹349/month
                            </SubscribeButton>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[#e6c8a8] bg-white p-6 space-y-3">
                        <p className="text-sm font-semibold text-[#1a0f07]">Manage subscription</p>

                        {subscription?.planType === 'monthly' && (
                            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#fef3e8] border border-[#e6c8a8]">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#a0683f]" />
                                    <span className="text-sm text-[#3d2b1a]">Switch to annual and save 28%</span>
                                </div>
                                <SubscribeButton
                                    planType="annual"
                                    className="text-xs px-3 py-1.5 rounded-lg bg-[#1a0f07] text-white font-semibold hover:bg-[#2c1a0e] transition-colors"
                                >
                                    Upgrade
                                </SubscribeButton>
                            </div>
                        )}

                        {subscription?.status !== 'cancelled' && (
                            <div>
                                {!showCancelConfirm ? (
                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="text-xs text-red-500 hover:underline mt-2"
                                    >
                                        Cancel subscription
                                    </button>
                                ) : (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                                        <p className="text-sm text-red-700 font-medium">Cancel subscription?</p>
                                        <p className="text-xs text-red-600">
                                            Your Pro access continues until {formatDate(subscription?.currentPeriodEnd)}. After that, your account reverts to the free plan.
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCancel}
                                                disabled={cancelLoading}
                                                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                                            >
                                                {cancelLoading ? 'Cancelling…' : 'Yes, cancel'}
                                            </button>
                                            <button
                                                onClick={() => setShowCancelConfirm(false)}
                                                className="px-4 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                                            >
                                                Keep subscription
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <p className="text-center text-xs text-[#9b8778] pt-2">
                    Payments processed securely by Razorpay · Need help?{" "}
                    <a href="mailto:suvratmittal007@gmail.com" className="underline hover:text-[#8b5e3c]">
                        Email us
                    </a>
                </p>
            </motion.div>
        </div>
    );
};

export default Billing;
