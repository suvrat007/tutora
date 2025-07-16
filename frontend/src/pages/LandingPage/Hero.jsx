import { Button } from "@/components/ui/button.jsx";
import { ArrowRight, Sparkles, Play, Star } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedGradientText } from "../../components/ui/AnimatedGradientText.jsx";

const Hero = ({ currentWord, rotatingWords, user }) => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    const floatingVariants = {
        float: {
            y: [-10, 10, -10],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <section className="relative bg-gradient-to-br from-[#f5e8dc] via-[#fdf5ec] to-[#e7c6a5]/30 flex flex-col items-center justify-center min-h-[90vh] px-4 sm:px-6 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-[#e7c6a5]/20 rounded-full blur-3xl"
                    animate={floatingVariants.float}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-[#4a3a2c]/10 rounded-full blur-3xl"
                    animate={{
                        ...floatingVariants.float,
                        transition: { ...floatingVariants.float.transition, delay: 2 }
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#e7c6a5]/10 to-transparent rounded-full blur-2xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3],
                        transition: {
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                />
            </div>

            {/* Floating Icons */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            left: `${20 + (i * 15)}%`,
                            top: `${20 + (i * 12)}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 10, -10, 0],
                            opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="w-8 h-8 bg-[#4a3a2c]/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <Star className="w-4 h-4 text-[#4a3a2c]/40" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="relative z-10 text-center max-w-5xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Badge */}
                <motion.div
                    variants={itemVariants}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#e7c6a5]/50 shadow-lg mb-6"
                >
                    <Sparkles className="w-4 h-4 text-[#4a3a2c]" />
                    <span className="text-sm font-medium text-[#4a3a2c]">
                        Trusted by 10,000+ educators worldwide
                    </span>
                </motion.div>

                <motion.h1
                    variants={itemVariants}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#4a3a2c] mb-6 leading-tight"
                >
                    Your Personal{" "}
                    <div className="relative inline-block">
                        <AnimatedGradientText className="inline-block bg-gradient-to-r from-[#4a3a2c] via-[#6b5b4f] to-[#4a3a2c] bg-clip-text text-transparent">
                            Tutora
                            <motion.span
                                className="underline decoration-4 decoration-[#e7c6a5]/60 underline-offset-4"
                                key={currentWord}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {rotatingWords[currentWord]}
                            </motion.span>
                        </AnimatedGradientText>
                    </div>
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-lg sm:text-xl md:text-2xl text-[#9b8778] max-w-3xl mx-auto mb-8 leading-relaxed"
                >
                    The all-in-one platform built for{" "}
                    <span className="font-semibold text-[#4a3a2c]">solo educators</span>.
                    <br className="hidden sm:block" />
                    Manage students, classes, and schedules with elegance and ease.
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
                >
                    <Button
                        size="lg"
                        className="group bg-[#4a3a2c] text-white hover:bg-[#3e2f23] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 px-8 py-6 text-lg font-semibold rounded-2xl"
                        onClick={() => navigate(user ? "/main" : "/login")}
                    >
                        <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                        {user ? "Go to Dashboard" : "Start Free Trial"}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                            animate={{
                                x: ['-100%', '100%'],
                                transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }
                            }}
                        />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="group border-2 border-[#e7c6a5] text-[#4a3a2c] hover:bg-[#e7c6a5]/20 hover:text-[#4a3a2c] transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-6 text-lg font-semibold rounded-2xl backdrop-blur-sm bg-white/60"
                        onClick={() => navigate(user ? "/main/info-institute" : "/login")}
                    >
                        <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>{user ? "View Profile" : "Watch Demo"}</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>

                {/* Social Proof */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[#9b8778]"
                >
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 bg-gradient-to-br from-[#4a3a2c] to-[#6b5b4f] rounded-full border-2 border-white flex items-center justify-center text-white font-bold"
                                >
                                    {String.fromCharCode(65 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm font-medium ml-2">10,000+ active users</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm font-medium ml-2">4.9/5 rating</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#fdf5ec] to-transparent" />
        </section>
    );
};

export default Hero;