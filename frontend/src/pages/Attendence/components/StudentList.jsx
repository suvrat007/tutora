import { FaCheckCircle, FaLock } from 'react-icons/fa';
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
    saving,
    readOnly,
    batchName,
    subjectName,
    date,
}) => {
    const listVariants = {
        hidden: { opacity: 0 },
        visible: (i) => ({
            opacity: 1,
            transition: { duration: 0.2, delay: i * 0.02 },
        }),
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-[#f8ede3] p-4 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] w-full h-full flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e6c8a8] mb-3 gap-3 flex-wrap">
                <div>
                    <h2 className="font-bold text-lg text-[#5a4a3c]">Mark Attendance</h2>
                    {!readOnly && students.length > 0 && (
                        <p className="text-xs text-[#7b5c4b] mt-0.5">
                            {presentIds.size} of {students.length} present
                        </p>
                    )}
                    {readOnly && students.length > 0 && (
                        <p className="text-xs text-[#7b5c4b] mt-0.5">{students.length} students</p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {saving && (
                        <span className="text-xs text-[#8b5e3c] flex items-center gap-1 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" /> Saving
                        </span>
                    )}
                    {!readOnly && (
                        <>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={selectAll}
                                disabled={!students.length || loading}
                                className="px-3 py-1.5 text-xs font-medium bg-[#e0c4a8] text-[#5a4a3c] rounded-lg hover:bg-[#d8bca0] disabled:opacity-40 transition-colors"
                            >
                                All
                            </motion.button>
                            {markedPresentStudents.length > 0 && (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={markAllPreviouslyPresent}
                                    disabled={loading}
                                    className="px-3 py-1.5 text-xs font-medium bg-[#e0c4a8] text-[#5a4a3c] rounded-lg hover:bg-[#d8bca0] disabled:opacity-40 transition-colors"
                                >
                                    Restore
                                </motion.button>
                            )}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={clearAll}
                                disabled={!presentIds.size || loading}
                                className="px-3 py-1.5 text-xs font-medium bg-[#e0c4a8] text-[#5a4a3c] rounded-lg hover:bg-[#d8bca0] disabled:opacity-40 transition-colors"
                            >
                                Clear
                            </motion.button>
                        </>
                    )}
                </div>
            </div>

            {/* Read-only notice */}
            {readOnly && students.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-[#7b5c4b] bg-[#f0d9c0] border border-[#e6c8a8] rounded-lg px-3 py-2 mb-3">
                    <FaLock className="w-3 h-3 shrink-0 text-[#8b5e3c]" />
                    <span>Select batch, subject and date above to mark attendance</span>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#7b5c4b] gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-[#e0c4a8]" />
                        <p className="text-sm">Loading students...</p>
                    </div>
                ) : students.length > 0 ? (
                    <AnimatePresence>
                        {students.map((s, i) => (
                            <motion.div
                                key={s._id}
                                custom={i}
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                                className={`border border-[#e6c8a8] p-3 rounded-xl mb-2 flex justify-between items-center transition-colors ${
                                    readOnly ? 'opacity-70' : 'hover:bg-[#f0d9c0] cursor-default'
                                }`}
                            >
                                <span className="text-sm text-[#5a4a3c]">{i + 1}. {s.name}</span>
                                {readOnly ? (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f0d9c0] border border-[#d8bca0]">
                                        <FaLock className="w-3 h-3 text-[#b09a86]" />
                                    </div>
                                ) : (
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => togglePresent(s._id)}
                                        disabled={loading}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 border ${
                                            presentIds.has(s._id)
                                                ? "bg-[#34C759] border-[#34C759] text-white"
                                                : "bg-white border-[#d8bca0] text-transparent hover:border-[#8b5e3c]"
                                        }`}
                                    >
                                        <FaCheckCircle className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#7b5c4b] gap-3 py-10">
                        {(batchName && subjectName && date) ? (
                            <p className="text-sm text-center">No students found for this selection</p>
                        ) : (
                            <>
                                <Loader2 className="w-8 h-8 animate-spin text-[#e0c4a8]" />
                                <p className="text-sm text-center">Loading students...</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
