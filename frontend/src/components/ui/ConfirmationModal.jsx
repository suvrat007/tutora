import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const ConfirmationModal = ({ message, onConfirm, onCancel, isLoading = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-[#f8ede3] rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <p className="text-base text-[#4a3a2c] mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#4a3a2c] bg-[#e0c4a8] rounded-lg hover:bg-[#d7b48f] transition disabled:opacity-50"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#FF3B30] rounded-lg hover:bg-[#E5352A] transition disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirm
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfirmationModal;
