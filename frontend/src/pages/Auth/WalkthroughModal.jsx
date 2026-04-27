import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Users, BookOpen, ClipboardCheck,
    Banknote, FlaskConical, Building2, X, ChevronRight, ChevronLeft, Sparkles
} from "lucide-react";

const SLIDES = [
    {
        icon: Sparkles,
        color: "#c47d3e",
        bg: "#fff3e6",
        title: "Welcome to Tutora!",
        subtitle: "Your all-in-one tutoring institute manager",
        points: [
            "Manage batches, students, attendance and fees in one place",
            "Track test performance and rank students automatically",
            "Get a live dashboard of everything happening at your institute",
        ],
    },
    {
        icon: LayoutDashboard,
        color: "#7b5c4b",
        bg: "#f5ede3",
        title: "Dashboard",
        subtitle: "Your institute at a glance",
        points: [
            "See live attendance stats, fee summaries and upcoming tests",
            "Top Students widget ranks students by attendance, marks & fee",
            "Quick-access cards surface what needs attention today",
        ],
    },
    {
        icon: BookOpen,
        color: "#5a6e4b",
        bg: "#eef3e8",
        title: "Batches",
        subtitle: "Create and organise your classes",
        points: [
            "Create batches with subjects, schedules and class timings",
            "Assign a standard/grade and track enrolled students per batch",
            "All features — attendance, tests, fees — are tied to your batches",
        ],
    },
    {
        icon: Users,
        color: "#4b6b8a",
        bg: "#e8f0f5",
        title: "Students",
        subtitle: "Manage your entire student roster",
        points: [
            "Add students and enrol them into one or multiple batches",
            "View individual profiles with attendance and fee history",
            "Student data flows automatically into tests and rankings",
        ],
    },
    {
        icon: ClipboardCheck,
        color: "#8b5e3c",
        bg: "#f8ede3",
        title: "Attendance",
        subtitle: "Mark and monitor class attendance",
        points: [
            "Select batch, subject and date — only valid class days are allowed",
            "See the attendance summary update in real time as you mark",
            "Institute Info flags missed attendance days with a shortcut button",
        ],
    },
    {
        icon: Banknote,
        color: "#4a7c59",
        bg: "#eaf3ed",
        title: "Fee Management",
        subtitle: "Stay on top of payments",
        points: [
            "Record fee payments per student and batch",
            "Pending dues are highlighted in the dashboard fee summary",
            "Fee status also factors into the Top Students composite score",
        ],
    },
    {
        icon: FlaskConical,
        color: "#6b4a8a",
        bg: "#f0eaf5",
        title: "Test Management",
        subtitle: "Schedule, enter and analyse test results",
        points: [
            "Schedule tests for any batch with max marks and pass criteria",
            "Results auto-save as you type — overdue tests complete themselves",
            "Pass / fail stats and class average shown instantly in the detail view",
        ],
    },
    {
        icon: Building2,
        color: "#7b6a3c",
        bg: "#f5f0e3",
        title: "Institute Info",
        subtitle: "Full visibility into your institute's history",
        points: [
            "Browse every class — conducted, cancelled or unrecorded — by date",
            "Filter by batch, subject or date range to find what you need",
            "One-click jump to the attendance page for any unrecorded day",
        ],
    },
];

const STORAGE_KEY = "tutora_tour_seen";

const WalkthroughModal = ({ onDone }) => {
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);

    const slide = SLIDES[step];
    const Icon = slide.icon;
    const isLast = step === SLIDES.length - 1;

    const go = (next) => {
        setDir(next > step ? 1 : -1);
        setStep(next);
    };

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, "1");
        onDone();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="relative w-full max-w-md bg-[#faf6f1] rounded-3xl shadow-2xl border border-[#e6c8a8] overflow-hidden"
            >
                {/* Top accent bar */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${slide.color}99, ${slide.color})` }} />

                {/* Close */}
                <button
                    onClick={dismiss}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-[#b0998a] hover:text-[#5a4a3c] hover:bg-[#e6c8a8]/50 transition-colors z-10"
                    title="Skip tour"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="px-7 pt-7 pb-6">
                    {/* Icon */}
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                        style={{ background: slide.bg, border: `1.5px solid ${slide.color}30` }}
                    >
                        <Icon className="w-7 h-7" style={{ color: slide.color }} />
                    </div>

                    {/* Step counter */}
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: slide.color }}>
                        {step + 1} / {SLIDES.length}
                    </p>

                    {/* Slide content */}
                    <AnimatePresence mode="wait" custom={dir}>
                        <motion.div
                            key={step}
                            custom={dir}
                            initial={{ opacity: 0, x: dir * 28 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: dir * -28 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                        >
                            <h2 className="text-xl font-bold text-[#2c1a0e] mb-1">{slide.title}</h2>
                            <p className="text-sm text-[#9b8778] mb-5">{slide.subtitle}</p>

                            <ul className="space-y-3">
                                {slide.points.map((pt, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span
                                            className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                                            style={{ background: slide.bg, color: slide.color, border: `1.5px solid ${slide.color}40` }}
                                        >
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-[#5a4a3c] leading-relaxed">{pt}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </AnimatePresence>

                    {/* Dot progress */}
                    <div className="flex justify-center gap-1.5 mt-7">
                        {SLIDES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => go(i)}
                                className="rounded-full transition-all"
                                style={{
                                    width: i === step ? 20 : 8,
                                    height: 8,
                                    background: i === step ? slide.color : "#e6c8a8",
                                }}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-5">
                        <button
                            onClick={() => go(step - 1)}
                            disabled={step === 0}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[#7b5c4b] bg-[#f0d9c0] hover:bg-[#e6c8a8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        {isLast ? (
                            <button
                                onClick={dismiss}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors shadow-md"
                                style={{ background: slide.color }}
                            >
                                Get started
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={() => go(step + 1)}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors shadow-md"
                                style={{ background: slide.color }}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export { STORAGE_KEY };
export default WalkthroughModal;
