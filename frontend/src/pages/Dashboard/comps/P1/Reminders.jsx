import { useEffect, useState } from "react";
import axiosInstance from "@/utilities/axiosInstance";

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [markedDone, setMarkedDone] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get("/api/reminder/get-reminder", { withCredentials: true });
                const now = new Date();
                const today = res.data.reminder.filter((r) => {
                    const d = new Date(r.reminderDate);
                    return d.toDateString() === now.toDateString() && d <= now;
                });
                setReminders(today);
            } catch (err) {
                alert("Failed to load reminders");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggleDone = (id) => {
        setMarkedDone(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const deleteMarked = async () => {
        try {
            await Promise.all(markedDone.map(id =>
                axiosInstance.delete(`/api/reminder/delete-reminder/${id}`, { withCredentials: true })
            ));
            setReminders(prev => prev.filter(r => !markedDone.includes(r._id)));
            setMarkedDone([]);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p>Loading reminders...</p>;

    return (
        <div className="max-w-2xl mx-auto mt-6 p-4 bg-white border text-black rounded shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Today's Reminders</h2>
                {markedDone.length > 0 && (
                    <button
                        onClick={deleteMarked}
                        disabled={loading}
                        className={`px-4 py-2 text-sm rounded-md font-medium shadow-sm transition-colors duration-150 ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                )}

            </div>
            {reminders.length === 0 ? (
                <p className="text-gray-500">🎉 No reminders today!</p>
            ) : (
                <ul className="space-y-3">
                    {reminders.map(r => {
                        const isDone = markedDone.includes(r._id);
                        return (
                            <li key={r._id} className={`p-3 border rounded flex justify-between items-center ${isDone ? 'bg-green-100' : ''}`}>
                                <div>
                                    <p className="text-sm font-medium">{r.reminder}</p>
                                    <p className="text-xs text-gray-500">
                                        {r.batchName || "No Batch"} | {r.subjectName || "No Subject"} | {new Date(r.reminderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <button onClick={() => toggleDone(r._id)} className="ml-4 text-sm px-3 py-1 rounded bg-sky-500 text-white hover:bg-sky-600">
                                    {isDone ? "Undo" : "Done"}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default Reminders;
