import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import useFetchUnUpdatedClasslog from "../DashboardHooks/useFetchUnUpdatedClasslog.js";

const ClassStatusForm = () => {
    const [rerender, setRerender] = useState(false);
    const { filteredLogs, loading, error } = useFetchUnUpdatedClasslog(rerender);
    const [statusData, setStatusData] = useState({});
    const [openIndex, setOpenIndex] = useState(null);
    const [loadingStates, setLoadingStates] = useState({});

    // console.log(filteredLogs)

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleStatusChange = (index, held) => {
        setStatusData(prev => ({
            ...prev,
            [index]: { ...prev[index], held, error: null }
        }));
    };

    const handleInputChange = (index, value) => {
        setStatusData(prev => ({
            ...prev,
            [index]: { ...prev[index], note: value, error: null }
        }));
    };

    const handleSubmit = async (classInfo, index) => {
        const status = statusData[index];

        if (!status?.held && !status?.note?.trim()) {
            return setStatusData(prev => ({
                ...prev,
                [index]: { ...prev[index], error: "Reason is required for cancelled class." }
            }));
        }

        if (status.held && (!classInfo.attendance || classInfo.attendance.length === 0)) {
            return setStatusData(prev => ({
                ...prev,
                [index]: { ...prev[index], error: "Please mark attendance before submitting held class." }
            }));
        }

        const payload = {
            batch_id: classInfo.batchId,
            subject_id: classInfo.subjectId,
            date: classInfo.date,
            hasHeld: status.held,
            note: status.note,
            updated: true
        };

        try {
            setLoadingStates(prev => ({ ...prev, [index]: true }));

            await axiosInstance.post("/api/classLog/add-class-update", payload, { withCredentials: true });

            alert("Class updated!");
            setLoadingStates(prev => ({ ...prev, [index]: false }));
            // fetch un updated classlogs again
            setRerender(prev => !prev)
        } catch (err) {
            console.error(err);
            alert("Failed to update class.");
        }
    };

    return (
        <div className="p-6 text-black rounded-xl border shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Update Unupdated Classes</h2>

            {error && <p className="text-red-500">{error}</p>}
            {loading && <p>Loading...</p>}
            {!loading && filteredLogs.length === 0 && <p>No classes to update.</p>}

            {filteredLogs.map((cls, index) => (
                <div key={cls.classId} className="mb-4 border p-4 rounded-xl bg-gray-50 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Batch: {cls.batchName}</p>
                            <p className="text-xs text-gray-500">Subject: {cls.subjectName}</p>
                            <p className="text-xs text-gray-500">Date: {cls.date} | Time: {cls.scheduledTime}</p>
                        </div>
                        <button onClick={() => handleToggle(index)} className="text-blue-600 text-sm flex items-center gap-1">
                            {openIndex === index ? "Close" : "Update"} {openIndex === index ? <ChevronUp /> : <ChevronDown />}
                        </button>
                    </div>

                    <AnimatePresence>
                        {openIndex === index && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 space-y-3"
                            >
                                <div className="flex gap-2">
                                    {["Held", "Cancelled"].map(label => (
                                        <button
                                            key={label}
                                            onClick={() => handleStatusChange(index, label === "Held")}
                                            className={`px-3 py-1 rounded-lg border text-sm ${
                                                statusData[index]?.held === (label === "Held")
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white text-blue-600 hover:bg-blue-100"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={statusData[index]?.note || ""}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    className="w-full border p-2 rounded-md text-sm"
                                    placeholder={
                                        statusData[index]?.held
                                            ? "What was done in class?"
                                            : "Why was class cancelled?"
                                    }
                                />
                                {statusData[index]?.error && (
                                    <p className="text-red-500 text-sm">{statusData[index].error}</p>
                                )}
                                <button
                                    onClick={() => handleSubmit(cls, index)}
                                    disabled={loadingStates[index]}
                                    className="w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                                >
                                    {loadingStates[index] ? (
                                        <>
                                            <Loader2 className="animate-spin w-4 h-4" /> Submitting...
                                        </>
                                    ) : (
                                        "Submit"
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

export default ClassStatusForm;
