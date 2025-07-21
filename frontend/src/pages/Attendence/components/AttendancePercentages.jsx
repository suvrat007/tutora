import useAttendanceSummary from "@/pages/Attendence/hooks/useAttendanceSummary.js";
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar } from "react-icons/fi";
import { Loader2 } from "lucide-react";

const AttendancePercentages = ({ attendance, batchName, setBatchName, subjectName, setSubjectName, batches }) => {
    const { summary, loading, error } = useAttendanceSummary(batchName, subjectName, batches);
    const selectedBatch = batches.find((b) => b.name === batchName);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeInOut", delay: i * 0.1 },
        }),
    };

    const placeholderVariants = {
        pulse: {
            scale: [1, 1.1, 1],
            transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        },
    };

    const circleVariants = {
        initial: (percentage) => ({
            strokeDashoffset: ((100 - percentage) / 100) * 113,
        }),
        animate: (percentage) => ({
            strokeDashoffset: ((100 - percentage) / 100) * 113,
            transition: { duration: 0.8, ease: "easeInOut" },
        }),
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-[#f8ede3] p-4 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] w-full h-[25em] sm:h-full overflow-hidden"
        >
            <div className="h-full flex flex-col">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-[#5a4a3c]">Attendance Summary</h2>
                    <div className="flex gap-2">
                        <select
                            value={batchName}
                            onChange={(e) => {
                                setBatchName(e.target.value);
                                setSubjectName("");
                            }}
                            className="border border-[#e6c8a8] p-2 rounded-md text-sm text-[#5a4a3c] bg-[#f8ede3] focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
                        >
                            <option value="">Select Batch</option>
                            {batches.map((b) => (
                                <option key={b._id} value={b.name}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            className="border border-[#e6c8a8] p-2 rounded-md text-sm text-[#5a4a3c] bg-[#f8ede3] focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
                            disabled={!batchName}
                        >
                            <option value="">Select Subject</option>
                            {selectedBatch?.subject.map((s) => (
                                <option key={s._id} value={s.name}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex h-full item-center justify-center overflow-y-auto">
                    {loading ? (
                        <motion.div
                            variants={placeholderVariants}
                            animate="pulse"
                            className="flex flex-col items-center justify-center h-full text-[#7b5c4b]"
                        >
                            <Loader2 className="w-10 h-10 animate-spin text-[#e0c4a8] mb-3" />
                            <p className="text-sm">Loading attendance summary...</p>
                        </motion.div>
                    ) : error ? (
                        <p className="text-red-600 text-sm text-center mt-4">{error}</p>
                    ) : !batchName || !subjectName ? (
                        <motion.div
                            variants={placeholderVariants}
                            animate="pulse"
                            className="flex flex-col items-center justify-center h-[90%] w-[90%] text-[#7b5c4b]"
                        >
                            <FiCalendar className="w-12 h-12 text-[#e0c4a8] mb-3" />
                            <p className="text-sm text-center">Select a batch and subject to view attendance summary!</p>
                        </motion.div>
                    ) : summary.length === 0 ? (
                        <motion.div
                            variants={placeholderVariants}
                            animate="pulse"
                            className="flex flex-col items-center justify-center h-full text-[#7b5c4b]"
                        >
                            <svg className="w-12 h-12 mb-3" viewBox="0 0 40 40">
                                <circle
                                    cx="20"
                                    cy="20"
                                    r="18"
                                    fill="none"
                                    stroke="#e6c8a8"
                                    strokeWidth="4"
                                />
                                <circle
                                    cx="20"
                                    cy="20"
                                    r="18"
                                    fill="none"
                                    stroke="#d8bca0"
                                    strokeWidth="4"
                                    strokeDasharray="113"
                                    strokeDashoffset="0"
                                    transform="rotate(-90 20 20)"
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from="0 20 20"
                                        to="360 20 20"
                                        dur="2s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                                <text
                                    x="50%"
                                    y="50%"
                                    dominantBaseline="middle"
                                    textAnchor="middle"
                                    className="text-[.6em]"
                                    fill="#5a4a3c"
                                >
                                    0%
                                </text>
                            </svg>
                            <p className="text-sm text-center">No attendance data found for selected batch and subject</p>
                        </motion.div>
                    ) : (
                        <div className="mt-2 overflow-x-auto">
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
                                <AnimatePresence>
                                    {summary.map((student, index) =>
                                        student.subjects.map((subj) => {
                                            const percentage = subj.percentage;
                                            const strokeDasharray = 113;

                                            return (
                                                <motion.div
                                                    key={`${student.studentId}-${subj.subjectId}`}
                                                    custom={index}
                                                    variants={cardVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="bg-[#f8ede3] h-[7em] p-2 rounded-xl shadow-md w-[8.5rem] flex flex-col items-center hover:shadow-lg transition-all duration-300"
                                                >
                                                    <h3 className="text-sm font-semibold text-center mb-2 text-[#5a4a3c]">{student.studentName}</h3>
                                                    <div className="flex gap-2">
                                                        <svg className="w-16 h-16" viewBox="0 0 40 40">
                                                            <circle
                                                                cx="20"
                                                                cy="20"
                                                                r="18"
                                                                fill="none"
                                                                stroke="#e6c8a8"
                                                                strokeWidth="4"
                                                            />
                                                            <motion.circle
                                                                cx="20"
                                                                cy="20"
                                                                r="18"
                                                                fill="none"
                                                                stroke="#8b5e3c"
                                                                strokeWidth="4"
                                                                strokeDasharray={strokeDasharray}
                                                                strokeLinecap="round"
                                                                variants={circleVariants}
                                                                initial="initial"
                                                                animate="animate"
                                                                custom={percentage}
                                                                transform="rotate(-90 20 20)"
                                                                transition={{
                                                                    duration: 1.2,
                                                                    ease: "easeInOut"
                                                                }}
                                                            />
                                                            <text
                                                                x="50%"
                                                                y="50%"
                                                                dominantBaseline="middle"
                                                                textAnchor="middle"
                                                                className="text-[.6em]"
                                                                fill="#5a4a3c"
                                                            >
                                                                {percentage}%
                                                            </text>
                                                        </svg>
                                                        <div className="text-[.7em] text-[#7b5c4b] mt-2 text-center">
                                                            <p><strong>Attended:</strong> {subj.attended}</p>
                                                            <p><strong>Total:</strong> {subj.total}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AttendancePercentages;