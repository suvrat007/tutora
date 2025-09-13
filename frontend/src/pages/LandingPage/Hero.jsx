import { Button } from "@/components/ui/button.jsx";
import { ArrowRight, Sparkles, Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedGradientText } from "../../components/ui/AnimatedGradientText.jsx";
import { motion } from "framer-motion";

const Hero = ({ currentWord, rotatingWords, user, setIsModalOpen }) => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        try {
            navigate(path);
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    const activeUsers = [
        {
            id: 1,
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
            alt: "Profile picture of user 1"
        },
        {
            id: 2,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
            alt: "Profile picture of user 2"
        },
        {
            id: 3,
            avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
            alt: "Profile picture of user 3"
        },
        {
            id: 4,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
            alt: "Profile picture of user 4"
        },
        {
            id: 5,
            avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
            alt: "Profile picture of user 5"
        },
    ];

    return (
        <section className="bg-gradient-to-br from-[#fdf5ec] to-[#f5e8dc] flex flex-col items-center justify-center min-h-[90vh] px-4 sm:px-6 md:px-8 overflow-hidden">
            <div className="text-center max-w-6xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 -z-10"
                >
                    <div className="pointer-events-none select-none">
                        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#e7c6a5]/40 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#e0c4a8]/40 rounded-full blur-3xl" />
                    </div>
                </motion.div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-[#e7c6a5]/50 shadow-lg mb-6">
                    <Sparkles className="w-4 h-4 text-[#4a3a2c]" />
                    <span className="text-sm font-medium text-[#4a3a2c]">
                        Trusted by 10,000+ educators worldwide
                    </span>
                </div>
                <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#4a3a2c] mb-6 leading-tight"
                >
                    Your Personal{" "}
                    <span className="relative inline-block">
                        <AnimatedGradientText className="inline-block bg-gradient-to-r from-[#4a3a2c] via-[#6b5b4f] to-[#4a3a2c] bg-clip-text text-transparent">
                            Tutora
                            <span
                                className="underline decoration-4 decoration-[#e7c6a5]/60 text-[#4a3a2c]/20 underline-offset-4"
                                key={currentWord}
                                style={{
                                    opacity: 0,
                                    display: "inline-block",
                                    transform: "translateY(10px)",
                                    animation: "fadeInUp 0.3s forwards"
                                }}
                            >
                                {rotatingWords[currentWord]}
                            </span>
                        </AnimatedGradientText>
                        <style>{`
                            @keyframes fadeInUp {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>
                    </span>
                </motion.h1>
                <p className="text-base sm:text-lg md:text-xl text-[#9b8778] max-w-3xl mx-auto mb-8 leading-relaxed">
                    The all-in-one platform built for{" "}
                    <span className="font-semibold text-[#4a3a2c]">solo educators</span>.
                    Manage students, classes, and schedules with elegance and ease.
                </p>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                    className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
                >
                    <Button
                        size="lg"
                        className="group cursor-pointer bg-[#4a3a2c] text-white hover:bg-[#3e2f23] transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-4 text-base font-semibold rounded-xl border border-[#6b5b4f]/20"
                        onClick={() => handleNavigate(user ? "/main" : "/login")}
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        {user ? "Go To Dashboard" : "Start Free Trial"}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="group cursor-pointer border-2 border-[#e7c6a5] text-[#4a3a2c] hover:bg-[#e7c6a5]/20 transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-4 text-base font-semibold rounded-xl bg-white/50 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                        {user ? "Watch Demo" : "Watch Demo Video"}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </motion.div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[#9b8778]">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {activeUsers.map(({ id, avatar, alt }) => (
                                <img
                                    key={id}
                                    src={avatar}
                                    alt={alt}
                                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium ml-2">10,000+ active users</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                        ))}
                        <span className="text-sm font-medium ml-2">4.9/5 rating</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Hero;