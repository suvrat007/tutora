import { AiOutlineClose } from "react-icons/ai";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const ConfirmationModal = ({ onClose, closeModal }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-border"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
                    <h2 className="text-lg font-bold text-text">Confirm Deletion</h2>
                    <button onClick={closeModal} className="text-text-light hover:text-error transition-colors duration-200">
                        <AiOutlineClose size={24} />
                    </button>
                </div>
                <div className="p-6 text-center">
                    <p className="text-text mb-6">Do you want to delete the data of enrolled students along with the batch?</p>
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="destructive"
                            onClick={() => onClose(true)}
                        >
                            Yes, Delete Everything
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onClose(false)}
                        >
                            No, Keep Students
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConfirmationModal;