import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { notify } from '@/components/ui/Toast.jsx';
import { API } from '@/utilities/constants';

const inputClass = "w-full px-3 py-2 border border-[#e6c8a8] rounded-lg bg-white text-sm text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8]";
const labelClass = "block text-sm font-medium text-[#5a4a3c] mb-1";

const ReminderModal = ({ setShowModal, value }) => {
    const batches = useSelector(state => state.batches);

    const [batchName, setBatchName] = useState("");
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [subjectName, setSubjectName] = useState("");
    const [reminderDate, setReminderDate] = useState(new Date());
    const [time, setTime] = useState("");
    const [reminderText, setReminderText] = useState("");

    useEffect(() => {
        if (value) setReminderDate(new Date(value));
    }, [value]);

    const isValidDate = (d) => d instanceof Date && !isNaN(d);

    const handleSubmitReminder = async () => {
        if (!reminderText.trim()) return notify("Reminder text is required.", "warning");
        if (!time) return notify("Please select a time.", "warning");
        if (!isValidDate(reminderDate)) return notify("Invalid or missing date.", "error");

        const [hour, minute] = time.split(":").map(Number);
        const finalDateAndTime = new Date(
            reminderDate.getFullYear(),
            reminderDate.getMonth(),
            reminderDate.getDate(),
            hour, minute, 0, 0
        ).toISOString();

        const payload = {
            batchName: batchName || undefined,
            subjectName: subjectName || undefined,
            reminderDate: finalDateAndTime,
            reminder: reminderText.trim()
        };

        try {
            await axiosInstance.post(API.ADD_REMINDER, payload);
            notify(`Reminder set for ${reminderDate.toDateString()} ${time}`, "success");
            setShowModal(false);
        } catch (err) {
            console.error(err);
            notify("Failed to set reminder. Try again.", "error");
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-[#f8ede3] rounded-2xl shadow-xl p-6 w-[90%] sm:w-[420px] relative border border-[#e6c8a8]"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-[#7b5c4b] hover:text-[#5a4a3c] transition-colors"
                >
                    <FiX size={20} />
                </button>

                <h3 className="text-lg font-bold text-[#5a4a3c] mb-4">Set Reminder</h3>

                <label className={labelClass}>Batch (optional)</label>
                <select
                    value={batchName}
                    onChange={(e) => {
                        const selected = batches.find(batch => batch.name === e.target.value);
                        setBatchName(selected?.name || "");
                        setSelectedBatch(selected || null);
                        setSubjectName("");
                    }}
                    className={`${inputClass} mb-3`}
                >
                    <option value="">No Batch</option>
                    {batches.map((batch, idx) => (
                        <option key={idx} value={batch.name}>{batch.name}</option>
                    ))}
                </select>

                <label className={labelClass}>Subject (optional)</label>
                <select
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    disabled={!selectedBatch}
                    className={`${inputClass} mb-3 disabled:opacity-50`}
                >
                    <option value="">No Subject</option>
                    {selectedBatch?.subject?.map((subj, idx) => (
                        <option key={idx} value={subj.name}>{subj.name}</option>
                    ))}
                </select>

                <label className={labelClass}>Date</label>
                <input
                    type="date"
                    value={`${reminderDate.getFullYear()}-${String(reminderDate.getMonth() + 1).padStart(2, '0')}-${String(reminderDate.getDate()).padStart(2, '0')}`}
                    onChange={(e) => {
                        const [year, month, day] = e.target.value.split('-').map(Number);
                        setReminderDate(new Date(year, month - 1, day));
                    }}
                    className={`${inputClass} mb-3`}
                />

                <label className={labelClass}>Time (24hr)</label>
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`${inputClass} mb-3`}
                />

                <label className={`${labelClass} mt-1`}>Reminder</label>
                <input
                    type="text"
                    value={reminderText}
                    onChange={(e) => setReminderText(e.target.value)}
                    placeholder="e.g. Conduct unit test"
                    className={`${inputClass} mb-4`}
                />

                <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleSubmitReminder}
                    className="w-full bg-[#8b5e3c] hover:bg-[#7a4f2f] text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                    Save Reminder
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default ReminderModal;
