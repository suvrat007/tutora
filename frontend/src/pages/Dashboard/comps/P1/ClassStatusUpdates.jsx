import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFetchOverClasses } from "../DashboardHooks/useFetchAllClasses.jsx";
import { checkAttendanceStatus } from "../DashboardHooks/useFindAttendanceStatus.jsx";

const ClassStatusUpdates = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [status, setStatus] = useState({});
    const [attendance, setAttendance] = useState({});
    const [isLoadingAttendance, setIsLoadingAttendance] = useState({});
    const [attendanceErrors, setAttendanceErrors] = useState({});
    const [overClasses, setOverClasses] = useState(null);

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleStatusSelect = async (index, held, batchId) => {
        setStatus({ ...status, [index]: held });

        if (held) {
            // Check attendance when marking as Held
            setIsLoadingAttendance({ ...isLoadingAttendance, [index]: true });
            const { hasAttendance, error } = await checkAttendanceStatus(batchId);
            setAttendance({ ...attendance, [index]: hasAttendance });
            setAttendanceErrors({ ...attendanceErrors, [index]: error });
            setIsLoadingAttendance({ ...isLoadingAttendance, [index]: false });
        } else {
            // Clear attendance info when marking as Cancelled
            setAttendance({ ...attendance, [index]: false });
            setAttendanceErrors({ ...attendanceErrors, [index]: null });
        }
    };

    useEffect(() => {
        const getClassesThatsOver = async () => {
            const classes = await useFetchOverClasses();
            setOverClasses(classes);
        };
        getClassesThatsOver();
    }, []);

    return (
        <div className="rounded-2xl shadow-xl p-4 max-h-[80vh] flex flex-col bg-white">
            <h1 className="text-xl font-semibold mb-4">Today's Class Status</h1>
            <div className="overflow-y-auto space-y-4">
                {overClasses ? (
                    overClasses.map((val, index) => (
                        <div key={index} className="rounded-xl shadow-md p-4 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-medium">Batch: {val.batchName}</h2>
                                    <p className="text-sm text-gray-500">Subject: {val.subjectName}</p>
                                </div>
                                <div
                                    onClick={() => handleToggle(index)}
                                    className="cursor-pointer flex items-center gap-1 text-blue-500"
                                >
                                    Update Status
                                    {openIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
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
                                            <div
                                                className={`px-3 py-1 rounded-lg cursor-pointer border ${
                                                    status[index] === true ? "bg-blue-500 text-white" : "bg-white text-blue-500"
                                                }`}
                                                onClick={() => handleStatusSelect(index, true, val.id)}
                                            >
                                                {isLoadingAttendance[index] ? "Checking..." : "Held"}
                                            </div>
                                            <div
                                                className={`px-3 py-1 rounded-lg cursor-pointer border ${
                                                    status[index] === false ? "bg-blue-500 text-white" : "bg-white text-blue-500"
                                                }`}
                                                onClick={() => handleStatusSelect(index, false, val.id)}
                                            >
                                                Cancelled
                                            </div>
                                        </div>

                                        {status[index] === true && (
                                            <div className="space-y-2">
                                                <p className="text-sm">
                                                    Attendance: {attendance[index] ? "✅ Done" : "❌ Not Recorded"}
                                                </p>
                                                {attendanceErrors[index] && (
                                                    <p className="text-sm text-red-500">Error: {attendanceErrors[index]}</p>
                                                )}
                                                <input
                                                    type="text"
                                                    placeholder="Set reminder for next class"
                                                    className="w-full border p-2 rounded-lg text-sm"
                                                />
                                            </div>
                                        )}

                                        {status[index] === false && (
                                            <div className="space-y-2">
                                                <p className="text-sm">Reason for cancellation:</p>
                                                <input
                                                    type="text"
                                                    placeholder="Enter reason"
                                                    className="w-full border p-2 rounded-lg text-sm"
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                ) : (
                    <div>
                        <h1>No Classes over yet</h1>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassStatusUpdates;