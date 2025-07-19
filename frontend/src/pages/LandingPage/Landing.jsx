import React, { useState, useEffect } from "react";
import {
    Calendar, Users, DollarSign, FileText, Clock,
    Shield, Heart, Zap, Star, Quote, CheckCircle, ArrowRight,
    Play, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { AnimatedGradientText } from "../../components/ui/AnimatedGradientText.jsx";
import { useSelector } from "react-redux";

const Landing = () => {
    const [currentWord, setCurrentWord] = useState(0);
    const rotatingWords = ["ssistant", "nchor", "utomator", "dmin", "lly"];
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleNavigate = (path) => {
        console.log("Navigating to:", path); // Debug navigation
        try {
            navigate(path);
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    const features = [
        {
            icon: Users,
            title: "Track Attendance",
            description: "Monitor all batches and students with an intuitive check-in/out system.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: DollarSign,
            title: "Manage Fees",
            description: "Automated due reminders, payment history, and fee tracking.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: Calendar,
            title: "Set Reminders",
            description: "Stay on top of tests, homework, and fee collections.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: FileText,
            title: "Session Notes",
            description: "Log class activities and attendance effortlessly.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
    ];

    const benefits = [
        {
            icon: Clock,
            title: "Save Time",
            description: "Automate tasks to focus on teaching, not admin.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: Zap,
            title: "No Learning Curve",
            description: "Intuitive design, familiar from day one.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: Shield,
            title: "Private & Secure",
            description: "Your student data stays yours, always.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: Heart,
            title: "Made for You",
            description: "Crafted for solo educators' unique needs.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
    ];

    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Math Tutor",
            content: "Tutora eliminated my admin headaches. I spend 2 hours less per week on paperwork.",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48&q=80",
            rating: 5,
            location: "San Francisco, CA"
        },
        {
            name: "Michael Rodriguez",
            role: "Guitar Instructor",
            content: "Finally, a tool that gets it. Simple, effective, no fluff.",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48&q=80",
            rating: 5,
            location: "Austin, TX"
        },
        {
            name: "Priya Sharma",
            role: "Home Educator",
            content: "Fee reminders alone saved me awkward convos. Tutora handles it all.",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48&q=80",
            rating: 5,
            location: "Mumbai, India"
        },
    ];

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

    const faqs = [
        {
            question: "Is Tutora really free?",
            answer: "Yes! All core features are free with optional premium upgrades for advanced functionality. No hidden fees, no credit card required to start.",
        },
        {
            question: "Do I need tech skills?",
            answer: "Absolutely not! If you can use WhatsApp or send an email, you can use Tutora. Our interface is designed to be intuitive and user-friendly.",
        },
        {
            question: "Is it for all teaching styles?",
            answer: "Yes! Whether you teach math, music, languages, or any other subject, Tutora adapts to your unique teaching style and requirements.",
        },
        {
            question: "Is student data safe?",
            answer: "100% secure. We use bank-level encryption, never access your data, and will never sell your information to third parties. Your privacy is our priority.",
        },
        {
            question: "Can I try it before committing?",
            answer: "Of course! Start with our free plan and upgrade only when you're ready. No contracts, cancel anytime.",
        },
    ];

    return (
        <div className="bg-gradient-to-br from-[#fdf5ec] to-[#f5e8dc] min-h-screen font-['Inter',sans-serif]">
            {/* Hero Section */}
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
                            onClick={() => handleNavigate("/login")}
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            {user ? "Go To Dashboard" : "Start Free Trial"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="group border-2 border-[#e7c6a5] text-[#4a3a2c] hover:bg-[#e7c6a5]/20 transition-all duration-300 shadow-sm px-6 py-3 text-base font-semibold rounded-xl bg-[#f8ede3]"
                            onClick={() => handleNavigate("/main/info-institute")}
                        >
                            {user ? "Institute Information" : "Start Free Trial"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[#9b8778]">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {activeUsers.map(({ id, avatar, alt }) => (
                                    <img
                                        key={id}
                                        src={avatar}
                                        alt={alt}
                                        className="w-10 h-10 rounded-full border-2 border-[#f8ede3]"
                                    />
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

            {/* Features Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#fdf5ec] to-[#f5e8dc]">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a3a2c] mb-4">
                        Smart Features
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-[#9b8778] mb-12 max-w-3xl mx-auto leading-relaxed">
                        Everything you need to teach with confidence
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {features.map(({ icon: Icon, title, description, color }, i) => (
                            <div key={i} className="group">
                                <div className="bg-[#f8ede3] shadow-sm rounded-xl p-6 border border-[#e7c6a5]/20 hover:shadow-md transition-all duration-300 h-full">
                                    <div className="text-center pb-4">
                                        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl mx-auto flex items-center justify-center shadow-sm`}>
                                            <Icon className="h-6 w-6 text-[#4a3a2c]" />
                                        </div>
                                        <h3 className="mt-6 text-[#4a3a2c] text-lg sm:text-xl font-bold">
                                            {title}
                                        </h3>
                                    </div>
                                    <div>
                                        <p className="text-[#9b8778] text-sm sm:text-base text-center leading-relaxed">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#f5e8dc] to-[#fdf5ec]">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a3a2c] mb-4">
                        Why Tutors Love Tutora
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-[#9b8778] mb-12 max-w-3xl mx-auto leading-relaxed">
                        Tailored to how you work best
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {benefits.map(({ icon: Icon, title, description, color }, i) => (
                            <div key={i} className="group">
                                <div className="bg-[#f8ede3] shadow-sm rounded-xl p-6 border border-[#e7c6a5]/20 hover:shadow-md transition-all duration-300 h-full">
                                    <div className="text-center pb-4">
                                        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl mx-auto flex items-center justify-center shadow-sm`}>
                                            <Icon className="h-6 w-6 text-[#4a3a2c]" />
                                        </div>
                                        <h3 className="mt-6 text-[#4a3a2c] text-lg sm:text-xl font-bold">
                                            {title}
                                        </h3>
                                    </div>
                                    <div>
                                        <p className="text-[#9b8778] text-sm sm:text-base text-center leading-relaxed">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#f5e8dc] to-[#fdf5ec]">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a3a2c] mb-4">
                        Loved by Solo Educators
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-[#9b8778] mb-12 max-w-3xl mx-auto leading-relaxed">
                        Hear from tutors who transformed their teaching with Tutora
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {testimonials.map((testimonial, i) => (
                            <div key={i} className="group">
                                <div className="p-6 bg-[#f8ede3] border border-[#e7c6a5]/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-full">
                                    <div className="flex justify-center mb-4">
                                        <img
                                            src={testimonial.avatar}
                                            alt={`Profile picture of ${testimonial.name}`}
                                            className="w-12 h-12 rounded-full border border-[#e7c6a5]/50"
                                        />
                                    </div>
                                    <div className="flex justify-center mb-4">
                                        {[...Array(testimonial.rating)].map((_, starIndex) => (
                                            <Star key={starIndex} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <blockquote className="text-[#4a3a2c] text-base sm:text-lg italic mb-6 leading-relaxed">
                                        "{testimonial.content}"
                                    </blockquote>
                                    <div className="border-t border-[#e7c6a5]/20 pt-4">
                                        <h4 className="font-bold text-[#4a3a2c] text-base sm:text-lg">{testimonial.name}</h4>
                                        <p className="text-sm text-[#9b8778] font-medium">{testimonial.role}</p>
                                        <p className="text-xs text-[#9b8778] mt-1">{testimonial.location}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#fdf5ec] to-[#f5e8dc]">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a3a2c] mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-[#9b8778] mb-12 max-w-3xl mx-auto leading-relaxed">
                        Everything you need to know before getting started
                    </p>
                    <div className="w-full text-left space-y-4">
                        {faqs.map((faq, i) => (
                            <details
                                key={i}
                                className="group bg-white border border-[#e7c6a5]/20 rounded-xl px-6 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <summary className="cursor-pointer text-base sm:text-lg font-bold text-[#4a3a2c] hover:text-[#6b5b4f] py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        {faq.question}
                                    </div>
                                    <ChevronDown className="w-5 h-5 transition-transform duration-200 group-open:rotate-180" />
                                </summary>
                                <div className="text-[#9b8778] text-sm sm:text-base pb-4 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            {!user && (
                <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#f5e8dc] to-[#fdf5ec] text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-[#f8ede3] rounded-xl p-8 shadow-sm border border-[#e7c6a5]/20">
                            <AnimatedGradientText className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#4a3a2c] via-[#6b5b4f] to-[#4a3a2c] bg-clip-text text-transparent">
                                Ready to Transform Your Teaching?
                            </AnimatedGradientText>
                            <p className="text-base sm:text-lg md:text-xl text-[#9b8778] mb-8 max-w-2xl mx-auto leading-relaxed">
                                Join thousands of solo educators using Tutora to simplify their workflow and focus on what matters most.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                                <Button
                                    size="lg"
                                    className="group bg-[#4a3a2c] text-white hover:bg-[#3e2f23] transition-all duration-300 shadow-sm px-6 py-3 text-base font-semibold rounded-xl"
                                    onClick={() => handleNavigate("/main")}
                                >
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#9b8778]">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Free forever plan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Setup in 5 minutes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

const ChevronDown = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

export default Landing;