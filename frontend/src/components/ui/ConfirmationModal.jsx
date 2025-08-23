import { motion } from "framer-motion";

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-[#f8ede3] rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <p className="text-lg text-[#4a3a2c] mb-4">{message}</p>
        <div className="flex justify-end gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#4a3a2c] bg-[#e0c4a8] rounded-lg hover:bg-[#d7b48f] transition"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-[#FF3B30] rounded-lg hover:bg-[#E5352A] transition"
          >
            Confirm
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfirmationModal;
