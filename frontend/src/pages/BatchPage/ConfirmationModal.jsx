import { motion } from "framer-motion";
import {AiOutlineClose} from "react-icons/ai";


const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const ConfirmationModal = ({ onClose, closeModal }) => {
    return (
        <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <div className="relative w-full max-w-3xl bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6c8a8] bg-[#f0d9c0]">
                    <h2 className="text-lg font-bold text-[#5a4a3c]">
                        Do you want to DELETE data of enrolled students?
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.1, color: "#FF3B30" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => closeModal()}
                        className="text-[#e0c4a8] hover:text-[#FF3B30] transition"
                    >
                        <AiOutlineClose size={24} />
                    </motion.button>
                </div>
                <div className="flex justify-around py-6">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#34C759] text-white px-4 py-2 rounded-lg hover:bg-[#2eb84c] transition"
                        onClick={() => onClose(true)}
                    >
                        Yes
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#e0c4a8] text-[#5a4a3c] px-4 py-2 rounded-lg hover:bg-[#d8bca0] transition"
                        onClick={() => onClose(false)}
                    >
                        No
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};
export default ConfirmationModal;