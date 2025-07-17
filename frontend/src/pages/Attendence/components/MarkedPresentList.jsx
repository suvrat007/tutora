import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const MarkedPresentList = ({
                               markedPresentStudents,
                               batchName,
                               subjectName,
                               date
                           }) => {
    return (
        <div className="bg-white rounded-2xl p-4 text-text flex-1 overflow-y-auto border border-border">
            <div className="flex justify-between mb-4 items-center">
                <h2 className="font-bold text-lg text-success">Already Marked Present</h2>
                <div className="text-sm text-text-light">
                    {markedPresentStudents.length} students
                </div>
            </div>
            <AnimatePresence>
                {markedPresentStudents.length > 0 ? (
                    markedPresentStudents.map((s, i) => (
                        <motion.div
                            key={s._id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2, delay: i * 0.05 }}
                            className="border border-success/50 bg-success/10 p-3 rounded-md mb-2 flex justify-between items-center"
                        >
                            <span>{i + 1}. {s.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-text-light">{s.time}</span>
                                <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center">
                                    ✓
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-text-light mt-8"
                    >
                        {batchName && subjectName && date
                            ? "No students marked present for this date"
                            : "Please search for students first"}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarkedPresentList;