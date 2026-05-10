import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { Loader2, Clock, BookOpen, TrendingUp, ArrowRight, CalendarCheck, Wallet } from "lucide-react";

// ── Ring chart ────────────────────────────────────────────────────────────────
const ringColor = (p) => p >= 75 ? "#22c55e" : p >= 50 ? "#f59e0b" : "#ef4444";

const AttRing = ({ pct, size = 120, trackColor = "#f0e4d5" }) => {
    const c   = size / 2;
    const r   = size * 0.38;
    const sw  = size * 0.085;
    const circ = 2 * Math.PI * r;
    const color = ringColor(pct);
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={c} cy={c} r={r} fill="none" stroke={trackColor} strokeWidth={sw} />
                <motion.circle
                    cx={c} cy={c} r={r} fill="none"
                    stroke={color} strokeWidth={sw} strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-extrabold leading-none" style={{ fontSize: size * 0.22, color }}>{pct}%</span>
                <span className="text-[#9b8778] leading-none mt-0.5" style={{ fontSize: size * 0.095 }}>attendance</span>
            </div>
        </div>
    );
};

// ── SVG micro-line chart ──────────────────────────────────────────────────────
const SparkLine = ({ points, color = "#8b5e3c", w = 80, h = 32 }) => {
    if (!points?.length) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const xs = points.map((_, i) => (i / (points.length - 1)) * w);
    const ys = points.map(p => h - ((p - min) / range) * h * 0.85 - h * 0.05);
    const d  = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill={color} />
        </svg>
    );
};

// ── Last-7-days helper ────────────────────────────────────────────────────────
const getLast7 = (classDates) => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const d   = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const entry = classDates?.find(cd => cd.date === str);
        return {
            label  : ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()],
            isToday: i === 6,
            hasClass: !!entry,
            attended: entry?.attended ?? false,
        };
    });
};

// ── Stat chip in the header banner ───────────────────────────────────────────
const BannerStat = ({ label, value, icon: Icon, color }) => (
    <div className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur-sm min-w-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "33" }}>
            <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] text-white/55 leading-none">{label}</p>
            <p className="text-sm font-bold text-white leading-tight mt-0.5 truncate">{value}</p>
        </div>
    </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
