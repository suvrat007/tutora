import { useState } from "react";
import {
    Calendar, Users, DollarSign, FileText, Clock,
    Shield, Heart, Zap, CheckCircle, ArrowRight,
    Sparkles, Mail, ChevronDown, BookOpen, Bell,
    BarChart2, UserCheck, Download, StickyNote
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "@/pages/LandingPage/Hero.jsx";
import VideoModal from "@/pages/LandingPage/VideoModal.jsx";

/* ── animation helpers ─────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut", delay } }
});

// viewport options reused everywhere — once:false makes animations replay on re-enter
const VP = { once: false, margin: "-90px" };

/* ── reusable section label ─────────────────────────────────── */
const Label = ({ children }) => (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-[#ddb892]/60 bg-[#fdf5ec] text-[#8b5e3c] mb-4">
        {children}
    </span>
);

/* ── all features (existing app) ──────────────────────────────
   Grouped into: manage students, track attendance, handle fees,
   class management, reminders, reporting                       */
const allFeatures = [
    {
        icon: Users,
        title: "Student Management",
        description: "Add students, assign them to batches and subjects, store contact info, school name, grade, and admission date in one place.",
        span: "md:col-span-2",
        accent: "#f5e4d0",
    },
    {
        icon: BookOpen,
        title: "Batch & Subject Setup",
        description: "Create unlimited batches, define subjects per batch, and assign students to specific subjects.",
        span: "md:col-span-1",
        accent: "#fdf0e6",
    },
    {
        icon: UserCheck,
        title: "Attendance Marking",
        description: "Mark daily attendance per class. See who showed up, who didn't, and which classes actually held.",
        span: "md:col-span-1",
        accent: "#fdf0e6",
    },
    {
        icon: BarChart2,
        title: "Attendance Analytics",
        description: "Per-student attendance percentages across all batches and subjects. Filter by date range to spot trends.",
        span: "md:col-span-2",
        accent: "#f5e4d0",
    },
    {
        icon: DollarSign,
        title: "Fee Tracking",
        description: "Set per-student monthly fee amounts, mark payments, track who's paid and who hasn't — with the exact date fees were cleared.",
        span: "md:col-span-2",
        accent: "#f5e4d0",
    },
    {
        icon: Download,
        title: "Fee CSV Export",
        description: "Export the current month's fee status to a spreadsheet in one click — name, batch, amount, status, and paid date included.",
        span: "md:col-span-1",
        accent: "#fdf0e6",
    },
    {
        icon: Calendar,
        title: "Class Scheduling",
        description: "Schedule classes with date and time, track whether they held, were cancelled, or are pending. Edit status retroactively.",
        span: "md:col-span-1",
        accent: "#fdf0e6",
    },
    {
        icon: StickyNote,
        title: "Session Notes",
        description: "Log what was covered in each class session. Review class history, notes, and attendance for any past date.",
        span: "md:col-span-2",
        accent: "#f5e4d0",
    },
    {
        icon: Bell,
        title: "Reminders",
        description: "Set custom reminders for tests, homework deadlines, fee collection, or anything else. They show up on your dashboard.",
        span: "md:col-span-1",
        accent: "#fdf0e6",
    },
    {
        icon: FileText,
        title: "Test Management",
        description: "Schedule tests, log results per student, set max and pass marks, and track test history across all batches.",
        span: "md:col-span-1",
        accent: "#fdf0e6",
    },
    {
        icon: Clock,
        title: "Institute Overview",
        description: "One page to see all your batches, class logs, and student data. Filter class history by batch, subject, grade, status, or date.",
        span: "md:col-span-1",
        accent: "#fdf0e6",
    },
];

const benefits = [
    { icon: Clock,   stat: "2h+",  label: "Saved per week vs manual registers" },
    { icon: Zap,     stat: "0",    label: "Learning curve — works like your phone" },
    { icon: Shield,  stat: "100%", label: "Data stays yours — never shared" },
    { icon: Heart,   stat: "1",    label: "Tool built only for solo educators" },
];

const faqs = [
    { question: "Is Tutora free?", answer: "Yes — all core features are free. No hidden charges, no paywalls for things you actually use daily." },
    { question: "Do I need any tech skills?", answer: "Not at all. If you can use WhatsApp you can use Tutora. The interface is designed to be minimal and self-explanatory." },
    { question: "Is it only for math tutors?", answer: "Tutora works for any subject — math, science, music, language, or anything else. Batches and subjects are fully customizable." },
    { question: "Is student data safe?", answer: "Yes. Data is stored securely and is tied to your account only. No third party ever sees your students' information." },
    { question: "Can I suggest a feature?", answer: "Absolutely. Drop a mail to suvratmittal007@gmail.com and I'll look into it." },
];

/* ─────────────────────────────────────────────────────────── */

const Landing = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [currentWord, setCurrentWord] = useState(0);
    const rotatingWords = ["ssistant", "nchor", "utomator", "dmin", "lly"];
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    useState(() => {
        const id = setInterval(() => setCurrentWord(p => (p + 1) % rotatingWords.length), 2000);
        return () => clearInterval(id);
    });

    return (
        <div className="bg-[#faf6f1] min-h-screen font-['Inter',sans-serif] antialiased" style={{ background: "linear-gradient(160deg, #fdf8f3 0%, #faf4ed 40%, #fdf6ee 70%, #faf6f1 100%)" }}>
            <Hero currentWord={currentWord} rotatingWords={rotatingWords} user={user} setIsModalOpen={setIsModalOpen} />
            <VideoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} handleNavigate={navigate} />

            {/* ── FEATURES BENTO ─────────────────────────────── */}
            <section className="py-20 md:py-32 px-4 sm:px-6 bg-[#faf6f1]">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="mb-14"
                    >
                        <Label>Everything included</Label>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#2c1a0e] leading-tight tracking-tight max-w-2xl">
                            Every tool a tutor actually needs
                        </h2>
                        <p className="mt-4 text-[#7b5c4b] text-lg max-w-xl">
                            No bloat, no enterprise features you'll never use. Just the things that matter.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {allFeatures.map(({ icon: Icon, title, description, span, accent }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -70 : 70, y: 16 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={VP}
                                transition={{ duration: 0.55, ease: "easeOut" }}
                                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                                className={`${span} rounded-2xl border border-[#e8d5c0]/70 bg-white/70 backdrop-blur-sm p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow`}
                            >
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                                    style={{ background: accent }}
                                >
                                    <Icon className="w-5 h-5 text-[#6b4226]" />
                                </div>
                                <div>
                                    <h3 className="text-[#2c1a0e] font-bold text-lg mb-1">{title}</h3>
                                    <p className="text-[#9b8778] text-sm leading-relaxed">{description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DARK BENEFITS STRIP ─────────────────────────── */}
            <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#2c1a0e] relative overflow-hidden">
                {/* bg texture */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                <div className="max-w-6xl mx-auto relative">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#fdf5ec] tracking-tight">
                            The simple way to run your tuition
                        </h2>
                        <p className="mt-3 text-[#c4a882] text-base max-w-xl mx-auto">
                            Built for how a solo tutor actually works — not how a school software company thinks you do.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map(({ icon: Icon, stat, label }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 36 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={VP}
                                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
                                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#e7c6a5]/15 flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-[#e7c6a5]" />
                                </div>
                                <p className="text-4xl font-extrabold text-[#fdf5ec] tracking-tight">{stat}</p>
                                <p className="text-sm text-[#c4a882] leading-snug">{label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ─────────────────────────────────────────── */}
            <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#faf6f1]">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="mb-12"
                    >
                        <Label>FAQ</Label>
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#2c1a0e] tracking-tight">Quick answers</h2>
                    </motion.div>

                    <div className="space-y-2">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={VP}
                                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.06 }}
                                className="rounded-xl border border-[#e8d5c0]/70 bg-white/70 backdrop-blur-sm overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-[#8b5e3c] shrink-0" />
                                        <span className="text-sm sm:text-base font-semibold text-[#2c1a0e] group-hover:text-[#6b4226] transition-colors">
                                            {faq.question}
                                        </span>
                                    </div>
                                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.22 }}>
                                        <ChevronDown className="w-5 h-5 text-[#9b8778] shrink-0" />
                                    </motion.div>
                                </button>
                                <AnimatePresence initial={false}>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.28, ease: "easeInOut" }}
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

            {/* ── CTA ─────────────────────────────────────────── */}
            {!user && (
                <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#faf6f1]">
                    <motion.div
                        variants={fadeUp()}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VP}
                        className="max-w-2xl mx-auto text-center"
                    >
                        <div className="relative rounded-3xl overflow-hidden border border-[#e8d5c0] bg-white/70 backdrop-blur-sm shadow-xl p-10 sm:p-14">
                            <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-[#e7c6a5]/30 rounded-full blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 bg-[#f5d9bc]/20 rounded-full blur-3xl" />
                            <p className="relative text-xs font-bold tracking-widest uppercase text-[#8b5e3c] mb-4">Get started</p>
                            <h2 className="relative text-4xl sm:text-5xl font-extrabold text-[#2c1a0e] mb-4 tracking-tight leading-tight">
                                Give Tutora a try
                            </h2>
                            <p className="relative text-[#7b5c4b] mb-8 text-base leading-relaxed">
                                Free to use. No credit card. Setup takes under a minute.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.04, boxShadow: "0 12px 32px rgba(44,26,14,0.22)" }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => navigate("/login")}
                                className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#2c1a0e] text-white font-semibold text-base shadow-lg hover:bg-[#3e2510] transition-colors cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4" />
                                Start Free
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* ── FOOTER ──────────────────────────────────────── */}
            <footer className="border-t border-[#e8d5c0] bg-[#f5ede3] py-14 px-4">
                <div className="max-w-xl mx-auto flex flex-col items-center gap-7">
                    <p className="text-xs font-bold tracking-widest uppercase text-[#9b8778]">Built by</p>

                    <motion.a
                        href="https://github.com/suvrat007"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.03, boxShadow: "0 8px 28px rgba(0,0,0,0.09)" }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-4 bg-white border border-[#e8d5c0] rounded-2xl px-6 py-4 shadow-sm cursor-pointer"
                    >
                        <img
                            src="https://github.com/suvrat007.png?size=80"
                            alt="Suvrat's GitHub avatar"
                            className="w-12 h-12 rounded-full border-2 border-[#e8d5c0]"
                        />
                        <div className="text-left">
                            <p className="font-bold text-[#2c1a0e]">Suvrat Mittal</p>
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
