import { useEffect, useState } from "react";
import axiosInstance from "@/utilities/axiosInstance";
import { AnimatePresence, motion } from "framer-motion";

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [markedDoneIds, setMarkedDoneIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const res = await axiosInstance.get("/api/reminder/get-reminder", {
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
    }, []);

    const toggleReminderDone = (id) => {
        setMarkedDoneIds((prev) =>
            prev.includes(id) ? prev.filter((remId) => remId !== id) : [...prev, id]
        );
    };

    const handleSaveChanges = async () => {
        if (markedDoneIds.length === 0) return;
        setIsSaving(true);
        try {
            for (let id of markedDoneIds) {
                await axiosInstance.delete(`/api/reminder/delete-reminder/${id}`, {
                    withCredentials: true,
                });
            }
            setReminders((prev) =>
                prev.filter((rem) => !markedDoneIds.includes(rem._id))
            );
            setMarkedDoneIds([]);
        } catch (err) {
            console.error("Failed to delete reminders", err);
            alert("Some deletions failed.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-lg font-semibold text-gray-800">
                    📅 Reminders for Today
                </h1>
                <button
                    onClick={handleSaveChanges}
                    disabled={isSaving || loading}
                    className={`px-4 py-2 text-sm rounded-md font-medium shadow-sm transition-colors duration-150 ${
                        isSaving || loading
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                    {isSaving ? "Deleting..." : "Save Changes"}
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {loading ? (
                    <p className="text-sm text-gray-500">Loading reminders...</p>
                ) : error ? (
                    <div className="text-red-600 bg-red-100 px-4 py-2 rounded-md text-sm">
                        {error}
                    </div>
                ) : reminders.length === 0 ? (
                    <div className="text-center text-gray-500 py-6">
                        <p className="text-sm">You have no reminders for today 🎉</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {reminders.map(({ _id, reminder, batchName, subjectName }) => {
                            const isDone = markedDoneIds.includes(_id);
                            return (
                                <motion.div
                                    key={_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{
                                        opacity: 0,
                                        scale: 0.95,
                                        transition: { duration: 0.3 },
                                    }}
                                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm hover:shadow-md transition duration-150 ${
                                        isDone ? "bg-green-50" : ""
                                    }`}
                                >
                                    <div className="flex-1 w-full space-y-1">
                                        <div className="flex flex-wrap items-center gap-2 border-b pb-1 text-sm">
                      <span className="font-semibold text-indigo-600">
                        {batchName || "No Batch"}
                      </span>
                                            <span className="text-gray-500 pl-2 border-l border-gray-300">
                        {subjectName || "No Subject"}
                      </span>
                                        </div>
                                        <p
                                            className={`text-[15px] ${
                                                isDone
                                                    ? "line-through text-gray-400 italic"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {reminder}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleReminderDone(_id)}
                                        className={`mt-3 sm:mt-0 sm:ml-6 px-4 py-2 text-sm rounded-md font-medium shadow-sm transition-colors duration-150 ${
                                            isDone
                                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                                : "bg-sky-500 text-white hover:bg-sky-600"
                                        }`}
                                    >
                                        {isDone ? "Mark Undone" : "Mark Done"}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </>
    );
};

export default Reminders;
