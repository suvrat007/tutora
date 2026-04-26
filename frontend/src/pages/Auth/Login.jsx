import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utilities/axiosInstance";
import { useSelector } from "react-redux";
import OnboardingForm from "@/pages/Auth/OnboardingForm.jsx";
import { motion, AnimatePresence } from "framer-motion";
import useFetchUser from "@/hooks/useFetchUser.js";
import toast from "react-hot-toast";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[#e8d5c0] bg-white text-[#2c1a0e] placeholder-[#b0998a] text-sm focus:outline-none focus:ring-2 focus:ring-[#c47d3e]/40 focus:border-[#c47d3e] transition-all disabled:opacity-50";

const Login = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [signupCreds, setSignupCreds] = useState(null);
    const [formData, setFormData] = useState({ name: "", emailId: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const fetchUser = useFetchUser();
    const loggedInUser = useSelector((state) => state.user);

    useEffect(() => {
        if (loggedInUser && !isLoading) navigate("/main");
    }, [loggedInUser, isLoading, navigate]);

    const handleInputChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axiosInstance.post("auth/login", { emailId: formData.emailId, password: formData.password }, { withCredentials: true });
            await fetchUser();
            navigate("/main");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post("auth/google-auth", { credential: credentialResponse.credential }, { withCredentials: true });
            if (response.data.isNewUser) {
                setSignupCreds({ isGoogleUser: true });
            } else {
                await fetchUser();
                navigate("/main");
            }
        } catch (err) {
            toast.error(axios.isAxiosError(err) ? (err.response?.data?.message || err.message) : "Internal server error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupCreds = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.emailId || !formData.password) return;
        setSignupCreds({ name: formData.name, emailId: formData.emailId, password: formData.password });
    };

    if (signupCreds) return <OnboardingForm adminCreds={signupCreds} />;

    return (
        <div className="relative min-h-screen bg-[#faf6f1] flex items-center justify-center px-4 overflow-hidden">
            {/* Background decoration — matches hero */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#e7c6a5]/25 rounded-full blur-[110px]" />
                <div className="absolute bottom-0 right-1/4 w-[360px] h-[260px] bg-[#f5d9bc]/15 rounded-full blur-[90px]" />
                <svg className="absolute inset-0 w-full h-full opacity-[0.055]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="ldots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#4a3a2c" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#ldots)" />
                </svg>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="w-full max-w-sm"
            >
                {/* Logo / wordmark */}
                <div className="text-center mb-8">
                    <span className="text-3xl font-extrabold tracking-tight text-[#2c1a0e]">Tutora</span>
                    <p className="mt-1.5 text-sm text-[#9b8778]">
                        {isSignup ? "Create your free account" : "Welcome back"}
                    </p>
                </div>

                {/* Card */}
                <div className="relative bg-white border border-[#e8d5c0] rounded-3xl shadow-xl overflow-hidden">
                    {/* Loading overlay */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl"
                            >
                                <Loader2 className="w-7 h-7 text-[#8b5e3c] animate-spin" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="p-7">
                        {/* Tab switcher */}
                        <div className="flex bg-[#f5ede3] rounded-xl p-1 mb-7 gap-1">
                            {["Login", "Sign up"].map((label, i) => {
                                const active = isSignup ? i === 1 : i === 0;
                                return (
                                    <motion.button
                                        key={label}
                                        onClick={() => { setIsSignup(i === 1); setSignupCreds(null); }}
                                        disabled={isLoading}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${active ? "bg-white text-[#2c1a0e] shadow-sm" : "text-[#9b8778] hover:text-[#5a4a3c]"}`}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        {label}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Form */}
                        <AnimatePresence mode="wait">
                            <motion.form
                                key={isSignup ? "signup" : "login"}
                                initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isSignup ? -20 : 20 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                                onSubmit={isSignup ? handleSignupCreds : handleLogin}
                                className="space-y-3"
                            >
                                {isSignup && (
                                    <div>
                                        <label className="block text-xs font-semibold text-[#7b5c4b] mb-1.5">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-[#7b5c4b] mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        name="emailId"
                                        placeholder="you@example.com"
                                        value={formData.emailId}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        required
                                        disabled={isLoading}
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#7b5c4b] mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`${inputClass} pr-11`}
                                            required
                                            disabled={isLoading}
                                            autoComplete={isSignup ? "new-password" : "current-password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0998a] hover:text-[#7b5c4b] transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full mt-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2c1a0e] text-white font-semibold text-sm hover:bg-[#3e2510] transition-colors shadow-md cursor-pointer disabled:opacity-60"
                                >
                                    {isSignup ? "Continue" : "Log in"}
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </motion.form>
                        </AnimatePresence>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-[#e8d5c0]" />
                            <span className="text-xs text-[#b0998a] font-medium">or</span>
                            <div className="flex-1 h-px bg-[#e8d5c0]" />
                        </div>

                        {/* Google */}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        await handleGoogleLogin(credentialResponse);
                                    } catch {
                                        toast.error("Google sign-in failed. Please try again.");
                                    }
                                }}
                                onError={() => toast.error("Google sign-in failed. Please try again.")}
                                useOneTap
                            />
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-[#b0998a] mt-6">
                    By continuing you agree to Tutora's terms of use.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
