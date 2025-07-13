import React, { useState, useEffect } from "react";
import {
    Calendar, Users, DollarSign, FileText, Clock,
    BookOpen, Shield, Heart, Zap
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

const Landing = () => {
    const [currentWord, setCurrentWord] = useState(0);
    const rotatingWords = ["Assistant", "Anchor", "Automator", "Admin", "Ally"];
    const user = useSelector((state) => state.user);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const sections = {
        features: [
            { icon: Users, title: "Track Attendance", description: "Monitor all batches & students with easy check-in/out system" },
            { icon: DollarSign, title: "Manage Fees", description: "Due reminders, payment history, and automated fee tracking" },
            { icon: Calendar, title: "Set Reminder", description: "Never forget tests, homeworks, or fee collection" },
            { icon: FileText, title: "Session Notes", description: "Log class activities & attendance seamlessly" },
        ],
        benefits: [
            { icon: Clock, title: "Save Time", description: "Automate tasks and focus on teaching" },
            { icon: Zap, title: "No Learning Curve", description: "Feels familiar from day one" },
            { icon: Shield, title: "Private & Secure", description: "Student data is always yours" },
            { icon: Heart, title: "Made for You", description: "Built specifically for solo educators" },
        ],
    };

    const GridSection = ({ title, subtitle, items }) => (
        <section className="py-16 px-6 bg-[#fdf6ec]">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-[#3e2f23] mb-2">{title}</h2>
                <p className="text-lg text-[#6b594c] mb-12">{subtitle}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map(({ icon: Icon, title, description }, i) => (
                        <Card key={i} className="bg-white shadow-md rounded-2xl p-4 border border-[#f3e5d3]">
                            <CardHeader className="text-center">
                                <div className="w-12 h-12 bg-[#e7c6a5] rounded-full mx-auto flex items-center justify-center">
                                    <Icon className="h-6 w-6 text-[#4a3a2c]" />
                                </div>
                                <CardTitle className="mt-4 text-[#3e2f23] text-lg">{title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-[#6b594c] text-sm text-center">
                                    {description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );

    const Testimonials = () => (
        <section className="py-20 px-6 bg-[#f1e8dc]">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-[#3e2f23] mb-4">Loved by solo educators</h2>
                <p className="text-lg text-[#6b594c] mb-10">
                    What tutors say about organizing their teaching life with Tutora
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Sarah Chen", role: "Math Tutor", content: "Tutora eliminated my admin headaches. I spend 2 hours less per week on paperwork.",
                            avatar: "👩‍🏫",
                        },
                        {
                            name: "Michael Rodriguez", role: "Guitar Instructor", content: "Finally, a tool that gets it. Simple, effective, no fluff.",
                            avatar: "🎸",
                        },
                        {
                            name: "Priya Sharma", role: "Home Educator", content: "Fee reminders alone saved me awkward convos. Tutora handles it all.",
                            avatar: "📚",
                        },
                    ].map((t, i) => (
                        <Card key={i} className="p-6 text-center bg-white border border-[#eadfcf] rounded-xl shadow-sm">
                            <div className="text-4xl mb-3">{t.avatar}</div>
                            <h4 className="font-semibold text-[#3e2f23]">{t.name}</h4>
                            <p className="text-xs text-[#907c68]">{t.role}</p>
                            <p className="text-[#5f5043] italic mt-4">"{t.content}"</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );

    const FAQ = () => (
        <section className="py-20 px-6 bg-[#fcf8f3]">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-[#3e2f23] mb-6">FAQs</h2>
                <p className="text-lg text-[#6b594c] mb-8">
                    Everything you need to know before getting started
                </p>

                <Accordion type="multiple" collapsible className="w-full text-left">
                    {[
                        {
                            question: "Is Tutora really free?",
                            answer: "Yes! All core features are free with optional upgrades if needed.",
                        },
                        {
                            question: "Do I need tech skills?",
                            answer: "Nope. If you can use WhatsApp, you can use Tutora.",
                        },
                        {
                            question: "Is it for all teaching styles?",
                            answer: "Yes, it's flexible enough for any subject or format.",
                        },
                        {
                            question: "Is student data safe?",
                            answer: "100%. We never access or sell your data.",
                        },
                    ].map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="text-lg font-semibold text-[#3e2f23] hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-[#6b594c] text-sm">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );

    return (
        <div className="bg-[#fdfaf5]">
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
            />
            <Testimonials />
            <FAQ />
        </div>
    );
};

export default Landing;
