import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setParentUser } from "@/utilities/redux/parentUserSlice.js";
import toast from "react-hot-toast";

const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[#e8d5c0] bg-white text-[#2c1a0e] placeholder-[#b0998a] text-sm focus:outline-none focus:ring-2 focus:ring-[#c47d3e]/40 focus:border-[#c47d3e] transition-all disabled:opacity-50";

const ParentLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axiosInstance.post("parent/login", { email: email.trim(), password });
            const res = await axiosInstance.get("parent/me");
            dispatch(setParentUser(res.data));
            navigate("/parent");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#faf6f1] flex items-center justify-center px-4 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#e7c6a5]/25 rounded-full blur-[110px]" />
                <div className="absolute bottom-0 right-1/4 w-[360px] h-[260px] bg-[#f5d9bc]/15 rounded-full blur-[90px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="w-full max-w-sm"
            >
                <div className="text-center mb-8">
                    <span className="text-3xl font-extrabold tracking-tight text-[#2c1a0e]">Tutora</span>
                    <p className="mt-1.5 text-sm text-[#9b8778]">Parent Portal</p>
                </div>

                <div className="relative bg-white border border-[#e8d5c0] rounded-3xl shadow-xl overflow-hidden">
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
                        <p className="text-sm text-[#5a4a3c] font-semibold mb-5">Sign in to your account</p>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-[#7b5c4b] mb-1.5">Email</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
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
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className={`${inputClass} pr-11`}
                                        required
                                        disabled={isLoading}
                                        autoComplete="current-password"
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
                                Log in
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-xs text-[#b0998a] mt-6">
                    Access is set up by your institute. Contact your tutor for help.
                </p>
            </motion.div>
        </div>
    );
};

export default ParentLogin;
