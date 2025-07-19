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
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full h-full flex flex-col justify-between"
            >
                <div className="flex items-center gap-2 text-[#5a4a3c] mb-4">
                    <FiCalendar className="text-[#e0c4a8] text-lg" />
                    <h2 className="text-base font-semibold">Select a Date to Set Reminder</h2>
                </div>
                <div className="flex-1 min-h-0 overflow-auto text-[#5a4a3c]">
                    <div className="rounded-xl border border-[#e6c8a8] p-3 bg-[#f8ede3] shadow-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                        <Calendar
                            onChange={setValue}
                            value={value}
                            className="react-calendar w-full text-sm"
                            tileClassName="hover:bg-[#e0c4a8] rounded-md transition-all duration-300"
                        />
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    onClick={handleSetReminder}
                    className="mt-4 w-full bg-[#e0c4a8] hover:bg-[#d8bca0] text-[#5a4a3c] py-2 rounded-xl text-sm font-medium tracking-wide shadow-md transition-all duration-300"
                >
                    ➕ Set Reminder for {value.toDateString()}
                </motion.button>
            </motion.div>
            <AnimatePresence>
                {showModal && (
                    <ReminderModal setShowModal={setShowModal} value={value} />
                )}
            </AnimatePresence>
            <style>{`
                .react-calendar {
                    color: #5a4a3c;
                    background: #f8ede3;
                    border: none;
                }
                .react-calendar__tile {
                    color: #5a4a3c;
                }
                .react-calendar__tile--active {
                    background-color: #e0c4a8 !important;
                    color: #5a4a3c !important;
                }
                .react-calendar__tile--now {
                    background: #f0d9c0 !important;
                }
            `}</style>
        </div>
    );
};
export default Callendar;
