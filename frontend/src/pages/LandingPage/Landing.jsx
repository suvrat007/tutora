import React, { useState, useEffect } from "react";
import {
    Calendar, Users, DollarSign, FileText, Clock,
    Shield, Heart, Zap, Star, Quote, CheckCircle, ArrowRight
} from "lucide-react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Hero from "@/pages/LandingPage/Hero.jsx";
import { useSelector } from "react-redux";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AnimatedGradientText } from "@/components/ui/AnimatedGradientText.jsx";

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const Landing = () => {
    const [currentWord, setCurrentWord] = useState(0);
    const rotatingWords = ["ssistant", "nchor", "utomator", "dmin", "lly"];
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const sections = {
        features: [
            {
                icon: Users,
                title: "Track Attendance",
                description: "Monitor all batches & students with an intuitive check-in/out system.",
                color: "from-blue-500 to-cyan-500"
            },
            {
                icon: DollarSign,
                title: "Manage Fees",
                description: "Automated due reminders, payment history, and fee tracking.",
                color: "from-green-500 to-emerald-500"
            },
            {
                icon: Calendar,
                title: "Set Reminders",
                description: "Stay on top of tests, homework, and fee collections.",
                color: "from-purple-500 to-violet-500"
            },
            {
                icon: FileText,
                title: "Session Notes",
                description: "Log class activities and attendance effortlessly.",
                color: "from-orange-500 to-amber-500"
            },
        ],
        benefits: [
            {
                icon: Clock,
                title: "Save Time",
                description: "Automate tasks to focus on teaching, not admin.",
                color: "from-red-500 to-rose-500"
            },
            {
                icon: Zap,
                title: "No Learning Curve",
                description: "Intuitive design, familiar from day one.",
                color: "from-yellow-500 to-orange-500"
            },
            {
                icon: Shield,
                title: "Private & Secure",
                description: "Your student data stays yours, always.",
                color: "from-indigo-500 to-blue-500"
            },
            {
                icon: Heart,
                title: "Made for You",
                description: "Crafted for solo educators' unique needs.",
                color: "from-pink-500 to-rose-500"
            },
        ],
    };

    const GridSection = ({ title, subtitle, items, bgColor = "bg-gradient-to-br from-[#fdf5ec] to-[#f5e8dc]" }) => (
        <section className={`py-16 sm:py-24 px-4 sm:px-6 ${bgColor} relative overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #4a3a2c 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }} />
            </div>

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a3a2c] mb-4">
                        {title}
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl text-[#9b8778] mb-12 max-w-3xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {items.map(({ icon: Icon, title, description, color }, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="group"
                        >
                            <Card className="relative bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-[#e7c6a5]/30 hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden h-full">
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <CardHeader className="text-center pb-4">
                                    <div className="relative">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <motion.div
                                            className="absolute -inset-2 bg-gradient-to-br from-[#e7c6a5]/20 to-transparent rounded-2xl"
                                            initial={{ scale: 0, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                                        />
                                    </div>
                                    <CardTitle className="mt-6 text-[#4a3a2c] text-xl sm:text-2xl font-bold">
                                        {title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-[#9b8778] text-base sm:text-lg text-center leading-relaxed">
                                        {description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );

    const Testimonials = () => (
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-[#f5e8dc] to-[#e7c6a5]/30 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-[#e7c6a5]/20 rounded-full blur-xl" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#4a3a2c]/10 rounded-full blur-xl" />

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a3a2c] mb-4">
                        Loved by Solo Educators
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl text-[#9b8778] mb-12 max-w-3xl mx-auto leading-relaxed">
                        Hear from tutors who transformed their teaching with Tutora
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {[
                        {
                            name: "Sarah Chen",
                            role: "Math Tutor",
                            content: "Tutora eliminated my admin headaches. I spend 2 hours less per week on paperwork.",
                            avatar: "👩‍🏫",
                            rating: 5,
                            location: "San Francisco, CA"
                        },
                        {
                            name: "Michael Rodriguez",
                            role: "Guitar Instructor",
                            content: "Finally, a tool that gets it. Simple, effective, no fluff.",
                            avatar: "🎸",
                            rating: 5,
                            location: "Austin, TX"
                        },
                        {
                            name: "Priya Sharma",
                            role: "Home Educator",
                            content: "Fee reminders alone saved me awkward convos. Tutora handles it all.",
                            avatar: "📚",
                            rating: 5,
                            location: "Mumbai, India"
                        },
                    ].map((testimonial, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="group"
                        >
                            <Card className="relative p-8 text-center bg-white/90 backdrop-blur-sm border border-[#e7c6a5]/30 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden h-full">
                                {/* Quote icon */}
                                <div className="absolute top-6 left-6 opacity-10">
                                    <Quote className="w-8 h-8 text-[#4a3a2c]" />
                                </div>

                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {testimonial.avatar}
                                </div>

                                {/* Rating */}
                                <div className="flex justify-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                                        <Star key={starIndex} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                <blockquote className="text-[#4a3a2c] italic text-lg mb-6 leading-relaxed">
                                    "{testimonial.content}"
                                </blockquote>

                                <div className="border-t border-[#e7c6a5]/30 pt-4">
                                    <h4 className="font-bold text-[#4a3a2c] text-lg">{testimonial.name}</h4>
                                    <p className="text-sm text-[#9b8778] font-medium">{testimonial.role}</p>
                                    <p className="text-xs text-[#9b8778] mt-1">{testimonial.location}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );

    const FAQ = () => (
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-[#fdf5ec] to-[#f5e8dc] relative">
            <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a3a2c] mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl text-[#9b8778] mb-12 max-w-3xl mx-auto leading-relaxed">
                        Everything you need to know before getting started
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <Accordion type="multiple" className="w-full text-left space-y-4">
                        {[
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
                        ].map((faq, i) => (
                            <AccordionItem
                                key={i}
                                value={`item-${i}`}
                                className="bg-white/80 backdrop-blur-sm border border-[#e7c6a5]/30 rounded-2xl px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <AccordionTrigger className="text-lg sm:text-xl font-bold text-[#4a3a2c] hover:text-[#6b5b4f] hover:no-underline py-6">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        {faq.question}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-[#9b8778] text-base sm:text-lg pb-6 leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    );

    const FinalCTA = () => (
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-[#f5e8dc] via-[#e7c6a5]/50 to-[#4a3a2c]/5 text-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
                <motion.div
                    className="absolute top-20 left-20 w-40 h-40 bg-[#e7c6a5]/20 rounded-full blur-2xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-20 w-60 h-60 bg-[#4a3a2c]/10 rounded-full blur-2xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-2xl border border-[#e7c6a5]/30">
                        <AnimatedGradientText className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#4a3a2c] via-[#6b5b4f] to-[#4a3a2c] bg-clip-text text-transparent">
                            Ready to Transform Your Teaching?
                        </AnimatedGradientText>
                        <p className="text-lg sm:text-xl md:text-2xl text-[#9b8778] mb-8 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of solo educators using Tutora to simplify their workflow and focus on what matters most.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                            <Button
                                size="lg"
                                className="group bg-[#4a3a2c] text-white hover:bg-[#3e2f23] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 px-8 py-6 text-lg font-semibold rounded-2xl"
                                onClick={() => navigate(user ? "/main" : "/login")}
                            >
                                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                                {user ? "Go to Dashboard" : "Start Free Trial"}
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-6 text-sm text-[#9b8778]">
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
                </motion.div>
            </div>
        </section>
    );

    return (
        <div className="bg-gradient-to-br from-[#fdf5ec] to-[#f5e8dc] min-h-screen">
            <Hero currentWord={currentWord} user={user} rotatingWords={rotatingWords} />
            <GridSection
                title="Smart Features"
                subtitle="Everything you need to teach with confidence"
                items={sections.features}
            />
            <GridSection
                title="Why Tutors Love Tutora"
                subtitle="Tailored to how you work best"
                items={sections.benefits}
                bgColor="bg-gradient-to-br from-[#f5e8dc] to-[#fdf5ec]"
            />
            <Testimonials />
            <FAQ />
            <FinalCTA />
        </div>
    );
};

export default Landing;