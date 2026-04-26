import { ArrowRight, Sparkles, Play, BookOpen, GraduationCap, Pencil, Lightbulb, ClipboardList, Users, Calendar, Bell, FlaskConical, Ruler } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const FLOATERS = [
    { Icon: GraduationCap, x: 5,   y: 10, size: 64, fy: 12, r: 6,   delay: 0,    dur: 6.0 },
    { Icon: BookOpen,      x: 88,  y: 8,  size: 52, fy: 10, r: -8,  delay: 0.8,  dur: 5.4 },
    { Icon: Pencil,        x: 78,  y: 58, size: 44, fy: 14, r: 10,  delay: 1.4,  dur: 5.8 },
    { Icon: Lightbulb,     x: 12,  y: 60, size: 48, fy: 12, r: -7,  delay: 0.5,  dur: 4.9 },
    { Icon: ClipboardList, x: 4,   y: 35, size: 40, fy: 10, r: 8,   delay: 2.0,  dur: 6.2 },
    { Icon: Users,         x: 90,  y: 35, size: 50, fy: 14, r: -9,  delay: 1.0,  dur: 5.1 },
    { Icon: Calendar,      x: 22,  y: 82, size: 44, fy: 12, r: 7,   delay: 2.4,  dur: 5.6 },
    { Icon: FlaskConical,  x: 68,  y: 80, size: 40, fy: 16, r: -10, delay: 1.6,  dur: 4.7 },
    { Icon: Ruler,         x: 46,  y: 5,  size: 42, fy: 10, r: 5,   delay: 0.7,  dur: 5.3 },
    { Icon: Bell,          x: 56,  y: 88, size: 38, fy: 14, r: -6,  delay: 1.9,  dur: 4.5 },
];

const Floater = ({ Icon, x, y, size, fy, r, delay, dur }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{
            opacity: [0, 0.1, 0.13, 0.1, 0],
            y:       [0, -fy, 0, fy * 0.35, 0],
            rotate:  [0, r,  0, -r * 0.4, 0],
        }}
        transition={{
            duration: dur,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.3, 0.5, 0.75, 1],
        }}
        className="absolute pointer-events-none select-none"
        style={{ left: `${x}%`, top: `${y}%`, color: "#8b5e3c" }}
    >
        <Icon style={{ width: size, height: size }} strokeWidth={1} />
    </motion.div>
);

const Hero = ({ user, setIsModalOpen }) => {
    const navigate = useNavigate();

    return (
        <section
            className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #f5b87a 0%, #f8cfa0 18%, #faebd8 42%, #fdf6ee 58%, #f8e4b8 78%, #f5cc80 100%)" }}
        >
            {/* Dot grid overlay */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#4a3a2c" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
            </div>

            {/* Floating icons */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {FLOATERS.map((f, i) => <Floater key={i} {...f} />)}
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ddb892]/60 bg-white/70 backdrop-blur-sm text-xs font-semibold text-[#7b5c4b] tracking-wide shadow-sm"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Free for solo educators
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.05 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-[#2c1a0e] leading-[1.05] tracking-tight"
                >
                    Teaching tools
                    <br />
                    <span className="bg-gradient-to-r from-[#8b5e3c] via-[#c47d3e] to-[#8b5e3c] bg-clip-text text-transparent">
                        that get out of the way
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.15 }}
                    className="text-lg sm:text-xl text-[#7b5c4b] max-w-2xl mx-auto leading-relaxed"
                >
                    Tutora handles attendance, fees, reminders, and class logs —
                    so you can focus on teaching.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.22 }}
                    className="flex flex-col sm:flex-row justify-center gap-3"
                >
                    <motion.button
                        whileHover={{ scale: 1.04, boxShadow: "0 10px 30px rgba(44,26,14,0.20)" }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate(user ? "/main" : "/login")}
                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#2c1a0e] text-white font-semibold text-base shadow-lg transition-colors hover:bg-[#3e2510] cursor-pointer"
                    >
                        <Sparkles className="w-4 h-4" />
                        {user ? "Go to Dashboard" : "Get Started Free"}
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-2 border-[#ddb892] bg-white/60 backdrop-blur-sm text-[#4a3a2c] font-semibold text-base hover:bg-[#fdf0e3] transition-colors cursor-pointer shadow-sm"
                    >
                        <Play className="w-4 h-4" />
                        Watch Demo
                    </motion.button>
                </motion.div>
            </div>

            {/* Scroll cue */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
            >
                <span className="text-xs text-[#b0998a] tracking-widest uppercase">scroll</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    className="w-px h-8 bg-gradient-to-b from-[#b0998a] to-transparent"
                />
            </motion.div>
        </section>
    );
};

export default Hero;
