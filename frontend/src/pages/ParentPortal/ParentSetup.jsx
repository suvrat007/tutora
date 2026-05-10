import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import toast from "react-hot-toast";

const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[#e8d5c0] bg-white text-[#2c1a0e] placeholder-[#b0998a] text-sm focus:outline-none focus:ring-2 focus:ring-[#c47d3e]/40 focus:border-[#c47d3e] transition-all disabled:opacity-50";

const ParentSetup = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [info, setInfo] = useState(null);
    const [infoError, setInfoError] = useState(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        axiosInstance.get(`parent/setup/${token}`)
            .then(res => setInfo(res.data))
            .catch(() => setInfoError("This invite link is invalid or has expired. Please contact your institute."));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        setIsLoading(true);
        try {
            await axiosInstance.post(`parent/setup/${token}`, { password });
            toast.success("Account created! Please log in.");
            navigate("/parent/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#faf6f1] flex items-center justify-center px-4 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#e7c6a5]/25 rounded-full blur-[110px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="w-full max-w-sm"
            >
                <div className="text-center mb-8">
                    <span className="text-3xl font-extrabold tracking-tight text-[#2c1a0e]">Tutora</span>
                    <p className="mt-1.5 text-sm text-[#9b8778]">Set up your account</p>
                </div>

                {infoError ? (
                    <div className="bg-white border border-[#e8d5c0] rounded-3xl shadow-xl p-7 text-center">
                        <p className="text-sm text-[#c0392b] font-medium">{infoError}</p>
                    </div>
                ) : !info ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[#8b5e3c] animate-spin" />
                    </div>
                ) : (
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
                            <div className="mb-5 p-3 bg-[#f5ede3] rounded-xl">
                                <p className="text-xs text-[#7b5c4b] font-medium">{info.instituteName}</p>
                                <p className="text-sm font-bold text-[#2c1a0e] mt-0.5">
                                    {info.relation === 'mom' ? 'Mother' : 'Father'} of {info.studentName}
                                </p>
                                <p className="text-xs text-[#9b8778] mt-0.5">{info.email}</p>
                            </div>

                            <p className="text-xs text-[#7b5c4b] font-semibold mb-4">Create a password to activate your account</p>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#7b5c4b] mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 8 characters"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className={`${inputClass} pr-11`}
                                            required
                                            disabled={isLoading}
                                            autoComplete="new-password"
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

                                <div>
                                    <label className="block text-xs font-semibold text-[#7b5c4b] mb-1.5">Confirm Password</label>
                                    <input
                                        type="password"
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className={inputClass}
                                        required
                                        disabled={isLoading}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full mt-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2c1a0e] text-white font-semibold text-sm hover:bg-[#3e2510] transition-colors shadow-md cursor-pointer disabled:opacity-60"
                                >
                                    Activate Account
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </form>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ParentSetup;
