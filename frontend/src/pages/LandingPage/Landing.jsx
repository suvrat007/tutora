import React, { useState, useEffect } from "react";
import {
    Calendar,
    Users,
    DollarSign,
    FileText,
    CheckCircle,
    Clock,
    BookOpen,
    Star,
    ArrowRight,
    Play,
    Shield,
    Heart,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {useNavigate} from "react-router-dom";

const Landing = () => {
    const [currentWord, setCurrentWord] = useState(0);
    const rotatingWords = ["Assistant", "Anchor", "Automator", "Admin", "Ally"];
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate("/login");
    }
    const goToHome = () => {
        navigate("/main");
    }

    useEffect(() => {
        const interval = setInterval(
            () => setCurrentWord((prev) => (prev + 1) % rotatingWords.length),
            2000
        );
        return () => clearInterval(interval);
    }, []);

    const sections = {
        features: [
            {
                icon: Users,
                title: "Track Attendance",
                description: "Monitor all batches & students with easy check-in/out system",
            },
            {
                icon: DollarSign,
                title: "Manage Fees",
                description: "Due reminders, payment history, and automated fee tracking",
            },
            {
                icon: Calendar,
                title: "Class Scheduling",
                description: "Calendar view with session planning and time management",
            },
            {
                icon: FileText,
                title: "Session Notes",
                description: "Log daily class activities and track student progress",
            },
        ],
        benefits: [
            {
                icon: Clock,
                title: "Save Time Daily",
                description:
                    "Automate repetitive tasks and focus on what you do best - teaching",
            },
            {
                icon: Zap,
                title: "Zero Learning Curve",
                description: "Intuitive design that feels familiar from day one",
            },
            {
                icon: Shield,
                title: "100% Private",
                description:
                    "Your student data stays secure and completely under your control",
            },
            {
                icon: Heart,
                title: "Built for Solo Educators",
                description:
                    "No bloated features - just what individual tutors actually need",
            },
        ],
        testimonials: [
            {
                name: "Sarah Chen",
                role: "Math Tutor",
                content:
                    "Tutora eliminated my admin headaches. I spend 2 hours less per week on paperwork and more time with my students.",
                avatar: "👩‍🏫",
            },
            {
                name: "Michael Rodriguez",
                role: "Guitar Instructor",
                content:
                    "Finally, a tool that gets it. No complex setup, no team features I don't need. Just simple, effective organization.",
                avatar: "👨‍🎼",
            },
            {
                name: "Priya Sharma",
                role: "Home Educator",
                content:
                    "The fee reminders alone have saved me countless awkward conversations. Tutora handles the business side seamlessly.",
                avatar: "👩‍💼",
            },
        ],
        faqs: [
            {
                question: "Is Tutora really free?",
                answer:
                    "Yes! We believe every solo educator deserves great tools. Our core features are completely free with optional premium add-ons.",
            },
            {
                question: "Do I need technical skills to use Tutora?",
                answer:
                    "Not at all. Tutora is designed to be as simple as your favorite notepad, but infinitely more powerful.",
            },
            {
                question: "Can I use Tutora for different types of teaching?",
                answer:
                    "Absolutely! Whether you teach academics, arts, fitness, or any skill - Tutora adapts to your teaching style.",
            },
            {
                question: "How secure is my student data?",
                answer:
                    "Your data is encrypted and stored securely. We never share or access your student information - it's yours alone.",
            },
        ],
    };

    const Hero = () => (
        <section className="py-20 px-6 text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
                Your personal{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Tutor
        </span>
                <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          {rotatingWords[currentWord]}
        </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The all-in-one teaching partner built exclusively for solo educators.
                Manage your classes, students, and schedule like a pro.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white" onClick={goToLogin()}>
                    Try Now
                </Button>
                <Button variant="outline" size="lg">
                    Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </section>
    );

    const GridSection = ({ title, subtitle, items }) => (
        <section className="py-16 px-6 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-xl text-gray-600 mb-12">{subtitle}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map(({ icon: Icon, title, description }, i) => (
                        <Card key={i} className="shadow-md">
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto flex items-center justify-center">
                                    <Icon className="h-8 w-8 text-indigo-600" />
                                </div>
                                <CardTitle className="mt-4">{title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center text-gray-600">
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
        <section className="py-20 px-6 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">Loved by solo educators</h2>
                <p className="text-xl text-gray-600 mb-10">
                    Hear what tutors say about organizing their teaching life with Tutora
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {sections.testimonials.map((t, i) => (
                        <Card key={i} className="p-6 text-center shadow-lg">
                            <div className="text-5xl mb-3">{t.avatar}</div>
                            <h4 className="font-semibold text-gray-900">{t.name}</h4>
                            <p className="text-sm text-gray-600">{t.role}</p>
                            <p className="text-gray-700 italic mt-4">"{t.content}"</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );

    const FAQ = () => (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">FAQs</h2>
                <p className="text-xl text-gray-600 mb-8">
                    Everything you need to know before you get started
                </p>
                <div className="space-y-6 text-left">
                    {sections.faqs.map((faq, i) => (
                        <Card key={i} className="shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );

    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Hero />
            <GridSection
                title="Smart Features"
                subtitle="Everything you need to teach with confidence"
                items={sections.features}
            />
            <GridSection
                title="Why Tutors Love Tutora"
                subtitle="We built it for exactly how you work."
                items={sections.benefits}
            />
            <Testimonials />
            <FAQ />
        </div>
    );
};

export default Landing;
