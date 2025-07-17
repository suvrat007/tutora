import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

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
                         date
                     }) => {
    return (
        <div className="bg-white rounded-2xl p-4 text-text flex-1 overflow-y-auto border border-border">
            <div className="flex justify-between mb-4 items-center">
                <h2 className="font-bold text-lg">Mark Attendance</h2>
                <div className="text-sm text-text-light">
                    {presentIds.size} of {students.length} marked present
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <Button onClick={selectAll} size="sm" disabled={!students.length || loading}>Select All</Button>
                <Button onClick={markAllPreviouslyPresent} size="sm" variant="outline" disabled={!markedPresentStudents.length || loading}>Mark Previously Present</Button>
                <Button onClick={clearAll} size="sm" variant="destructive" disabled={!presentIds.size || loading}>Clear All</Button>
                <Button onClick={handleSubmit} size="sm" className="bg-success text-white" disabled={loading || !presentIds.size || !isValidDateTime()}>
                    {loading ? "Submitting..." : "Submit"}
                </Button>
            </div>

            <AnimatePresence>
                {students.length > 0 ? (
                    students.map((s, i) => (
                        <motion.div
                            key={s._id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2, delay: i * 0.05 }}
                            className="border border-border p-3 rounded-md mb-2 flex justify-between items-center hover:bg-background transition-colors"
                        >
                            <span>{i + 1}. {s.name}</span>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => togglePresent(s._id)}
                                className={`w-8 h-8 border rounded-full flex items-center justify-center transition-colors ${
                                    presentIds.has(s._id)
                                        ? "bg-success text-white border-success"
                                        : "bg-white text-text border-border hover:bg-background"
                                }`}
                                disabled={loading}
                            >
                                {presentIds.has(s._id) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>}
                            </motion.button>
                        </motion.div>
                    ))
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-text-light mt-8"
                    >
                        {batchName && subjectName && date
                            ? "No students found for this batch and subject"
                            : "Please select batch, subject, and date first"}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};