const ParentDashboard = () => {
    const parentUser = useSelector(s => s.parentUser);
    const [dash, setDash]       = useState(null);
    const [attData, setAttData] = useState(null);
    const [tests, setTests]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        Promise.all([
            axiosInstance.get("parent/dashboard"),
            axiosInstance.get("parent/attendance"),
            axiosInstance.get("parent/tests"),
        ]).then(([d, a, t]) => {
            setDash(d.data);
            setAttData(a.data);
            setTests(t.data?.tests || []);
        }).catch(() => setError("Failed to load dashboard"))
          .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-7 h-7 text-[#8b5e3c] animate-spin" />
            <p className="text-sm text-[#9b8778]">Loading…</p>
        </div>
    );
    if (error) return <p className="text-center py-12 text-sm text-red-500">{error}</p>;

    const { student, overallAttendancePct, currentMonthFee, nextClass, upcomingTests } = dash;
    const feePaid    = currentMonthFee?.paid ?? false;
    const firstSubj  = attData?.subjects?.[0];
    const last7      = getLast7(firstSubj?.classDates);

    // This-month stats
    const now          = new Date();
    const thisMonthPfx = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const thisMonth    = (firstSubj?.classDates || []).filter(d => d.date.startsWith(thisMonthPfx));
    const presentCount = thisMonth.filter(d => d.attended).length;
    const absentCount  = thisMonth.filter(d => !d.attended).length;

    // Avg exam score
    const appeared = tests.filter(t => t.appeared && t.maxMarks > 0);
    const avgScore = appeared.length
        ? Math.round(appeared.reduce((s, t) => s + (t.marks / t.maxMarks) * 100, 0) / appeared.length)
        : null;
    const scorePoints = appeared.slice(-8).map(t => Math.round((t.marks / t.maxMarks) * 100));

    return (
        <div className="px-4 py-5 md:px-6 md:py-6 max-w-6xl mx-auto space-y-5 md:space-y-6">

            {/* ────────────────── Banner ────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-[#2c1a0e] via-[#4a2c1a] to-[#8b5e3c] rounded-2xl md:rounded-3xl overflow-hidden"
            >
                {/* bg decoration */}
                <div className="absolute -top-14 -right-14 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none" />

                <div className="relative px-5 py-5 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center gap-5">
                    {/* Student info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
                            <span className="text-2xl md:text-3xl font-extrabold text-white">
                                {student.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight truncate">
                                {student.name}
                            </p>
                            <p className="text-xs text-white/55 mt-0.5">
                                Grade {student.grade} · {student.school_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {student.batchName && (
                                    <span className="text-[10px] bg-white/15 text-white/90 font-semibold px-2.5 py-0.5 rounded-full">
                                        {student.batchName}
                                    </span>
                                )}
                                <span className="text-[10px] bg-white/15 text-white/90 font-semibold px-2.5 py-0.5 rounded-full">
                                    {parentUser?.relation === 'mom' ? 'Mother' : 'Father'} · {parentUser?.instituteName}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stat chips — desktop */}
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <BannerStat
                            label="Attendance"
                            value={`${overallAttendancePct}%`}
                            icon={CalendarCheck}
                            color={ringColor(overallAttendancePct)}
                        />
                        <BannerStat
                            label="Fee Status"
                            value={feePaid ? "Paid" : "Due"}
                            icon={Wallet}
                            color={feePaid ? "#22c55e" : "#ef4444"}
                        />
                        {avgScore !== null && (
                            <BannerStat
                                label="Avg Score"
                                value={`${avgScore}%`}
                                icon={TrendingUp}
                                color="#f59e0b"
                            />
                        )}
                    </div>

                    {/* Mobile: attendance bar */}
                    <div className="md:hidden flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${overallAttendancePct}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ background: ringColor(overallAttendancePct) }}
                            />
                        </div>
                        <span className="text-sm font-bold text-white shrink-0">{overallAttendancePct}%</span>
                    </div>
                </div>
            </motion.div>

            {/* ────────────────── Body Grid ────────────────── */}
            <div className="flex flex-col md:grid md:grid-cols-3 gap-5 md:gap-6">

                {/* ── Left col (2/3) ── */}
                <div className="md:col-span-2 space-y-5 md:space-y-6">

                    {/* Attendance card */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="bg-white rounded-2xl border border-[#e8d5c0] shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e4d5]">
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="w-4 h-4 text-[#8b5e3c]" />
                                <p className="text-sm font-bold text-[#2c1a0e]">Attendance</p>
                            </div>
                            <Link to="/parent/attendance"
                                className="flex items-center gap-1 text-xs text-[#8b5e3c] font-semibold hover:underline">
                                View all <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="p-5">
                            {/* Desktop: three-column layout */}
                            <div className="hidden md:grid md:grid-cols-3 gap-5 items-center">

                                {/* Col 1: 7-day strip */}
                                <div>
                                    <p className="text-[10px] font-bold text-[#9b8778] uppercase tracking-widest mb-3">
                                        Last 7 Days{firstSubj ? ` · ${firstSubj.subjectName}` : ""}
                                    </p>
                                    <div className="flex gap-1.5">
                                        {last7.map((d, i) => (
                                            <div key={i} className="flex flex-col items-center gap-1.5">
                                                <span className={`text-[10px] font-semibold ${d.isToday ? "text-[#2c1a0e]" : "text-[#b0998a]"}`}>
                                                    {d.label}
                                                </span>
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors
                                                    ${d.hasClass
                                                        ? d.attended
                                                            ? "bg-green-500 text-white"
                                                            : "bg-red-400 text-white"
                                                        : d.isToday
                                                            ? "bg-[#2c1a0e] text-white ring-2 ring-[#8b5e3c] ring-offset-1"
                                                            : "bg-[#f0e4d5] text-[#b0998a]"
                                                    }`}
                                                >
                                                    {d.hasClass ? (d.attended ? "✓" : "✗") : d.isToday ? "•" : ""}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Col 2: Ring */}
                                <div className="flex flex-col items-center gap-1">
                                    <AttRing pct={overallAttendancePct} size={120} />
                                </div>

                                {/* Col 3: Present / Absent */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-[#9b8778] uppercase tracking-widest">
                                        This Month
                                    </p>
                                    <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-600">
                                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-green-700 leading-none">{presentCount}</p>
                                            <p className="text-xs text-green-600 mt-0.5">Present</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-red-50 rounded-xl px-4 py-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-red-500">
                                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-red-500 leading-none">{absentCount}</p>
                                            <p className="text-xs text-red-400 mt-0.5">Absent</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile: stacked layout */}
                            <div className="md:hidden space-y-4">
                                <p className="text-[10px] font-bold text-[#9b8778] uppercase tracking-widest">
                                    Last 7 Days{firstSubj ? ` · ${firstSubj.subjectName}` : ""}
                                </p>
                                <div className="flex gap-2 justify-between">
                                    {last7.map((d, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            <span className={`text-[10px] font-semibold ${d.isToday ? "text-[#2c1a0e]" : "text-[#b0998a]"}`}>
                                                {d.label}
                                            </span>
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold
                                                ${d.hasClass
                                                    ? d.attended ? "bg-green-500 text-white" : "bg-red-400 text-white"
                                                    : d.isToday ? "bg-[#2c1a0e] text-white ring-2 ring-[#8b5e3c] ring-offset-1" : "bg-[#f0e4d5] text-[#b0998a]"
                                                }`}>
                                                {d.hasClass ? (d.attended ? "✓" : "✗") : d.isToday ? "•" : ""}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 bg-green-50 rounded-xl px-3 py-2.5">
                                        <p className="text-lg font-bold text-green-700 leading-none">{presentCount}</p>
                                        <p className="text-xs text-green-600">Present</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-red-50 rounded-xl px-3 py-2.5">
                                        <p className="text-lg font-bold text-red-500 leading-none">{absentCount}</p>
                                        <p className="text-xs text-red-400">Absent</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Test performance card */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.14 }}
                        className="bg-white rounded-2xl border border-[#e8d5c0] shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e4d5]">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#8b5e3c]" />
                                <p className="text-sm font-bold text-[#2c1a0e]">Test Performance</p>
                            </div>
                            <Link to="/parent/tests"
                                className="flex items-center gap-1 text-xs text-[#8b5e3c] font-semibold hover:underline">
                                View all <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="p-5">
                            {tests.length > 0 ? (
                                <div className="flex flex-col md:flex-row gap-5 md:items-center">

                                    {/* Avg score stat (desktop) */}
                                    {avgScore !== null && (
                                        <div className="hidden md:flex flex-col items-center justify-center bg-[#faf6f1] rounded-2xl px-6 py-4 shrink-0 border border-[#f0e4d5] min-w-[120px]">
                                            <p className="text-[10px] font-bold text-[#9b8778] uppercase tracking-widest mb-1">Avg Score</p>
                                            <p className="text-4xl font-extrabold leading-none" style={{ color: ringColor(avgScore) }}>
                                                {avgScore}
                                                <span className="text-xl">%</span>
                                            </p>
                                            <div className="mt-2">
                                                <SparkLine points={scorePoints} color={ringColor(avgScore)} w={80} h={28} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Bar chart */}
                                    <div className="flex-1">
                                        <div className="flex items-end gap-2">
                                            {[...tests].reverse().slice(0, 7).reverse().map((t, i) => {
                                                const pct   = t.appeared && t.maxMarks > 0 ? Math.round((t.marks / t.maxMarks) * 100) : 0;
                                                const color = pct >= 60 ? "#22c55e" : pct >= 33 ? "#f59e0b" : "#ef4444";
                                                const barH  = Math.max(Math.round(pct * 88 / 100), 4);
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative min-w-0">
                                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2c1a0e] text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 transition-opacity">
                                                            {t.appeared ? `${t.marks}/${t.maxMarks}` : "Absent"}
                                                        </div>
                                                        <div className="flex items-end w-full" style={{ height: 88 }}>
                                                            <motion.div
                                                                className="w-full rounded-t-lg"
                                                                style={{ background: color }}
                                                                initial={{ height: 0 }}
                                                                animate={{ height: barH }}
                                                                transition={{ duration: 0.6, delay: 0.3 + i * 0.07, ease: "easeOut" }}
                                                            />
                                                        </div>
                                                        <span className="text-[9px] text-[#b0998a] truncate w-full text-center leading-tight">
                                                            {t.testName?.split(' ').slice(0, 2).join(' ')}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#f0e4d5]">
                                            {[["#22c55e","≥ 60%"],["#f59e0b","33–59%"],["#ef4444","< 33%"]].map(([c, l]) => (
                                                <span key={l} className="flex items-center gap-1.5 text-[10px] text-[#9b8778]">
                                                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />
                                                    {l}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-[#9b8778] text-center py-6">No completed tests yet.</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* ── Right col (1/3) ── */}
                <div className="space-y-4 md:space-y-5">

                    {/* Fee card */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl border border-[#e8d5c0] shadow-sm overflow-hidden"
                    >
                        <div className="px-4 py-3.5 border-b border-[#f0e4d5] flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-[#8b5e3c]" />
                            <p className="text-sm font-bold text-[#2c1a0e]">Fee Reminder</p>
                        </div>
                        <Link to="/parent/fees" className="block group">
                            {currentMonthFee ? (
                                <>
                                    <div className={`h-1 w-full ${feePaid ? "bg-green-500" : "bg-red-500"}`} />
                                    <div className="px-4 py-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="text-xs text-[#9b8778]">Monthly Tuition</p>
                                                {feePaid && currentMonthFee.paid_at && (
                                                    <p className="text-[10px] text-[#b0998a] mt-0.5">
                                                        Paid {new Date(currentMonthFee.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${feePaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                                {feePaid ? "Paid" : "Due"}
                                            </span>
                                        </div>
                                        <p className="text-3xl font-extrabold text-[#2c1a0e] tracking-tight">
                                            ₹{currentMonthFee.amount?.toLocaleString('en-IN')}
                                        </p>
                                        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#8b5e3c] font-semibold group-hover:gap-2.5 transition-all">
                                            View fee history <ArrowRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-[#9b8778] px-4 py-4">No record this month</p>
                            )}
                        </Link>
                    </motion.div>

                    {/* Next class */}
                    {nextClass && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.16 }}
                        >
                            <Link
                                to="/parent/schedule"
                                className="flex items-center gap-3 bg-white rounded-2xl border border-[#e8d5c0] px-4 py-4 shadow-sm hover:border-[#d4b896] transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#f5ede3] flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-[#8b5e3c]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-[#9b8778] uppercase tracking-wider mb-0.5">Next Class</p>
                                    <p className="text-sm font-semibold text-[#2c1a0e] truncate">{nextClass.subjectName}</p>
                                    <p className="text-xs text-[#9b8778]">{nextClass.day} · {nextClass.time}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#d4b896] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </motion.div>
                    )}

                    {/* Upcoming tests */}
                    {upcomingTests?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22 }}
                            className="bg-white rounded-2xl border border-[#e8d5c0] shadow-sm overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f0e4d5]">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-[#8b5e3c]" />
                                    <p className="text-sm font-bold text-[#2c1a0e]">Upcoming Tests</p>
                                </div>
                                <Link to="/parent/tests"
                                    className="flex items-center gap-1 text-xs text-[#8b5e3c] font-semibold hover:underline">
                                    All <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="divide-y divide-[#f0e4d5]">
                                {upcomingTests.map((test, i) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                                        <div className="w-8 h-8 rounded-xl bg-[#f5ede3] flex items-center justify-center shrink-0">
                                            <BookOpen className="w-3.5 h-3.5 text-[#8b5e3c]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-[#2c1a0e] truncate">{test.testName}</p>
                                            <p className="text-[10px] text-[#9b8778] truncate">{test.subjectName}</p>
                                        </div>
                                        <span className="text-[10px] font-semibold text-[#7b5c4b] bg-[#f5ede3] px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">
                                            {new Date(test.testDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
