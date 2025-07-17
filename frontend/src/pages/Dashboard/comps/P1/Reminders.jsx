import { useEffect, useState } from "react";
import axiosInstance from "@/utilities/axiosInstance";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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
                    reminderDateTime.setHours(hours, minutes, 0, 0);

                    return (
                        reminderDateTime.toDateString() === now.toDateString() &&
                        reminderDateTime <= now
                    );
                });

                setReminders(filtered);
            } catch (err) {
                toast.error("Failed to load reminders.");
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
            await Promise.all(markedDoneIds.map(id =>
                axiosInstance.delete(`/api/reminder/delete-reminder/${id}`, { withCredentials: true })
            ));
            setReminders((prev) => prev.filter((rem) => !markedDoneIds.includes(rem._id)));
            setMarkedDoneIds([]);
            toast.success("Reminders updated!");
        } catch (err) {
            toast.error("Failed to update some reminders.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-[#fef5e7] to-[#e7c6a5] rounded-xl border border-[#ddb892] shadow-lg h-full flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-[#4a3a2c] mb-2 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#f7c7a3]" />
                        Today's Reminders
                    </h2>
                    <div className="h-1 w-16 bg-gradient-to-r from-[#f4e3d0] to-[#e7c6a5] rounded-full"></div>
                </div>
                <button
                    onClick={handleSaveChanges}
                    disabled={isSaving || loading || markedDoneIds.length === 0}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                        isSaving || loading || markedDoneIds.length === 0
                            ? "bg-[#a08a6e] text-[#fef5e7] cursor-not-allowed"
                            : "bg-[#d97706] text-white hover:bg-[#d97706]/80 shadow-md hover:shadow-lg"
                    }`}
                >
                    {isSaving && <Loader2 className="animate-spin w-4 h-4" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8 text-[#f7c7a3]">
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        <span>Loading reminders...</span>
                    </div>
                ) : reminders.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">🎉</div>
                        <p className="text-[#4a3a2c]">You have no reminders for today.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {reminders.map(({ _id, reminder, batchName, subjectName }, index) => {
                            const isDone = markedDoneIds.includes(_id);
                            return (
                                <motion.div
                                    key={_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-300 ${
                                        isDone
                                            ? "bg-[#f9f0e5] border-[#e8d4bd]"
                                            : "bg-[#f4e3d0] border-[#ddb892]"
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-[#ecd9c4]">
                        <span className="text-sm font-semibold text-[#7a5e45] bg-[#f4e2ce] px-2 py-1 rounded-md">
                            {batchName || "No Batch"}
                        </span>
                                                <span className="text-sm text-[#856f5b] bg-[#fff4ea] px-2 py-1 rounded-md">
                            {subjectName || "No Subject"}
                        </span>
                                            </div>
                                            <p className={`text-sm ${
                                                isDone
                                                    ? "line-through text-[#b09a85] italic"
                                                    : "text-[#6e4f3a]"
                                            }`}>
                                                {reminder}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleReminderDone(_id)}
                                            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                                                isDone
                                                    ? "bg-[#e4c9aa] text-[#5e4430] hover:bg-[#d8bda0]"
                                                    : "bg-[#f1d1a6] text-[#5e4430] hover:bg-[#e7c89c]"
                                            }`}
                                        >
                                            {isDone ? "Mark Undone" : "Mark Done"}
                                        </button>
                                    </div>
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