import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const MarkedPresentList = ({ markedPresentStudents, batchName, subjectName, date }) => {
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
            <div className="flex justify-between mb-2 items-center">
                <h2 className="font-bold text-lg text-[#34C759]">Already Marked Present</h2>
                <div className="text-sm text-[#7b5c4b]">
                    {markedPresentStudents.length} students
                </div>
            </div>
            <div className="flex-1 overflow-y-auto mt-1">
                {markedPresentStudents.length > 0 ? (
                    <AnimatePresence>
                        {markedPresentStudents.map((s, i) => (
                            <motion.div
                                key={s._id}
                                custom={i}
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                                className="border w-full border-[#34C759] bg-[#e6f4ea] p-3 rounded-md mb-2 flex justify-between items-center hover:bg-[#d4e9d8] transition-all duration-300"
                            >
                                <span className="text-[#5a4a3c]">
                                    {i + 1}. {s.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[#7b5c4b]">{s.time}</span>
                                    <div className="w-8 h-8 bg-[#34C759] text-white rounded-full flex items-center justify-center">
                                        <FaCheckCircle />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <motion.div
                        variants={placeholderVariants}
                        animate="pulse"
                        className="flex flex-col items-center justify-center h-[70%] w-[95%] text-[#7b5c4b] mt-8"
                    >
                        <FaCheckCircle className="w-12 h-12 text-[#34C759] mb-3" />
                        <p className="text-sm text-center">
                            {batchName && subjectName && date
                                ? "No students marked present for this date"
                                : "Please search for students first"}
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default MarkedPresentList;
