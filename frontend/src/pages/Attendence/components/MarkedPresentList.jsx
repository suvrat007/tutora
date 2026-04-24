import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const MarkedPresentList = ({ markedPresentStudents, batchName, subjectName, date }) => {
    const listVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: "easeOut", delay: i * 0.05 },
        }),
    };

    return (
        <div className="bg-[#f8ede3] p-4 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] w-full h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#e6c8a8]">
                <h2 className="font-bold text-base text-[#34C759]">Already Marked Present</h2>
                <span className="text-xs text-[#7b5c4b] font-medium">{markedPresentStudents.length} students</span>
            </div>

            <div className="flex-1 overflow-y-auto">
                {markedPresentStudents.length > 0 ? (
                    <AnimatePresence>
                        {markedPresentStudents.map((s, i) => (
                            <motion.div
                                key={s._id}
                                custom={i}
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                                className="border border-[#34C759] bg-[#e6f4ea] px-3 py-2.5 rounded-xl mb-2 flex justify-between items-center"
                            >
                                <span className="text-sm text-[#5a4a3c]">{i + 1}. {s.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#7b5c4b]">{s.time}</span>
                                    <div className="w-6 h-6 bg-[#34C759] text-white rounded-full flex items-center justify-center">
                                        <FaCheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#7b5c4b] gap-2 py-4">
                        <FaCheckCircle className="w-8 h-8 text-[#c8e6c9]" />
                        <p className="text-xs text-center">
                            {batchName && subjectName && date
                                ? "No students marked present for this date"
                                : "Search for a batch and date first"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarkedPresentList;
