import { ArrowRight, Sparkles, Play, Users, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = ({ user, setIsModalOpen }) => {
    const navigate = useNavigate();

    return (
        <section
            className="relative pt-24 pb-4 px-4 sm:px-6 overflow-hidden"
            style={{ background: "linear-gradient(175deg, #fdf8f3 0%, #fdf4ec 60%, #faf6f0 100%)" }}
        >
            {/* Background glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#f0d9c0]/50 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[#fde8cc]/25 rounded-full blur-3xl pointer-events-none" />

            {/* Dot grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(#ddb892 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                    opacity: 0.22,
                }}
            />

            <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#ddb892]/50 shadow-sm text-xs font-bold text-[#8b5e3c] tracking-widest uppercase mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-[#8b5e3c] opacity-50" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8b5e3c]" />
                    </span>
                    For Independent Educators
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#1a0f07] leading-[1.08] tracking-tight mb-6 max-w-3xl"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                    Teaching without
                    <br />
                    <span className="bg-gradient-to-r from-[#a0683f] via-[#d08f56] to-[#8b5e3c] bg-clip-text text-transparent">
                        the paperwork
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-[#6b5c4a] max-w-xl leading-relaxed mb-10"
                >
                    Tutora handles attendance, fees, and class scheduling — so you can focus entirely on your students.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-3 mb-12"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(user ? "/main" : "/login")}
                        className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#1a0f07] text-white font-semibold text-base shadow-xl shadow-[#1a0f07]/15 hover:bg-[#2c1a0e] transition-colors cursor-pointer"
                    >
                        <Sparkles className="w-4 h-4 text-[#f0d5b0]" />
                        {user ? "Go to Dashboard" : "Start for Free"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl border-2 border-[#ecdec9] bg-white/70 backdrop-blur-sm text-[#3d2b1a] font-semibold text-base hover:bg-white hover:border-[#d4b896] transition-all duration-200 cursor-pointer"
                    >
                        <Play className="w-4 h-4" />
                        Watch Demo
                    </button>
                </motion.div>

                {/* Stat pills */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="flex flex-wrap justify-center gap-2.5 mb-16"
                >
                    {[
                        { icon: Clock, text: "2h+ saved weekly" },
                        { icon: Star, text: "100% free forever" },
                        { icon: Users, text: "Any subject, any batch" },
                    ].map(({ icon: Icon, text }, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#ecdec9] shadow-sm text-sm text-[#5c4a38] font-medium"
                        >
                            <Icon className="w-3.5 h-3.5 text-[#8b5e3c]" />
                            {text}
                        </div>
                    ))}
                </motion.div>

                {/* Dashboard mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-5xl"
                >
                    <div className="relative">
                        <div className="absolute -inset-6 bg-gradient-to-b from-[#f0d5b0]/30 to-transparent rounded-3xl blur-3xl pointer-events-none" />
                        <div className="relative rounded-t-2xl overflow-hidden border border-[#ecdec9] bg-white shadow-[0_20px_60px_rgba(26,15,7,0.10)]">
                            {/* Browser chrome */}
                            <div className="h-10 bg-[#f8f2ec] border-b border-[#ecdec9] flex items-center px-4 gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff6b6b]/80" />
                                <div className="w-3 h-3 rounded-full bg-[#ffd93d]/80" />
                                <div className="w-3 h-3 rounded-full bg-[#6bcb77]/80" />
                                <div className="flex-1 flex justify-center">
                                    <div className="h-5 w-44 bg-[#ecdec9]/70 rounded-full" />
                                </div>
                            </div>
                            <img
                                src="/dashboard-mockup.png"
                                alt="Tutora Dashboard Preview"
                                className="w-full h-auto object-cover"
                                loading="eager"
                                style={{
                                    maskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
                                    WebkitMaskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
