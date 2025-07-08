import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import useFetchUnUpdatedClasslog from "../DashboardHooks/useFetchUnUpdatedClasslog.js";

const ClassStatusUpdates = () => {
    const [rerender, setRerender] = useState(false);
    const { filteredLogs, loading, error } = useFetchUnUpdatedClasslog(rerender);
    const [statusData, setStatusData] = useState({});
    const [openIndex, setOpenIndex] = useState(null);
    const [loadingStates, setLoadingStates] = useState({});

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleStatusChange = (index, held) => {
        setStatusData(prev => ({ ...prev, [index]: { ...prev[index], held, error: null } }));
    };

    const handleInputChange = (index, value) => {
        setStatusData(prev => ({ ...prev, [index]: { ...prev[index], note: value, error: null } }));
    };

    const handleSubmit = async (classInfo, index) => {
        const status = statusData[index];

        if (!status) return setStatusData(prev => ({ ...prev, [index]: { ...prev[index], error: "Please select Held or Cancelled." } }));
        if (!status.held && !status.note?.trim()) return setStatusData(prev => ({ ...prev, [index]: { ...prev[index], error: "Provide a reason." } }));

        const payload = {
            batch_id: classInfo.batchId,
            subject_id: classInfo.subjectId,
            date: classInfo.originalDate || classInfo.date,
            hasHeld: status.held,
            note: status.note || "No Data",
            updated: true
        };

        try {
            setLoadingStates(prev => ({ ...prev, [index]: true }));
            const response = await axiosInstance.post("/api/classLog/add-class-updates", { updates: [payload] }, { withCredentials: true });
            alert("Class updated!");
            console.log(response.data)
            setOpenIndex(null);
            setRerender(prev => !prev);
            setStatusData(prev => { const p = { ...prev }; delete p[index]; return p; });
        } catch (err) {
            console.error("Update failed:", err);
            setStatusData(prev => ({ ...prev, [index]: { ...prev[index], error: "Update failed." } }));
        } finally {
            setLoadingStates(prev => ({ ...prev, [index]: false }));
        }
    };

    return (
        <div className="p-6 text-black rounded-xl border shadow-lg bg-white">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Update Unupdated Classes</h2>

            {error && <p className="text-red-500 mb-2">{error}</p>}
            {loading ? (
                <div className="flex items-center justify-center py-4 text-gray-500">
                    <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading classes...
                </div>
            ) : filteredLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No classes to update at the moment. 🎉</p>
            ) : (
                filteredLogs.map((cls, index) => (
                    <div key={cls.classId} className="mb-4 border p-4 rounded-xl bg-gray-50 shadow-sm">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => handleToggle(index)}>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Batch: {cls.batchName}</p>
                                <p className="text-xs text-gray-500">Subject: {cls.subjectName}</p>
                                <p className="text-xs text-gray-500">Date: {cls.date} | Time: {cls.scheduledTime}</p>
                            </div>
                            <button className="text-blue-600 text-sm flex items-center gap-1">
                                {openIndex === index ? "Close" : "Update"} {openIndex === index ? <ChevronUp /> : <ChevronDown />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-4 space-y-3 overflow-hidden"
                                >
                                    <div className="flex gap-2">
                                        {["Held", "Cancelled"].map(label => (
                                            <button
                                                key={label}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange(index, label === "Held");
                                                }}
                                                className={`px-3 py-1 rounded-lg border text-sm transition-colors duration-200 ${
                                                    statusData[index]?.held === (label === "Held")
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={statusData[index]?.note || ""}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        className="w-full border p-2 rounded-md text-sm resize-y min-h-[60px]"
                                        placeholder={
                                            statusData[index]?.held
                                                ? "What was covered in class? (e.g., Chapter 5 completed)"
                                                : "Why was the class cancelled? (e.g., Teacher unavailable)"
                                        }
                                        rows="3"
                                    />
                                    {statusData[index]?.error && (
                                        <p className="text-red-500 text-sm">{statusData[index].error}</p>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSubmit(cls, index);
                                        }}
                                        disabled={loadingStates[index] || statusData[index]?.held === undefined}
                                        className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors duration-200 ${
                                            loadingStates[index] || statusData[index]?.held === undefined
                                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                : "bg-green-600 text-white hover:bg-green-700"
                                        }`}
                                    >
                                        {loadingStates[index] ? (
                                            <>
                                                <Loader2 className="animate-spin w-4 h-4" /> Submitting...
                                            </>
                                        ) : (
                                            "Submit Update"
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))
            )}
        </div>
    );
};

export default ClassStatusUpdates;