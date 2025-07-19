import { Button } from "@/components/ui/button.jsx";
import { ArrowRight, Sparkles, Play, Star } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedGradientText } from "../../components/ui/AnimatedGradientText.jsx";

const Hero = ({ currentWord, rotatingWords, user }) => {
    const navigate = useNavigate();

    console.log("Hero rendered, user:", user); // Debug user state

    const handleNavigate = (path) => {
        console.log("Navigating to:", path); // Debug navigation
        try {
            navigate(path);
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    return (
        <section className="bg-gradient-to-br from-[#fdf5ec] to-[#f5e8dc] flex flex-col items-center justify-center min-h-[90vh] px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-6xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f8ede3] rounded-full border border-[#e7c6a5]/50 shadow-sm mb-6">
                    <Sparkles className="w-4 h-4 text-[#4a3a2c]" />
                    <span className="text-sm font-medium text-[#4a3a2c]">
                        Trusted by 10,000+ educators worldwide
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#4a3a2c] mb-6 leading-tight">
                    Your Personal{" "}
                    <span className="relative inline-block">
                        <AnimatedGradientText className="inline-block bg-gradient-to-r from-[#4a3a2c] via-[#6b5b4f] to-[#4a3a2c] bg-clip-text text-transparent">
                            Tutora
                            <span
                                className="underline decoration-4 decoration-[#e7c6a5]/60 underline-offset-4"
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
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#9b8778] max-w-3xl mx-auto mb-8 leading-relaxed">
                    The all-in-one platform built for{" "}
                    <span className="font-semibold text-[#4a3a2c]">solo educators</span>.
                    Manage students, classes, and schedules with elegance and ease.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                    <Button
                        size="lg"
                        className="group bg-[#4a3a2c] text-white hover:bg-[#3e2f23] transition-all duration-300 shadow-sm px-6 py-3 text-base font-semibold rounded-xl"
                        onClick={() => handleNavigate(user ? "/main" : "/login")}
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        {user ? "Go to Dashboard" : "Start Free Trial"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="group border-2 border-[#e7c6a5] text-[#4a3a2c] hover:bg-[#e7c6a5]/20 transition-all duration-300 shadow-sm px-6 py-3 text-base font-semibold rounded-xl bg-[#f8ede3]"
                        onClick={() => handleNavigate(user ? "/main/info-institute" : "/login")}
                    >
                        <Play className="mr-2 h-5 w-5" />
                        {user ? "View Profile" : "Watch Demo"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[#9b8778]">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 bg-gradient-to-br from-[#4a3a2c] to-[#6b5b4f] rounded-full border-2 border-[#f8ede3] flex items-center justify-center text-[#f8ede3] font-bold"
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
                </div>
            </div>
        </section>
    );
};

export default Hero;