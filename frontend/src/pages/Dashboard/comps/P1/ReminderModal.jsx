import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import TimePicker from "react-time-picker";
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import useFetchAllBatch from "@/pages/BatchPage/Functions/useFetchAllBatch.jsx";

const ReminderModal = ({ setShowModal, value }) => {
    const [batchName, setBatchName] = useState("");
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [subjectName, setSubjectName] = useState("");

    // Initialize with today, but update whenever 'value' changes
    const [reminderDate, setReminderDate] = useState(new Date());

    useEffect(() => {
        if (value) setReminderDate(new Date(value));
    }, [value]);

    const [time, setTime] = useState("");
    const [reminderText, setReminderText] = useState("");
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        const getBatch = async () => {
            const batches = await useFetchAllBatch();
            setBatches(batches);
        };
        getBatch();
    }, []);

    const isValidDate = (d) => d instanceof Date && !isNaN(d);

    const handleSubmitReminder = async () => {
        if (!reminderText.trim()) {
            return alert("❌ Reminder text is required.");
        }
        if (!time) {
            return alert("❌ Please select a time.");
        }
        if (!isValidDate(reminderDate)) {
            return alert("❌ Invalid or missing date.");
        }

        const [hour, minute] = time.split(":").map(Number);

        // Construct date+time in local timezone
        const finalDateAndTime = new Date(
            reminderDate.getFullYear(),
            reminderDate.getMonth(),
            reminderDate.getDate(),
            hour,
            minute,
            0,
            0
        ).toISOString(); // Save as ISO string for backend consistency

        const payload = {
            batchName: batchName || undefined,
            subjectName: subjectName || undefined,
            reminderDate: finalDateAndTime,
            reminder: reminderText.trim()
        };

        try {
            await axiosInstance.post('/api/reminder/add-reminder', payload, { withCredentials: true });
            alert(`✅ Reminder Set!\n\nDate: ${reminderDate.toDateString()}\nTime: ${time}\nNote: ${reminderText}`);
            setShowModal(false);
        } catch (err) {
            console.error(err);
            alert("❌ Failed to set reminder. Try again.");
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black/20 text-black backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-2xl shadow-xl p-6 w-[90%] sm:w-[420px] relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                >
                    <FiX size={20} />
                </button>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Set Reminder</h3>

                {/* Batch Dropdown (Optional) */}
                <label className="block text-sm font-medium text-gray-600 mb-1">Batch (optional)</label>
                <select
                    value={batchName}
                    onChange={(e) => {
                        const selected = batches.find(batch => batch.name === e.target.value);
                        setBatchName(selected?.name || "");
                        setSelectedBatch(selected || null);
                        setSubjectName("");
                    }}
                    className="w-full px-3 py-2 mb-3 border rounded-md shadow-sm text-sm"
                >
                    <option value="">No Batch</option>
                    {batches.map((batch, idx) => (
                        <option key={idx} value={batch.name}>{batch.name}</option>
                    ))}
                </select>

                {/* Subject Dropdown (Optional) */}
                <label className="block text-sm font-medium text-gray-600 mb-1">Subject (optional)</label>
                <select
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    disabled={!selectedBatch}
                    className="w-full px-3 py-2 mb-3 border rounded-md shadow-sm text-sm"
                >
                    <option value="">No Subject</option>
                    {selectedBatch?.subject?.map((subj, idx) => (
                        <option key={idx} value={subj.name}>{subj.name}</option>
                    ))}
                </select>

                {/* Date Input */}
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <input
                    type="date"
                    value={`${reminderDate.getFullYear()}-${String(reminderDate.getMonth() + 1).padStart(2, '0')}-${String(reminderDate.getDate()).padStart(2, '0')}`}
                    onChange={(e) => {
                        const [year, month, day] = e.target.value.split('-').map(Number);
                        const localDate = new Date(year, month - 1, day);
                        setReminderDate(localDate);
                    }}
                    className="w-full px-3 py-2 mb-3 border rounded-md text-sm"
                />

                {/* Time Picker */}
                <label className="block text-sm font-medium text-gray-600 mb-1">Time (24hr)</label>
                <TimePicker
                    onChange={setTime}
                    value={time}
                    disableClock={true}
                    className="w-full text-sm"
                    format="HH:mm"
                    clearIcon={null}
                />

                {/* Reminder Text */}
                <label className="block text-sm font-medium text-gray-600 mb-1 mt-4">Reminder</label>
                <input
                    type="text"
                    value={reminderText}
                    onChange={(e) => setReminderText(e.target.value)}
                    placeholder="e.g. Conduct unit test"
                    className="w-full px-3 py-2 mb-4 border rounded-md text-sm"
                />

                {/* Submit */}
                <motion.button
                    whileTap={{ scale: 0.96 }}
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
