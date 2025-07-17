import React from "react";
import useAttendanceSummary from "@/pages/Attendence/hooks/useAttendanceSummary.js";
import { motion, AnimatePresence } from "framer-motion";

const AttendancePercentages = ({ batchName, setBatchName, subjectName, setSubjectName, batches }) => {
    const { summary, loading, error } = useAttendanceSummary(batchName, subjectName, batches);
    const selectedBatch = batches.find((b) => b.name === batchName);

    const inputStyles = "w-full border p-2 rounded-md bg-background border-border placeholder-text-light text-text focus:ring-primary focus:border-primary";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white p-6 rounded-2xl shadow-soft border border-border flex-1 h-auto"
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">Attendance Summary</h2>
                    <div className="flex gap-2">
                        <select
                            value={batchName}
                            onChange={(e) => {
                                setBatchName(e.target.value);
                                setSubjectName('');
                            }}
                            className={inputStyles}
                        >
                            <option value="">Select Batch</option>
                            {batches.map((b) => (
                                <option key={b._id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                        <select
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            className={inputStyles}
                            disabled={!batchName}
                        >
                            <option value="">Select Subject</option>
                            {selectedBatch?.subject.map((s) => (
                                <option key={s._id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-2 overflow-y-auto h-[10em]">
                    <AnimatePresence>
                        {loading ? (
                            <p className="text-text-light text-center mt-4">Loading summary...</p>
                        ) : error ? (
                            <p className="text-error text-center mt-4">{error}</p>
                        ) : batchName && subjectName ? (
                            summary.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {summary.map((student) =>
                                        student.subjects.map((subj) => {
                                            const percentage = subj.percentage;
                                            const strokeDasharray = 113;
                                            const strokeDashoffset = ((100 - percentage) / 100) * strokeDasharray;
                                            return (
                                                <motion.div
                                                    key={`${student.studentId}-${subj.subjectId}`}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-background p-3 rounded-xl shadow-soft flex flex-col items-center"
                                                >
                                                    <h3 className="text-sm font-semibold text-center mb-2">{student.studentName}</h3>
                                                    <svg className="w-16 h-16" viewBox="0 0 40 40">
                                                        <circle cx="20" cy="20" r="18" fill="none" stroke="#eee" strokeWidth="4" />
                                                        <motion.circle
                                                            cx="20" cy="20" r="18" fill="none" stroke="var(--primary)" strokeWidth="4"
                                                            strokeDasharray={strokeDasharray}
                                                            strokeDashoffset={strokeDashoffset}
                                                            transform="rotate(-90 20 20)"
                                                            initial={{ strokeDashoffset: strokeDasharray }}
                                                            animate={{ strokeDashoffset }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                        />
                                                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="text-xs font-bold" fill="var(--text)">{percentage}%</text>
                                                    </svg>
                                                    <div className="text-xs text-text-light mt-2 text-center">
                                                        <p><strong>Attended:</strong> {subj.attended}</p>
                                                        <p><strong>Total:</strong> {subj.total}</p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </div>
                            ) : (
                                <p className="text-text-light text-center mt-4">No attendance data found.</p>
                            )
                        ) : (
                            <p className="text-text-light text-center mt-4">Please select a batch and subject.</p>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
export default AttendancePercentages