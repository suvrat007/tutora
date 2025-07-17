
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays } from "lucide-react";
import ReminderModal from "@/pages/Dashboard/comps/P1/ReminderModal.jsx";
import toast from "react-hot-toast";
import {AiOutlinePlus} from "react-icons/ai";

const Callendar = () => {
  const [value, setValue] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  const handleSetReminder = () => {
    const today = new Date();
    const selected = new Date(value);

    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      return toast.error("Cannot set a reminder for a past date.");
    }

    setShowModal(true);
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 bg-gradient-to-br from-[#fef5e7] to-[#e7c6a5] rounded-2xl border border-[#ddb892] shadow-lg hover:shadow-xl transition-shadow duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full h-full flex flex-col justify-between"
      >
        {/* Heading */}
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-[#f7c7a3]"/>
          <h2 className="text-lg sm:text-xl font-semibold text-[#4a3a2c]">
            Set a Reminder
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-[#f4e3d0] to-[#e7c6a5] rounded-full"></div>
        </div>

        {/* Calendar */}
        <div
            className="flex-1 min-h-0 overflow-auto bg-[#f4e3d0]/80 backdrop-blur-sm rounded-xl border border-[#ddb892] p-4 shadow-sm">
          <Calendar
            onChange={setValue}
            value={value}
            className="react-calendar w-full text-sm text-[#4a3a2c]"
            tileClassName="hover:bg-[#e7c6a5] rounded-md transition-all duration-200"
          />
        </div>

        {/* Set Reminder Button */}
        <motion.button
            whileTap={{scale: 0.95}}
            whileHover={{scale: 1.03}}
            onClick={handleSetReminder}
            className="mt-4 w-full bg-gradient-to-r to-[#f4e3d0] from-[#e7c6a5] hover:from-[#f4e3d0]/80 hover:to-[#e7c6a5]/80 text-[#4a3a2c] py-3 rounded-xl text-sm font-medium tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2"
        >
          <AiOutlinePlus className="w-4 h-4 text-[#4a3a2c]"/>
          <span>Set Reminder for {value.toDateString()}</span>
        </motion.button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.3, ease: "easeInOut"}}
                className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                  initial={{scale: 0.8, y: 20}}
                  animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-[#f4e3d0]/80 backdrop-blur-sm rounded-2xl border border-[#ddb892] shadow-xl p-6 w-[90%] max-w-md"
            >
              <ReminderModal setShowModal={setShowModal} value={value} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Callendar;