import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar } from "react-icons/fi";
import ReminderModal from "@/pages/Dashboard/comps/P1/ReminderModal.jsx";

const Callendar = () => {
  const [value, setValue] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  const handleSetReminder = () => {
    const today = new Date();
    const selected = new Date(value);

    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      return alert("❌ Cannot set a reminder for a past date.");
    }

    setShowModal(true);
  };

  return (
    <div className="w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full h-full flex flex-col justify-between"
      >
        {/* Heading */}
        <div className="flex items-center gap-2 text-gray-700 mb-4">
          <FiCalendar className="text-blue-500 text-lg" />
          <h2 className="text-base font-semibold">
            Select a Date to Set Reminder
          </h2>
        </div>

        {/* Calendar */}
        <div className="flex-grow overflow-auto">
          <div className="rounded-xl border border-gray-200 p-2 bg-white/60 shadow-inner">
            <Calendar
              onChange={setValue}
              value={value}
              className="w-full text-sm"
              tileClassName="hover:bg-blue-100 rounded-md transition-all duration-200"
            />
          </div>
        </div>

        {/* Set Reminder Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleSetReminder}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium tracking-wide shadow-md transition-all duration-200"
        >
          ➕ Set Reminder for {value.toDateString()}
        </motion.button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ReminderModal setShowModal={setShowModal} value={value} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Callendar;
