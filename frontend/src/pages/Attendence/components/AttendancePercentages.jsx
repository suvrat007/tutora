import { useSelector } from "react-redux";
import useAttendanceSummary from "@/pages/Attendence/hooks/useAttendanceSummary.js";
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar } from "react-icons/fi";
import { Loader2, Download } from "lucide-react";
import { exportToCSV } from "@/utilities/csvExport.js";

const AttendancePercentages = ({ batchName, subjectName, refreshTrigger }) => {
    const batches = useSelector(state => state.batches);
    const { summary, loading, error } = useAttendanceSummary(batchName, subjectName, batches, refreshTrigger);

    const circleVariants = {
        initial: (pct) => ({ strokeDashoffset: ((100 - pct) / 100) * 113 }),
        animate: (pct) => ({
            strokeDashoffset: ((100 - pct) / 100) * 113,
            transition: { duration: 0.8, ease: "easeInOut" },
        }),
    };

    return (
        <div className="bg-[#f8ede3] p-4 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex flex-col gap-3 h-full">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <h2 className="font-bold text-base text-[#5a4a3c]">Attendance Summary</h2>
                {summary.length > 0 && (
                    <button
                        onClick={() => {
                            const rows = summary.flatMap(student =>
                                student.subjects.map(subj => ({
                                    Student: student.studentName,
                                    Batch: batchName,
                                    Subject: subjectName,
                                    Attended: subj.attended,
                                    Total: subj.total,
                                    "Percentage (%)": subj.percentage,
                                }))
                            );
                            exportToCSV(rows, `attendance_${batchName}_${subjectName}.csv`);
                        }}
                        className="flex items-center gap-1 text-xs bg-[#e0c4a8] text-[#5a4a3c] px-2 py-1.5 rounded-lg hover:bg-[#d8bca0] transition-colors"
                    >
                        <Download className="w-3 h-3" /> CSV
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-[8rem]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#7b5c4b] gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-[#e0c4a8]" />
                        <p className="text-xs">Loading...</p>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-xs text-center mt-4">{error}</p>
                ) : summary.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#7b5c4b] gap-2 py-6">
                        <FiCalendar className="w-8 h-8 text-[#e0c4a8]" />
                        <p className="text-xs text-center">
                            {batchName && subjectName
                                ? `No data for ${batchName} / ${subjectName}`
                                : "No attendance data yet"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
                        <AnimatePresence>
                            {summary.map((student, index) =>
                                student.subjects.map((subj) => {
                                    const pct = subj.percentage;
                                    return (
                                        <motion.div
                                            key={`${student.studentId}-${subj.subjectId}`}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                                            className="bg-white border border-[#e6c8a8] p-3 rounded-2xl flex flex-col items-center gap-1 shadow-sm"
                                        >
                                            <p className="text-xs font-semibold text-[#5a4a3c] text-center leading-tight">{student.studentName}</p>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-12 h-12" viewBox="0 0 40 40">
                                                    <circle cx="20" cy="20" r="18" fill="none" stroke="#e6c8a8" strokeWidth="4" />
                                                    <motion.circle
                                                        cx="20" cy="20" r="18"
                                                        fill="none" stroke="#8b5e3c" strokeWidth="4"
                                                        strokeDasharray={113} strokeLinecap="round"
                                                        variants={circleVariants}
                                                        initial="initial" animate="animate" custom={pct}
                                                        transform="rotate(-90 20 20)"
                                                    />
                                                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="7" fill="#5a4a3c" fontWeight="600">
                                                        {pct}%
                                                    </text>
                                                </svg>
                                                <div className="text-[0.65rem] text-[#7b5c4b] leading-5">
                                                    <p><span className="font-semibold">{subj.attended}</span> / {subj.total}</p>
                                                    <p>classes</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendancePercentages;
