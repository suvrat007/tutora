import { ArrowRight, Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = ({ user, setIsModalOpen }) => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen pt-32 pb-16 px-4 sm:px-6 overflow-hidden bg-[#fdfcfb]">
            {/* Soft top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-[#f0d9c0]/50 to-transparent opacity-60 blur-3xl rounded-full pointer-events-none" />

            {/* Subtle grid background */}
            <div className="absolute inset-0 z-0 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'radial-gradient(#e6c8a8 1px, transparent 1px)', 
                     backgroundSize: '32px 32px',
                     opacity: 0.3 
                 }}>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ddb892]/40 bg-white/60 backdrop-blur-md text-xs font-bold text-[#8b5e3c] tracking-wide shadow-sm mb-8"
                >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b5e3c] opacity-40"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8b5e3c]"></span>
                    </span>
                    TUTORA FOR EDUCATORS
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#2c1a0e] leading-[1.1] tracking-tight mb-6"
                >
                    Teaching tools that
                    <br />
                    <span className="bg-gradient-to-r from-[#8b5e3c] via-[#d08f56] to-[#8b5e3c] bg-clip-text text-transparent">
                        get out of the way
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-lg sm:text-xl text-[#7b5c4b] max-w-2xl mx-auto leading-relaxed mb-10"
                >
                    Manage attendance, track fees, and organize class schedules effortlessly. 
                    Built exclusively for independent tutors and coaching centers.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto mb-16"
                >
                    <button
                        onClick={() => navigate(user ? "/main" : "/login")}
                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#2c1a0e] text-white font-semibold text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <Sparkles className="w-5 h-5 text-[#f0d9c0]" />
                        {user ? "Go to Dashboard" : "Start for Free"}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-[#e6c8a8] bg-white/50 backdrop-blur-sm text-[#4a3a2c] font-semibold text-base hover:bg-white hover:border-[#ddb892] hover:shadow-md transition-all duration-300"
                    >
                        <Play className="w-5 h-5" />
                        Watch Demo
                    </button>
                </motion.div>

                {/* Dashboard Showcase Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full relative px-4 sm:px-0"
                >
                    <div className="relative rounded-t-2xl sm:rounded-t-3xl overflow-hidden border border-[#e6c8a8]/60 bg-white/40 backdrop-blur-md shadow-[0_20px_50px_rgba(44,26,14,0.08)] mx-auto max-w-5xl">
                        {/* Fake Browser Chrome */}
                        <div className="h-10 bg-[#f8ede3]/80 backdrop-blur-md border-b border-[#e6c8a8]/60 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                            <div className="w-3 h-3 rounded-full bg-green-400/80" />
                        </div>
                        {/* The Mockup Image */}
                        <img 
                            src="/dashboard-mockup.png" 
                            alt="MeriKaksha Dashboard Preview" 
                            className="w-full h-auto object-cover"
                            style={{ 
                                maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                            }}
                        />
                    </div>
                </motion.div>
            </div>
            
            {/* Global style for shimmer animation */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </section>
    );
};

export default Hero;
