import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MONTHS = 3;

const getCalendarMonths = () => {
    const result = [];
    const today = new Date();
    for (let m = MONTHS - 1; m >= 0; m--) {
        const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const year = d.getFullYear();
        const month = d.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDow = new Date(year, month, 1).getDay();
        const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        const dates = [];
        for (let day = 1; day <= daysInMonth; day++) {
            dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        }
        result.push({ label, startDow, dates });
    }
    return result;
};

const ParentAttendancePage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(0);
    const calendarMonths = getCalendarMonths();
    // Start on the most recent (last) month
    const [monthIdx, setMonthIdx] = useState(calendarMonths.length - 1);
    const direction = useRef(0); // 1 = forward, -1 = backward

    const goNext = () => {
        if (monthIdx >= calendarMonths.length - 1) return;
        direction.current = 1;
        setMonthIdx(i => i + 1);
    };
    const goPrev = () => {
        if (monthIdx <= 0) return;
        direction.current = -1;
        setMonthIdx(i => i - 1);
    };

    useEffect(() => {
        axiosInstance.get("parent/attendance")
            .then(res => setData(res.data))
            .catch(() => setError("Failed to load attendance"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-[#8b5e3c] animate-spin" />
        </div>
    );

    if (error) return <p className="text-center py-10 text-sm text-red-500">{error}</p>;

    const subjects = data?.subjects || [];

    if (subjects.length === 0) return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h2 className="text-lg font-bold text-[#2c1a0e] mb-1">Attendance</h2>
            <p className="text-sm text-[#9b8778]">No attendance data found.</p>
        </div>
    );

    const subj = subjects[selectedSubject];
    // Build a lookup: date → { status, time }
    const classDateMap = {};
    (subj.classDates || []).forEach(cd => {
        classDateMap[cd.date] = { status: cd.attended ? 'attended' : 'absent', time: cd.time || null };
    });

    const sortedClassDates = [...(subj.classDates || [])].sort((a, b) => b.date.localeCompare(a.date));
    const absentDates = sortedClassDates.filter(cd => !cd.attended);

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h2 className="text-lg font-bold text-[#2c1a0e] mb-4">Attendance</h2>

            {/* Subject tabs */}
            {subjects.length > 1 && (
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
                    {subjects.map((s, i) => (
                        <button
                            key={s.subjectId}
                            onClick={() => setSelectedSubject(i)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                selectedSubject === i
                                    ? "bg-[#2c1a0e] text-white"
                                    : "bg-white border border-[#e8d5c0] text-[#7b5c4b] hover:bg-[#f5ede3]"
                            }`}
                        >
                            {s.subjectName}
                        </button>
                    ))}
                </div>
            )}

            {/* Subject attendance summary */}
            <div className="bg-white border border-[#e8d5c0] rounded-2xl p-5 mb-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-[#2c1a0e]">{subj.subjectName}</p>
                    <span className={`text-2xl font-bold ${subj.percentage >= 75 ? "text-green-600" : subj.percentage >= 50 ? "text-amber-500" : "text-red-500"}`}>
                        {subj.percentage}%
                    </span>
                </div>
                <div className="h-2 bg-[#f0e4d5] rounded-full overflow-hidden mb-2">
                    <div
                        className={`h-full rounded-full ${subj.percentage >= 75 ? "bg-green-500" : subj.percentage >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${subj.percentage}%` }}
                    />
                </div>
                <p className="text-xs text-[#9b8778]">
                    {subj.attended} attended out of {subj.total} classes
                </p>
            </div>

            {/* Calendar carousel */}
            <div className="mb-5">
                {/* Header row: prev arrow / month label / next arrow */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <button
                        onClick={goPrev}
                        disabled={monthIdx === 0}
                        className="p-1.5 rounded-lg hover:bg-[#f5ede3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-5 h-5 text-[#7b5c4b]" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#2c1a0e]">
                            {calendarMonths[monthIdx].label}
                        </span>
                        <span className="text-xs text-[#b0998a]">
                            {monthIdx + 1} / {calendarMonths.length}
                        </span>
                    </div>

                    <button
                        onClick={goNext}
                        disabled={monthIdx === calendarMonths.length - 1}
                        className="p-1.5 rounded-lg hover:bg-[#f5ede3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Next month"
                    >
                        <ChevronRight className="w-5 h-5 text-[#7b5c4b]" />
                    </button>
                </div>

                {/* Sliding month card */}
                <div className="overflow-hidden rounded-2xl">
                    <AnimatePresence mode="wait" initial={false} custom={direction.current}>
                        <motion.div
                            key={monthIdx}
                            custom={direction.current}
                            variants={{
                                enter: (dir) => ({ x: dir >= 0 ? '100%' : '-100%', opacity: 0 }),
                                center: { x: 0, opacity: 1 },
                                exit: (dir) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 0 }),
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="bg-white border border-[#e8d5c0] rounded-2xl p-4 shadow-sm"
                        >
                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                    <span key={d} className="text-[10px] text-center text-[#b0998a] font-medium">{d}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: calendarMonths[monthIdx].startDow }).map((_, i) => <div key={`e${i}`} />)}
                                {calendarMonths[monthIdx].dates.map(dateStr => {
                                    const entry  = classDateMap[dateStr];
                                    const status = entry?.status;
                                    const time   = entry?.time;
                                    const dayNum = parseInt(dateStr.split('-')[2]);
                                    const tooltip = status === 'attended'
                                        ? `${dateStr}: Present${time ? ` · ${time}` : ''}`
                                        : status === 'absent'
                                            ? `${dateStr}: Absent`
                                            : dateStr;
                                    return (
                                        <div
                                            key={dateStr}
                                            title={tooltip}
                                            className={`aspect-square rounded-md md:rounded-lg flex items-center justify-center text-[10px] font-semibold ${
                                                status === 'attended'
                                                    ? "bg-green-100/70 border border-green-600 text-green-800"
                                                    : status === 'absent'
                                                        ? "bg-red-100/70 border border-red-500 text-red-700"
                                                        : "text-[#b0998a]"
                                            }`}
                                        >
                                            {dayNum}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dot indicators */}
                <div className="flex justify-center gap-1.5 mt-3">
                    {calendarMonths.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                direction.current = i > monthIdx ? 1 : -1;
                                setMonthIdx(i);
                            }}
                            className={`rounded-full transition-all ${
                                i === monthIdx
                                    ? "w-4 h-1.5 bg-[#2c1a0e]"
                                    : "w-1.5 h-1.5 bg-[#d4b896] hover:bg-[#7b5c4b]"
                            }`}
                            aria-label={calendarMonths[i].label}
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-[#9b8778] mb-5">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-600 inline-block" /> Present</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-500 inline-block" /> Absent</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#f5ede3] inline-block" /> No class</span>
            </div>

            {/* Class log */}
            {sortedClassDates.length > 0 && (
                <div className="bg-white border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-[#f0e4d5] flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#7b5c4b]">Class Log</p>
                        <div className="flex items-center gap-3 text-[10px] text-[#9b8778]">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-sm bg-green-100 border border-green-600 inline-block" /> Present
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-sm bg-red-100 border border-red-500 inline-block" /> Absent
                            </span>
                        </div>
                    </div>
                    <div className="divide-y divide-[#f5ede3] max-h-72 overflow-y-auto">
                        {sortedClassDates.map(cd => (
                            <div key={cd.date} className="flex items-center justify-between px-4 py-2.5">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${cd.attended ? 'bg-green-500' : 'bg-red-400'}`} />
                                    <p className="text-xs text-[#2c1a0e] font-medium">
                                        {new Date(cd.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                {cd.attended && cd.time ? (
                                    <span className="text-xs font-semibold text-[#8b5e3c] bg-[#f5ede3] px-2.5 py-1 rounded-lg shrink-0">
                                        {cd.time}
                                    </span>
                                ) : cd.attended ? (
                                    <span className="text-[10px] text-[#b0998a] shrink-0">Present</span>
                                ) : (
                                    <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg shrink-0">Absent</span>
                                )}
                            </div>
                        ))}
                    </div>
                    {absentDates.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-[#f0e4d5] bg-[#faf6f1]">
                            <p className="text-[10px] text-[#9b8778]">
                                {absentDates.length} class{absentDates.length > 1 ? 'es' : ''} missed
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ParentAttendancePage;
