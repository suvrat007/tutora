import { useState } from "react";
import { motion } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";
import { AlertTriangle } from "lucide-react";

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const ConfirmationModal = ({ onClose, closeModal }) => {
    const [deleteStudents, setDeleteStudents] = useState(false);

    return (
        <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <div className="relative w-full max-w-md bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6c8a8] bg-[#f0d9c0]">
                    <h2 className="text-base font-bold text-[#5a4a3c]">Delete Batch</h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={closeModal}
                        className="text-[#a08a78] hover:text-red-500 transition"
                    >
                        <AiOutlineClose size={20} />
                    </motion.button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-[#7b5c4b]">
                        This will permanently delete the batch and all its class logs. This action cannot be undone.
                    </p>

                    {/* Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer select-none group">
                        <div className="relative mt-0.5 shrink-0">
                            <input
                                type="checkbox"
                                checked={deleteStudents}
                                onChange={e => setDeleteStudents(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-5 h-5 rounded border-2 border-[#c4a882] bg-white peer-checked:bg-red-500 peer-checked:border-red-500 transition-colors flex items-center justify-center">
                                {deleteStudents && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="text-sm text-[#5a4a3c] font-medium leading-snug">
                            Also delete all enrolled students from the database
                        </span>
                    </label>

                    {deleteStudents && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700">
                                All student records for this batch will be permanently deleted from the database. This cannot be recovered.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 pb-5">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-[#5a4a3c] bg-[#e0c4a8] rounded-lg hover:bg-[#d7b48f] transition"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onClose(deleteStudents)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                    >
                        Delete Batch
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default ConfirmationModal;
