import React from "react";
import { FaCheckCircle, FaUserGraduate } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

export const StudentList = ({
                                students,
                                presentIds,
                                loading,
                                markedPresentStudents,
                                togglePresent,
                                selectAll,
                                clearAll,
                                markAllPreviouslyPresent,
                                handleSubmit,
                                isValidDateTime,
                                batchName,
                                subjectName,
                                date,
                            }) => {
    const isFormValid = batchName && subjectName && date && isValidDateTime();

    const listVariants = {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-[#f8ede3] p-4 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] w-full h-full flex-1 flex flex-col overflow-hidden"
        >
            <div className="flex justify-between pb-2 items-center flex-wrap gap-2">
                <h2 className="font-bold text-lg text-[#5a4a3c]">Mark Attendance</h2>
                <div className="text-sm text-[#7b5c4b]">
                    {presentIds.size} of {students.length} marked present
                </div>
                <div className="flex gap-2 flex-wrap">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={selectAll}
                        className="bg-[#e0c4a8] text-[#5a4a3c] px-3 py-1 rounded-md text-sm hover:bg-[#d8bca0] transition-all duration-300 disabled:opacity-50 shadow-md"
                        disabled={!students.length || loading}
                    >
                        Select All
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={markAllPreviouslyPresent}
                        className="bg-[#e0c4a8] text-[#5a4a3c] px-3 py-1 rounded-md text-sm hover:bg-[#d8bca0] transition-all duration-300 disabled:opacity-50 shadow-md"
                        disabled={!markedPresentStudents.length || loading}
                    >
                        Mark All Already Present
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearAll}
                        className="bg-[#e0c4a8] text-[#5a4a3c] px-3 py-1 rounded-md text-sm hover:bg-[#d8bca0] transition-all duration-300 disabled:opacity-50 shadow-md"
                        disabled={!presentIds.size || loading}
                    >
                        Clear All
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        className="bg-[#e0c4a8] text-[#5a4a3c] px-4 py-2 rounded-md text-sm hover:bg-[#d8bca0] transition-all duration-300 disabled:opacity-50 shadow-md"
                        disabled={loading || !isFormValid}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4 inline mr-2" />
                                Submitting...
                            </>
                        ) : presentIds.size === 0 ? (
                            "Mark All Absent"
                        ) : (
                            `Submit (${presentIds.size} Present)`
                        )}
                    </motion.button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto mt-2">
                {loading ? (
                    <motion.div
                        variants={placeholderVariants}
                        animate="pulse"
                        className="flex flex-col items-center justify-center h-full text-[#7b5c4b]"
                    >
                        <Loader2 className="w-12 h-12 animate-spin text-[#e0c4a8] mb-3" />
                        <p className="text-sm text-center">Loading students...</p>
                    </motion.div>
                ) : students.length > 0 ? (
                    <AnimatePresence>
                        {students.map((s, i) => (
                            <motion.div
                                key={s._id}
                                custom={i}
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                                className="border w-full border-[#e6c8a8] p-3 rounded-md mb-2 flex justify-between items-center hover:bg-[#f0d9c0] transition-all duration-300"
                            >
                                <span className="text-[#5a4a3c]">
                                    {i + 1}. {s.name}
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => togglePresent(s._id)}
                                    className={`w-8 h-8 border border-[#7b5c4b] rounded-full flex items-center justify-center transition-all duration-300 ${
                                        presentIds.has(s._id)
                                            ? "bg-[#34C759] text-white"
                                            : "bg-[#f8ede3] text-[#5a4a3c] hover:bg-[#f0d9c0]"
                                    }`}
                                    disabled={loading}
                                >
                                    {presentIds.has(s._id) ? <FaCheckCircle /> : ""}
                                </motion.button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <motion.div
                        variants={placeholderVariants}
                        animate="pulse"
                        className="flex flex-col items-center justify-center h-[60%] text-[#7b5c4b] w-[95%] mt-8"
                    >
                        <FaUserGraduate className="w-12 h-12 text-[#e0c4a8] mb-3" />
                        <p className="text-sm text-center">
                            {batchName && subjectName && date
                                ? "No students found for this batch and subject"
                                : "Please select batch, subject, and date first"}
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
