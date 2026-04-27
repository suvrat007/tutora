import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/utilities/axiosInstance";
import { AnimatePresence, motion } from "framer-motion";
import { notify } from '@/components/ui/Toast.jsx';

const DEBOUNCE_MS = 1500;

const Reminders = ({ refreshKey = 0 }) => {
    const [reminders, setReminders] = useState([]);
    const [markedDoneIds, setMarkedDoneIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const deleteTimers = useRef({});

    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const res = await axiosInstance.get("reminder/get-reminder", {
                    withCredentials: true,
                });
                const now = new Date();
                const filtered = res.data.reminder.filter((rem) => {
                    const reminderDate = new Date(rem.reminderDate);
                    const timeStr = rem.time?.trim() || "";
                    let [hours, minutes] = [0, 0];
                    if (/AM|PM/i.test(timeStr)) {
                        const [timePart, modifier] = timeStr.split(" ");
                        [hours, minutes] = timePart.split(":").map(Number);
                        if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
                        if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
                    } else if (timeStr.includes(":")) {
                        [hours, minutes] = timeStr.split(":").map(Number);
                    }
                    const reminderDateTime = new Date(reminderDate);
                    reminderDateTime.setHours(hours);
                    reminderDateTime.setMinutes(minutes);
                    reminderDateTime.setSeconds(0);
                    reminderDateTime.setMilliseconds(0);
                    return (
                        reminderDateTime.toDateString() === now.toDateString() &&
                        reminderDateTime <= now
                    );
                });
                setReminders(filtered);
            } catch (err) {
                console.error(err);
                setError("Failed to load reminders.");
            } finally {
                setLoading(false);
            }
        };
        fetchReminders();
    }, [refreshKey]);

    // Cancel all pending timers on unmount
    useEffect(() => {
        return () => {
            Object.values(deleteTimers.current).forEach(clearTimeout);
        };
    }, []);

    const toggleReminderDone = (id) => {
        const isDone = markedDoneIds.includes(id);
        if (isDone) {
            // Cancel scheduled deletion
            clearTimeout(deleteTimers.current[id]);
            delete deleteTimers.current[id];
            setMarkedDoneIds((prev) => prev.filter((remId) => remId !== id));
        } else {
            // Mark done and schedule auto-deletion after debounce
            setMarkedDoneIds((prev) => [...prev, id]);
            deleteTimers.current[id] = setTimeout(async () => {
                try {
                    await axiosInstance.delete(`reminder/delete-reminder/${id}`, {
                        withCredentials: true,
                    });
                    setReminders((prev) => prev.filter((rem) => rem._id !== id));
                    setMarkedDoneIds((prev) => prev.filter((remId) => remId !== id));
                } catch (err) {
                    console.error("Failed to delete reminder", err);
                    notify("Failed to dismiss reminder.", "error");
                    setMarkedDoneIds((prev) => prev.filter((remId) => remId !== id));
                }
                delete deleteTimers.current[id];
            }, DEBOUNCE_MS);
        }
    };

    const listVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.4, ease: "easeInOut", delay: i * 0.1 }
        }),
        exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3, ease: "easeInOut" } }
    };

    return (
        <div className="px-6 py-4 border border-[#e6c8a8] flex flex-col sm:h-full bg-[#f8ede3] rounded-3xl shadow-xl">
            <div className="border-b border-[#e6c8a8] pb-2.5 mb-4">
                <h1 className="text-lg font-semibold text-[#5a4a3c]">Reminders for Today</h1>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
                {loading ? (
                    <p className="text-sm text-[#7b5c4b]">Loading reminders...</p>
                ) : error ? (
                    <div className="text-red-600 bg-red-100 px-4 py-2 rounded-md text-sm">
                        {error}
                    </div>
                ) : reminders.length === 0 ? (
                    <div className="text-center text-[#7b5c4b] py-6">
                        <p className="text-sm">You have no reminders for today 🎉</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {reminders.map(({ _id, reminder, batchName, subjectName }, index) => {
                            const isDone = markedDoneIds.includes(_id);
                            return (
                                <motion.div
                                    key={_id}
                                    custom={index}
                                    variants={listVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border border-[#e6c8a8] rounded-xl px-4 py-3 bg-white shadow-md hover:shadow-lg hover:bg-[#f0d9c0] transition-all duration-300 ${
                                        isDone ? "bg-[#f0d9c0]" : ""
                                    }`}
                                >
                                    <div className="flex-1 w-full space-y-1">
                                        <div className="flex flex-wrap items-center gap-2 border-b border-[#e6c8a8] pb-1 text-sm">
                                            <span className="font-semibold text-[#e0c4a8]">
                                                {batchName || "No Batch"}
                                            </span>
                                            <span className="text-[#7b5c4b] pl-2 border-l border-[#e6c8a8]">
                                                {subjectName || "No Subject"}
                                            </span>
                                        </div>
                                        <p
                                            className={`text-[15px] ${
                                                isDone
                                                    ? "line-through text-[#7b5c4b] italic"
                                                    : "text-[#5a4a3c]"
                                            }`}
                                        >
                                            {reminder}
                                        </p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                        onClick={() => toggleReminderDone(_id)}
                                        className={`mt-3 sm:mt-0 sm:ml-6 px-4 py-2 text-sm rounded-md font-medium shadow-md transition-all duration-300 ${
                                            isDone
                                                ? "bg-[#e0c4a8] text-[#5a4a3c] hover:bg-[#d8bca0]"
                                                : "bg-[#e0c4a8] text-[#5a4a3c] hover:bg-[#d8bca0]"
                                        }`}
                                    >
                                        {isDone ? "Mark Undone" : "Mark Done"}
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
export default Reminders;
