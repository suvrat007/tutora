import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFetchOverClasses } from "../DashboardHooks/useFetchAllClasses.jsx";
import { checkAttendanceStatus } from "../DashboardHooks/useFindAttendanceStatus.jsx";
import axiosInstance from "../../../../utilities/axiosInstance.jsx";

const ClassStatusUpdates = () => {
    const today = new Date().toISOString().split("T")[0];
    const [openIndex, setOpenIndex] = useState(null);
    const [status, setStatus] = useState({});
    const [attendance, setAttendance] = useState({});
    const [isLoadingAttendance, setIsLoadingAttendance] = useState({});
    const [attendanceErrors, setAttendanceErrors] = useState({});
    const [overClasses, setOverClasses] = useState(null);
    const [reminder, setReminder] = useState({});
    const [reminderDate, setReminderDate] = useState({});
    const [isSubmitted, setIsSubmitted] = useState({});
    const [isLoadingSubmit, setIsLoadingSubmit] = useState({});
    const [error, setError] = useState(null);

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleStatusSelect = async (index, held, batchId) => {
        if (isSubmitted[index]) {
            setAttendanceErrors((prev) => ({
                ...prev,
                [index]: "Status cannot be changed after submission",
            }));
            return;
        }

        setStatus((prev) => ({ ...prev, [index]: held }));
        setAttendanceErrors((prev) => ({ ...prev, [index]: null }));

        if (held) {
            setIsLoadingAttendance((prev) => ({ ...prev, [index]: true }));
            const { hasAttendance, error } = await checkAttendanceStatus(batchId);
            setAttendance((prev) => ({ ...prev, [index]: hasAttendance }));
            setAttendanceErrors((prev) => ({ ...prev, [index]: error }));
            setIsLoadingAttendance((prev) => ({ ...prev, [index]: false }));
        } else {
            setAttendance((prev) => ({ ...prev, [index]: false }));
        }
    };

    const handleReminder = async (batchId, subjectId, index) => {
        if (status[index] === undefined) {
            setAttendanceErrors((prev) => ({
                ...prev,
                [index]: "Please select Held or Cancelled before submitting",
            }));
            return;
        }

        const reminderText = reminder[index]?.trim();
        const forDate = reminderDate[index];

        if (!reminderText) {
            setAttendanceErrors((prev) => ({
                ...prev,
                [index]: status[index]
                    ? "Please enter a reminder for the next class"
                    : "Please enter a reason for cancellation",
            }));
            return;
        }

        if (reminderText.length > 200) {
            setAttendanceErrors((prev) => ({
                ...prev,
                [index]: "Reminder text cannot exceed 200 characters",
            }));
            return;
        }

        if (status[index] && !forDate) {
            setAttendanceErrors((prev) => ({
                ...prev,
                [index]: "Please select a date for the reminder",
            }));
            return;
        }

        if (status[index] && forDate < today) {
            setAttendanceErrors((prev) => ({
                ...prev,
                [index]: "Reminder date cannot be in the past",
            }));
            return;
        }

        setIsLoadingSubmit((prev) => ({ ...prev, [index]: true }));

        try {
            const resp = await axiosInstance.get(`get-batch/${batchId}/`);
            const batch = resp.data;

            if (!batch || !Array.isArray(batch.subject)) {
                throw new Error("Invalid batch data received");
            }

            const updatedSubjects = batch.subject.map((subject) => {
                if (subject._id === subjectId) {
                    const todayISO = new Date().toISOString();
                    const classStatusArray = subject.class_status || [];
                    const todayEntryIndex = classStatusArray.findIndex(
                        (cs) => cs.date.split("T")[0] === today
                    );

                    const newSession = {
                        held: status[index],
                        status: [{
                            updates: reminderText,
                            ...(status[index] && { forDate: new Date(forDate).toISOString() }),
                        }],
                    };

                    if (todayEntryIndex !== -1) {
                        classStatusArray[todayEntryIndex].sessions.push(newSession);
                    } else {
                        classStatusArray.push({
                            date: todayISO,
                            sessions: [newSession],
                            teacher_id: batch.teacherId,
                        });
                    }

                    return { ...subject, class_status: classStatusArray };
                }
                return subject;
            });

            await axiosInstance.put(`update-batch/${batchId}/`, { subject: updatedSubjects });
            setIsSubmitted((prev) => ({ ...prev, [index]: true }));
            setAttendanceErrors((prev) => ({ ...prev, [index]: null }));
        } catch (err) {
            setAttendanceErrors((prev) => ({
                ...prev,
                [index]: `Failed to update class status: ${err.message}`,
            }));
        } finally {
            setIsLoadingSubmit((prev) => ({ ...prev, [index]: false }));
        }
    };

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const classes = await useFetchOverClasses();
                if (!Array.isArray(classes)) throw new Error("Invalid classes data");
                setOverClasses(classes);
            } catch (err) {
                setError(`Failed to fetch classes: ${err.message}`);
            }
        };
        fetchClasses();
    }, []);

    return (
        <div className="rounded-2xl shadow-xl p-4 border-2 h-[20em] flex flex-col w-[50%]">
            <h1 className="text-xl font-semibold mb-4">
                Set Today's Class Status & Reminder
            </h1>

            {error ? (
                <p className="text-red-500 text-sm">{error}</p>
            ) : !overClasses ? (
                <p className="text-gray-500">Loading classes...</p>
            ) : overClasses.length === 0 ? (
                <p className="text-gray-500">No classes over yet</p>
            ) : (
                <div className="overflow-y-auto space-y-4">
                    {overClasses.map((val, index) => (
                        <div key={index} className="rounded-xl shadow-md p-4 bg-gray-50 flex flex-col gap-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <h2 className="font-medium text-lg">Batch: {val.batchName}</h2>
                                    <p className="text-sm text-gray-500">Subject: {val.subjectName}</p>
                                </div>
                                <button
                                    onClick={() => handleToggle(index)}
                                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm"
                                >
                                    Update Status {openIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 mt-2"
                                    >
                                        <div className="flex gap-2">
                                            {["Held", "Cancelled"].map((label) => {
                                                const isHeld = label === "Held";
                                                const isActive = status[index] === isHeld;
                                                const isDisabled =
                                                    isLoadingAttendance[index] ||
                                                    (isSubmitted[index] && isHeld);

                                                return (
                                                    <button
                                                        key={label}
                                                        className={`px-3 py-1 rounded-lg border text-sm ${
                                                            isActive
                                                                ? "bg-blue-500 text-white"
                                                                : "bg-white text-blue-500 hover:bg-blue-100"
                                                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        onClick={() => handleStatusSelect(index, isHeld, val.id)}
                                                        disabled={isDisabled}
                                                    >
                                                        {isHeld && isLoadingAttendance[index]
                                                            ? "Checking..."
                                                            : label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {(status[index] !== undefined) && (
                                            <div className="space-y-2">
                                                {status[index] && (
                                                    <p className="text-sm">
                                                        Attendance: {attendance[index] ? "✅ Done" : "❌ Not Recorded"}
                                                    </p>
                                                )}
                                                {attendanceErrors[index] && (
                                                    <p className="text-sm text-red-500">
                                                        {attendanceErrors[index]}
                                                    </p>
                                                )}
                                                <input
                                                    type="text"
                                                    value={reminder[index] || ""}
                                                    onChange={(e) =>
                                                        setReminder((prev) => ({
                                                            ...prev,
                                                            [index]: e.target.value.slice(0, 200),
                                                        }))
                                                    }
                                                    placeholder={
                                                        status[index]
                                                            ? "Set reminder for next class"
                                                            : "Enter reason for cancellation"
                                                    }
                                                    className="w-full border p-2 rounded-lg text-sm"
                                                    disabled={isSubmitted[index]}
                                                />

                                                {status[index] && (
                                                    <input
                                                        type="date"
                                                        value={reminderDate[index] || ""}
                                                        onChange={(e) =>
                                                            setReminderDate((prev) => ({
                                                                ...prev,
                                                                [index]: e.target.value,
                                                            }))
                                                        }
                                                        min={today}
                                                        className="w-full border p-2 rounded-lg text-sm"
                                                        disabled={isSubmitted[index]}
                                                    />
                                                )}

                                                <button
                                                    onClick={() => handleReminder(val.id, val.subjectId, index)}
                                                    className={`px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 w-full text-sm ${
                                                        isLoadingSubmit[index] ? "opacity-50 cursor-not-allowed" : ""
                                                    }`}
                                                    disabled={isLoadingSubmit[index]}
                                                >
                                                    {isLoadingSubmit[index] ? "Submitting..." : "Submit"}
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassStatusUpdates;
