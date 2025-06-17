import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useState } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import TimePicker from "react-time-picker";
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const ReminderModal = ({ setShowModal }) => {
    const [batchName, setBatchName] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [reminderDate, setReminderDate] = useState(new Date());
    const [time, setTime] = useState("");
    const [reminderText, setReminderText] = useState("");

    const handleSubmitReminder =async () => {
        if (!batchName || !subjectName || !reminderDate || !time || !reminderText.trim()) {
            return alert("Please fill in all fields.");
        }

        const payload = {
            batchName,
            subjectName,
            reminderDate,
            time,
            reminder: reminderText
        };
        console.log(payload)

        const response = await axiosInstance.post('/add-reminder', payload);


        alert(`Reminder Set!\n\nBatch: ${batchName}\nSubject: ${subjectName}\nDate: ${new Date(reminderDate).toDateString()}\nTime: ${time}\nTask: ${reminderText}`);
        setShowModal(false);
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md flex items-center justify-center"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
        >

            <motion.div
                className="bg-white rounded-2xl shadow-xl p-6 w-[90%] sm:w-[420px] relative"
                initial={{scale: 0.8}}
                animate={{scale: 1}}
                exit={{scale: 0.8}}
                transition={{type: "spring", stiffness: 300, damping: 20}}
            >
                {/* Close Button */}
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                >
                    <FiX size={20}/>
                </button>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Set Reminder</h3>

                {/* Batch Name */}
                <label className="block text-sm font-medium text-gray-600 mb-1">Batch Name</label>
                <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g. Alpha Batch"
                    className="w-full px-3 py-2 mb-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                />

                {/* Subject Name */}
                <label className="block text-sm font-medium text-gray-600 mb-1">Subject Name</label>
                <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 mb-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                />

                {/* Date */}
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <input
                    type="date"
                    value={reminderDate.toISOString().split("T")[0]}
                    onChange={(e) => setReminderDate(new Date(e.target.value))}
                    className="w-full px-3 py-2 mb-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                />

                {/* Time */}
                <label className="block text-sm font-medium text-gray-600 mb-1">Time (24hr format)</label>
                <TimePicker
                    onChange={setTime}
                    value={time}
                    disableClock={true}
                    className="w-full text-sm"
                    format="HH:mm a"
                    clearIcon={null}
                />

                {/* Reminder Text */}
                <label className="block text-sm font-medium text-gray-600 mb-1">Reminder</label>
                <input
                    type="text"
                    value={reminderText}
                    onChange={(e) => setReminderText(e.target.value)}
                    placeholder="e.g. Conduct unit test"
                    className="w-full px-3 py-2 mb-4 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                />

                {/* Submit Button */}
                <motion.button
                    whileTap={{scale: 0.96}}
                    onClick={handleSubmitReminder}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-semibold"
                >
                    Save Reminder
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default ReminderModal;
