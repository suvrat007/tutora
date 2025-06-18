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

        // Normalize time
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);

        if (selected < today) {
            return alert("❌ Cannot set a reminder for a past date.");
        }

        setShowModal(true);
    };

    return (
        <div className="flex justify-center items-start w-[30%]">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full p-5 mt-2 rounded-3xl shadow-xl border border-gray-200 bg-white h-[22em] overflow-hidden flex flex-col justify-between"
            >
                {/* Heading */}
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                    <FiCalendar className="text-blue-500 text-xl" />
                    <h2 className="text-sm sm:text-base font-semibold">Select a Date to Set Reminder</h2>
                </div>

                {/* Calendar */}
                <div className="rounded-xl overflow-y-auto border border-gray-100 shadow-inner flex-grow">
                    <Calendar
                        onChange={setValue}
                        value={value}
                        className="w-[90%] text-[.8em]"
                        tileClassName="hover:bg-blue-100 rounded-md transition-all duration-200"
                    />
                </div>

                {/* Set Reminder Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={handleSetReminder}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium tracking-wide shadow-md transition-all duration-200"
                >
                    ➕ Set Reminder for {value.toDateString()}
                </motion.button>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && <ReminderModal setShowModal={setShowModal} value={value} />}
            </AnimatePresence>
        </div>
    );
};

export default Callendar;
