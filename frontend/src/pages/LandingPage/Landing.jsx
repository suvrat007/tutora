import { useState, useEffect } from "react";
import {
    Calendar, Users, DollarSign, FileText, Clock,
    Shield, Heart, Zap, CheckCircle, ArrowRight,
    Sparkles, Mail, ChevronDown, BookOpen, Bell,
    BarChart2, UserCheck, Download, StickyNote,
    Menu, X, Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "@/pages/LandingPage/Hero.jsx";
import VideoModal from "@/pages/LandingPage/VideoModal.jsx";

/* ── helpers ─────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut", delay } },
});
const VP = { once: false, margin: "-80px" };

/* ── section label ───────────────────────────────────────── */
const Label = ({ children }) => (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-[#ddb892]/60 bg-[#fdf5ec] text-[#8b5e3c] mb-4">
        {children}
    </span>
);

/* ── data ────────────────────────────────────────────────── */
const allFeatures = [
    {
        icon: Users,
        title: "Student Management",
        description: "Add students, assign them to batches and subjects, store contact info, school name, grade, and admission date in one place.",
        span: "md:col-span-2",
        accent: "#fef3e8",
        iconColor: "#c0764b",
    },
    {
        icon: BookOpen,
        title: "Batch & Subject Setup",
        description: "Create unlimited batches, define subjects per batch, and assign students to specific subjects.",
        span: "md:col-span-1",
        accent: "#fdf8f0",
        iconColor: "#8b5e3c",
    },
    {
        icon: UserCheck,
        title: "Attendance Marking",
        description: "Mark daily attendance per class. See who showed up, who didn't, and which classes actually held.",
        span: "md:col-span-1",
        accent: "#fdf8f0",
        iconColor: "#8b5e3c",
    },
    {
        icon: BarChart2,
        title: "Attendance Analytics",
        description: "Per-student attendance percentages across all batches and subjects. Filter by date range to spot trends.",
        span: "md:col-span-2",
        accent: "#fef3e8",
        iconColor: "#c0764b",
    },
    {
        icon: DollarSign,
        title: "Fee Tracking",
        description: "Set per-student monthly fee amounts, mark payments, track who's paid and who hasn't — with the exact date fees were cleared.",
        span: "md:col-span-2",
        accent: "#fef3e8",
        iconColor: "#c0764b",
    },
    {
        icon: Download,
        title: "Fee CSV Export",
        description: "Export the current month's fee status to a spreadsheet in one click — name, batch, amount, status, and paid date included.",
        span: "md:col-span-1",
        accent: "#fdf8f0",
        iconColor: "#8b5e3c",
    },
    {
        icon: Calendar,
        title: "Class Scheduling",
        description: "Schedule classes with date and time, track whether they held, were cancelled, or are pending. Edit status retroactively.",
        span: "md:col-span-1",
        accent: "#fdf8f0",
        iconColor: "#8b5e3c",
    },
    {
        icon: StickyNote,
        title: "Session Notes",
        description: "Log what was covered in each class session. Review class history, notes, and attendance for any past date.",
        span: "md:col-span-2",
        accent: "#fef3e8",
        iconColor: "#c0764b",
    },
    {
        icon: Bell,
        title: "Reminders",
        description: "Set custom reminders for tests, homework deadlines, fee collection, or anything else. They show up on your dashboard.",
        span: "md:col-span-1",
        accent: "#fdf8f0",
        iconColor: "#8b5e3c",
    },
    {
        icon: FileText,
        title: "Test Management",
        description: "Schedule tests, log results per student, set max and pass marks, and track test history across all batches.",
        span: "md:col-span-1",
        accent: "#fdf8f0",
        iconColor: "#8b5e3c",
    },
    {
        icon: Clock,
        title: "Institute Overview",
        description: "One page to see all your batches, class logs, and student data. Filter class history by batch, subject, grade, status, or date.",
        span: "md:col-span-1",
        accent: "#fdf8f0",
        iconColor: "#8b5e3c",
    },
];

const steps = [
    {
        number: "01",
        icon: BookOpen,
        title: "Set up batches & students",
        description: "Create your batches, define subjects, and enroll students in minutes. Each student gets their own profile with contact info.",
    },
    {
        number: "02",
        icon: UserCheck,
        title: "Track attendance & fees daily",
        description: "Mark who attended class and log monthly fee payments directly from your phone or computer. Takes 30 seconds.",
    },
    {
        number: "03",
        icon: BarChart2,
        title: "Review insights & export",
        description: "See attendance percentages and pending fees at a glance. Export monthly fee reports with one click.",
    },
];

const benefits = [
    { icon: Clock, stat: "2h+", label: "Saved per week vs manual registers" },
    { icon: Zap, stat: "0", label: "Learning curve — works like your phone" },
    { icon: Shield, stat: "100%", label: "Data stays yours — never shared" },
    { icon: Heart, stat: "Free", label: "Always free for solo educators" },
];

const testimonials = [
    {
        quote: "Finally a tool that doesn't feel like enterprise software. Set up 3 batches in one evening — now fee tracking is actually something I look forward to.",
        name: "Priya Sharma",
        role: "Math Tutor",
        location: "Delhi",
        initials: "PS",
    },
    {
        quote: "I used to maintain everything in notebooks and WhatsApp messages. Tutora replaced all of that. I always know the exact attendance for every student now.",
        name: "Vikram Mehta",
        role: "Science Coaching",
        location: "Pune",
        initials: "VM",
    },
    {
        quote: "The CSV export for fees is a lifesaver. I send it to parents at month end in two clicks. No more manually writing out lists or maintaining Excel sheets.",
        name: "Anjali Singh",
        role: "English Tutor",
        location: "Bangalore",
        initials: "AS",
    },
];

const faqs = [
    { question: "Is Tutora free?", answer: "Yes — all core features are free. No hidden charges, no paywalls for things you actually use daily." },
    { question: "Do I need any tech skills?", answer: "Not at all. If you can use WhatsApp you can use Tutora. The interface is designed to be minimal and self-explanatory." },
    { question: "Is it only for math tutors?", answer: "Tutora works for any subject — math, science, music, language, or anything else. Batches and subjects are fully customizable." },
    { question: "Is student data safe?", answer: "Yes. Data is stored securely and is tied to your account only. No third party ever sees your students' information." },
    { question: "Can I suggest a feature?", answer: "Absolutely. Drop a mail to suvratmittal007@gmail.com and I'll look into it." },
];

/* ── Navbar ──────────────────────────────────────────────── */
const Navbar = ({ user, navigate }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navLinks = [
        ["Features", "#features"],
        ["How it works", "#how-it-works"],
        ["FAQ", "#faq"],
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#ecdec9]"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <a href="/" className="flex items-center gap-2.5 shrink-0">
                    <img src="/pwa-192x192.png" alt="Tutora Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                    <span
                        className="font-extrabold text-[#1a0f07] text-lg tracking-tight"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        Tutora
                    </span>
                </a>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(([label, href]) => (
                        <a
                            key={href}
                            href={href}
                            className="text-sm font-medium text-[#6b5c4a] hover:text-[#1a0f07] transition-colors"
                        >
                            {label}
                        </a>
                    ))}
                </div>

                {/* CTA + mobile menu */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate("/main")}
                            className="px-5 py-2 rounded-xl bg-[#1a0f07] text-white text-sm font-semibold hover:bg-[#2c1a0e] transition-colors cursor-pointer"
                        >
                            Dashboard
                        </motion.button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/login")}
                                className="hidden sm:block text-sm font-medium text-[#6b5c4a] hover:text-[#1a0f07] transition-colors cursor-pointer"
                            >
                                Sign In
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate("/login")}
                                className="px-5 py-2 rounded-xl bg-[#1a0f07] text-white text-sm font-semibold hover:bg-[#2c1a0e] transition-colors cursor-pointer"
                            >
                                Start Free
                            </motion.button>
                        </>
                    )}
                    <button
                        className="md:hidden p-2 rounded-lg text-[#6b5c4a] hover:bg-[#f5ede3] transition-colors cursor-pointer"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="md:hidden bg-white border-b border-[#ecdec9] overflow-hidden"
                    >
                        <div className="px-4 py-4 flex flex-col gap-4">
                            {navLinks.map(([label, href]) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="text-sm font-medium text-[#6b5c4a] hover:text-[#1a0f07]"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

/* ─────────────────────────────────────────────────────────── */

const Landing = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    return (
        <div
            className="min-h-screen antialiased"
            style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                background: "linear-gradient(160deg, #fdf8f3 0%, #faf4ed 40%, #fdf6ee 70%, #faf6f1 100%)",
            }}
        >
            <Navbar user={user} navigate={navigate} />
            <Hero user={user} setIsModalOpen={setIsModalOpen} />
            <VideoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} handleNavigate={navigate} />

            {/* ── PAIN FRAMING ─────────────────────────────── */}
            <section className="py-16 md:py-20 px-4 sm:px-6 bg-[#faf6f1] border-t border-[#ecdec9]">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="text-center mb-10"
                    >
                        <Label>Sound familiar?</Label>
                        <h2
                            className="text-3xl sm:text-4xl font-extrabold text-[#1a0f07] tracking-tight"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            Managing students shouldn't feel like a second job
                        </h2>
                        <p className="mt-3 text-[#7b5c4b] text-base max-w-lg mx-auto">
                            Most private tutors are still doing this — and wasting hours every week on it.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                before: "Calling / texting parents one by one at month-end to ask about fees",
                                after:  "See every pending payment at a glance. Share a report in two clicks.",
                            },
                            {
                                before: "Hunting through notebooks to remember who missed last Tuesday",
                                after:  "Per-student attendance history, always up to date.",
                            },
                            {
                                before: "Keeping test scores in a spreadsheet no one else can read",
                                after:  "Log results once — trends and pass/fail tracked automatically.",
                            },
                            {
                                before: "Forgetting a student's school, grade, or parent number mid-call",
                                after:  "Every detail in one profile, searchable in seconds.",
                            },
                        ].map(({ before, after }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={VP}
                                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
                                className="bg-white rounded-2xl border border-[#e8d5c0] p-5 flex flex-col gap-4 shadow-sm"
                            >
                                {/* Before */}
                                <div className="flex gap-2.5 items-start">
                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 stroke-red-500 fill-none" strokeWidth="2" strokeLinecap="round">
                                            <path d="M2 2l8 8M10 2l-8 8"/>
                                        </svg>
                                    </div>
                                    <p className="text-sm text-[#9b8778] leading-snug line-through decoration-[#d4a89a]">{before}</p>
                                </div>
                                {/* Divider */}
                                <div className="h-px bg-[#f0e4d5]" />
                                {/* After */}
                                <div className="flex gap-2.5 items-start">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 stroke-green-600 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 6l3 3 5-5"/>
                                        </svg>
                                    </div>
                                    <p className="text-sm text-[#2c1a0e] font-medium leading-snug">{after}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────── */}
            <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="text-center mb-16"
                    >
                        <Label>Simple by design</Label>
                        <h2
                            className="text-4xl sm:text-5xl font-extrabold text-[#1a0f07] tracking-tight"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            Set up in under 5 minutes
                        </h2>
                        <p className="mt-3 text-[#6b5c4a] text-lg max-w-lg mx-auto">
                            No training required. Three steps and you're running.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Connector line (desktop only) */}
                        <div className="hidden md:block absolute top-12 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-[#ecdec9] via-[#ddb892] to-[#ecdec9] z-0" />

                        {steps.map(({ number, icon: Icon, title, description }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={VP}
                                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                                className="relative z-10 flex flex-col items-center text-center p-8 rounded-2xl bg-[#fdf8f3] border border-[#ecdec9]"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#1a0f07] flex items-center justify-center mb-5 shadow-lg shadow-[#1a0f07]/15">
                                    <Icon className="w-7 h-7 text-[#f0d5b0]" />
                                </div>
                                <span className="text-xs font-bold tracking-widest text-[#c0a080] mb-2">{number}</span>
                                <h3
                                    className="font-bold text-[#1a0f07] text-lg mb-2"
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                >
                                    {title}
                                </h3>
                                <p className="text-sm text-[#7b6a58] leading-relaxed">{description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────────── */}
            <section id="features" className="py-20 md:py-28 px-4 sm:px-6" style={{ background: "#faf6f1" }}>
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="mb-14"
                    >
                        <Label>Everything included</Label>
                        <h2
                            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1a0f07] leading-tight tracking-tight max-w-2xl"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            Every tool a tutor actually needs
                        </h2>
                        <p className="mt-4 text-[#7b5c4b] text-lg max-w-xl">
                            No bloat, no enterprise features you'll never use. Just the things that matter.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {allFeatures.map(({ icon: Icon, title, description, span, accent, iconColor }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={VP}
                                transition={{ duration: 0.5, ease: "easeOut", delay: (i % 3) * 0.07 }}
                                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                                className={`${span} rounded-2xl border border-[#e8d5c0]/70 bg-white p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow`}
                            >
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                                    style={{ background: accent }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: iconColor }} />
                                </div>
                                <div>
                                    <h3
                                        className="text-[#1a0f07] font-bold text-lg mb-1"
                                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                    >
                                        {title}
                                    </h3>
                                    <p className="text-[#9b8778] text-sm leading-relaxed">{description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BENEFITS STRIP ───────────────────────────── */}
            <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#16100a] relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                {/* Ambient glow */}
                <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#8b5e3c]/20 rounded-full blur-3xl" />

                <div className="max-w-6xl mx-auto relative">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="text-center mb-16"
                    >
                        <h2
                            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#fdf5ec] tracking-tight"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            The simple way to run your tuition
                        </h2>
                        <p className="mt-3 text-[#c4a882] text-base max-w-lg mx-auto">
                            Built for how a solo tutor actually works — not how a school software company thinks you do.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {benefits.map(({ icon: Icon, stat, label }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={VP}
                                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.09 }}
                                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#f0d5b0]/12 flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-[#e7c6a5]" />
                                </div>
                                <p
                                    className="text-4xl font-extrabold text-[#fdf5ec] tracking-tight"
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                >
                                    {stat}
                                </p>
                                <p className="text-sm text-[#c4a882] leading-snug">{label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ─────────────────────────────── */}
            <section className="py-20 md:py-28 px-4 sm:px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="text-center mb-14"
                    >
                        <Label>Educators love it</Label>
                        <h2
                            className="text-4xl sm:text-5xl font-extrabold text-[#1a0f07] tracking-tight"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            From tutors across India
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map(({ quote, name, role, location, initials }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={VP}
                                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                                className="flex flex-col gap-5 p-7 rounded-2xl border border-[#ecdec9] bg-[#fdf8f3] hover:border-[#ddb892] hover:shadow-sm transition-all duration-200"
                            >
                                {/* Stars */}
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-[#f0a030] text-[#f0a030]" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-[#3d2b1a] text-sm leading-relaxed flex-1">
                                    "{quote}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-2 border-t border-[#ecdec9]">
                                    <div className="w-10 h-10 rounded-full bg-[#1a0f07] flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-[#f0d5b0]">{initials}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#1a0f07] text-sm">{name}</p>
                                        <p className="text-xs text-[#9b8778]">
                                            {role} · {location}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────── */}
            <section id="faq" className="py-20 md:py-28 px-4 sm:px-6" style={{ background: "#faf6f1" }}>
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="mb-12"
                    >
                        <Label>FAQ</Label>
                        <h2
                            className="text-4xl sm:text-5xl font-extrabold text-[#1a0f07] tracking-tight"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            Quick answers
                        </h2>
                    </motion.div>

                    <div className="space-y-2">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={VP}
                                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.06 }}
                                className="rounded-xl border border-[#e8d5c0]/70 bg-white overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer group"
                                    aria-expanded={openFaq === i}
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-[#8b5e3c] shrink-0" />
                                        <span className="text-sm sm:text-base font-semibold text-[#1a0f07] group-hover:text-[#6b4226] transition-colors">
                                            {faq.question}
                                        </span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                                        transition={{ duration: 0.22 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-[#9b8778] shrink-0" />
                                    </motion.div>
                                </button>
                                <AnimatePresence initial={false}>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.26, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-5 pb-5 text-sm text-[#7b5c4b] leading-relaxed border-t border-[#e8d5c0]/50 pt-3">
                                                {faq.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────── */}
            {!user && (
                <section className="py-20 md:py-28 px-4 sm:px-6 bg-white">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="max-w-2xl mx-auto text-center"
                    >
                        <div className="relative rounded-3xl overflow-hidden border border-[#e8d5c0] bg-[#1a0f07] shadow-2xl p-10 sm:p-14">
                            {/* Ambient glows */}
                            <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-[#8b5e3c]/30 rounded-full blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 bg-[#c0764b]/20 rounded-full blur-3xl" />

                            <div className="relative">
                                <p className="text-xs font-bold tracking-widest uppercase text-[#c4a882] mb-4">
                                    Free forever
                                </p>
                                <h2
                                    className="text-4xl sm:text-5xl font-extrabold text-[#fdf5ec] mb-4 tracking-tight leading-tight"
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                >
                                    Give Tutora a try
                                </h2>
                                <p className="text-[#c4a882] mb-8 text-base leading-relaxed">
                                    Free to use. No credit card. Setup takes under a minute.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate("/login")}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#f0d5b0] text-[#1a0f07] font-bold text-base hover:bg-white transition-colors cursor-pointer shadow-lg"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Start Free
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* ── FOOTER ──────────────────────────────────── */}
            <footer className="border-t border-[#e8d5c0] bg-[#f8f2eb] py-14 px-4">
                <div className="max-w-xl mx-auto flex flex-col items-center gap-7">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <img src="/pwa-192x192.png" alt="Tutora Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                        <span
                            className="font-extrabold text-[#1a0f07] text-lg tracking-tight"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            Tutora
                        </span>
                    </div>

                    <p className="text-xs font-bold tracking-widest uppercase text-[#9b8778]">Built by</p>

                    <motion.a
                        href="https://github.com/suvrat007"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.03, boxShadow: "0 8px 28px rgba(0,0,0,0.08)" }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-4 bg-white border border-[#e8d5c0] rounded-2xl px-6 py-4 shadow-sm cursor-pointer"
                    >
                        <img
                            src="https://github.com/suvrat007.png?size=80"
                            alt="Suvrat's GitHub avatar"
                            className="w-12 h-12 rounded-full border-2 border-[#e8d5c0]"
                            loading="lazy"
                        />
                        <div className="text-left">
                            <p
                                className="font-bold text-[#1a0f07]"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            >
                                Suvrat Mittal
                            </p>
                            <p className="text-sm text-[#9b8778]">github.com/suvrat007</p>
                        </div>
                    </motion.a>

                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-sm text-[#7b5c4b]">Feedback, suggestions, or feature requests?</p>
                        <motion.a
                            href="mailto:suvratmittal007@gmail.com?subject=Tutora Feedback"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 bg-white border border-[#e8d5c0] rounded-lg px-4 py-2.5 text-sm font-medium text-[#4a3a2c] hover:bg-[#fdf5ec] transition-colors shadow-sm cursor-pointer"
                        >
                            <Mail className="w-4 h-4 text-[#8b5e3c]" />
                            suvratmittal007@gmail.com
                        </motion.a>
                    </div>

                    <p className="text-xs text-[#c4a882]">© {new Date().getFullYear()} Tutora. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
