import { useEffect, useState } from "react";
import { getAllRemindersForTheDay } from "../DashboardHooks/getAllRemindersForTheDay.js";

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [doneStatus, setDoneStatus] = useState({}); // Tracks done status by reminder ID
    const [error, setError] = useState(null);

    // Load done status from localStorage on mount
    useEffect(() => {
        const storedDoneStatus = localStorage.getItem("reminderDoneStatus");
        if (storedDoneStatus) {
            try {
                setDoneStatus(JSON.parse(storedDoneStatus));
            } catch (err) {
                console.error("Failed to parse localStorage done status:", err.message);
            }
        }
    }, []);

    // Fetch reminders on mount
    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const fetchedReminders = await getAllRemindersForTheDay();
                if (!Array.isArray(fetchedReminders)) {
                    throw new Error("Invalid reminders data received");
                }
                setReminders(fetchedReminders);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchReminders();
    }, []);

    // Update localStorage whenever doneStatus changes
    useEffect(() => {
        try {
            localStorage.setItem("reminderDoneStatus", JSON.stringify(doneStatus));
        } catch (err) {
            console.error("Failed to save done status to localStorage:", err.message);
        }
    }, [doneStatus]);

    // Toggle done status for a reminder
    const handleToggleDone = (reminderId) => {
        setDoneStatus((prev) => ({
            ...prev,
            [reminderId]: !prev[reminderId], // Toggle true/false
        }));
    };

    // Generate a unique ID for each reminder (since index may not be stable)
    const getReminderId = (reminder, index) => {
        return `${reminder.batchName}-${reminder.subjectName}-${reminder.reminder}-${index}`;
    };

    return (
        <div className="rounded-2xl w-[50%] flex flex-col border-2 border-gray-300 bg-white shadow-md">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-700">Reminders for Today</h1>
            </div>

            {/* Main component */}
            <div className="p-4 space-y-3">
                {error ? (
                    <p className="text-red-500 text-sm">{error}</p>
                ) : reminders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No reminders for today</p>
                ) : (
                    reminders.map((value, index) => {
                        const reminderId = getReminderId(value, index);
                        const isDone = !!doneStatus[reminderId];

                        return (
                            <div
                                key={reminderId}
                                className="flex flex-col sm:flex-row items-start sm:items-center border border-gray-200 rounded-lg p-3 bg-gray-50"
                            >
                                <div className="flex-1">
                                    <h2 className="text-sm font-medium text-gray-800">{value.batchName}</h2>
                                    <p className="text-xs text-gray-600">{value.subjectName}</p>
                                    <p
                                        className={`text-sm text-gray-700 ${
                                            isDone ? "line-through text-gray-400" : ""
                                        }`}
                                    >
                                        {value.reminder}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleToggleDone(reminderId)}
                                    className={`mt-2 sm:mt-0 px-3 py-1 rounded-lg text-sm ${
                                        isDone
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                                >
                                    {isDone ? "Mark Undone" : "Mark Done"}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Reminders;