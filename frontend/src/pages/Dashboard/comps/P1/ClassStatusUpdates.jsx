import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import useFetchUnUpdatedClasslog from "../DashboardHooks/useFetchUnUpdatedClasslog.js";
import useFetchClassLogs from "@/pages/useFetchClassLogs.js";
import toast from "react-hot-toast";

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
        setStatusData((prev) => ({ ...prev, [index]: { ...prev[index], held, error: null } }));
    };

    const handleInputChange = (index, value) => {
        setStatusData((prev) => ({ ...prev, [index]: { ...prev[index], note: value, error: null } }));
    };

    const fetchClassLogs = useFetchClassLogs();

    const handleSubmit = async (classInfo, index) => {
        const status = statusData[index];

        if (!status) return toast.error("Please select Held or Cancelled.");
        if (!status.held && !status.note?.trim()) return toast.error("Provide a reason.");

        const payload = {
            batch_id: classInfo.batchId,
            subject_id: classInfo.subjectId,
            date: classInfo.originalDate || classInfo.date,
            hasHeld: status.held,
            note: status.note || "No Data",
            updated: true,
        };

        try {
            setLoadingStates((prev) => ({ ...prev, [index]: true }));
            await axiosInstance.post("/api/classLog/add-class-updates", { updates: [payload] }, { withCredentials: true });
            toast.success("Class updated!");
            fetchClassLogs();
            setOpenIndex(null);
            setRerender((prev) => !prev);
            setStatusData((prev) => {
                const p = { ...prev };
                delete p[index];
                return p;
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed.");
            setStatusData((prev) => ({ ...prev, [index]: { ...prev[index], error: "Update failed." } }));
        } finally {
            setLoadingStates((prev) => ({ ...prev, [index]: false }));
        }
    };

    return (
        <div className="bg-gradient-to-br to-[#e7c6a5] from-[#fef5e7] rounded-xl border border-[#ddb892] p-6 shadow-sm flex flex-col flex-1 h-full">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#4a3a2c] mb-2">Set Class Status</h2>
                <div className="h-1 w-16 bg-gradient-to-r from-[#f4e3d0] to-[#e7c6a5] rounded-full"></div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-8 text-[#f7c7a3]">
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        <span>Loading classes...</span>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">🎉</div>
                        <p className="text-[#4a3a2c]">No classes to update at the moment.</p>
                    </div>
                ) : (
                    filteredLogs.map((cls, index) => (
                        <motion.div
                            key={cls.classId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-[#f4e3d0]/80 backdrop-blur-sm rounded-xl border border-[#ddb892] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#e7c6a5]/50 transition-colors"
                                onClick={() => handleToggle(index)}
                            >
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-[#4a3a2c] mb-1">Batch: {cls.batchName}</p>
                                    <p className="text-xs text-[#6b4c3b] mb-1">Subject: {cls.subjectName}</p>
                                    <p className="text-xs text-[#a08a6e]">
                                        Date: {cls.date} | Time: {cls.scheduledTime}
                                    </p>
                                </div>
                                <button className="text-[#f7c7a3] hover:text-[#d97706] text-sm flex items-center gap-1 font-medium transition-colors">
                                    {openIndex === index ? "Close" : "Update"}
                                    {openIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t border-[#ddb892] p-4 space-y-4 bg-[#e7c6a5]/30"
                                    >
                                        <div className="flex gap-2">
                                            {["Held", "Cancelled"].map((label) => (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(index, label === "Held");
                                                    }}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        statusData[index]?.held === (label === "Held")
                                                            ? label === "Held"
                                                                ? "bg-green-600 text-white shadow-md"
                                                                : "bg-red-600 text-white shadow-md"
                                                            : "bg-[#fef5e7] text-[#4a3a2c] border border-[#ddb892] hover:bg-[#e7c6a5]"
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                        <textarea
                                            value={statusData[index]?.note || ""}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            className="w-full border border-[#ddb892] p-3 rounded-lg text-sm resize-y min-h-[80px] bg-[#fef5e7] text-[#4a3a2c] placeholder:text-[#a08a6e] focus:outline-none focus:ring-2 focus:ring-[#d7b48f] focus:border-transparent"
                                            placeholder={
                                                statusData[index]?.held
                                                    ? "What was covered in class? (e.g., Chapter 5 completed)"
                                                    : "Why was the class cancelled? (e.g., Teacher unavailable)"
                                            }
                                            rows="3"
                                        />

                                        {statusData[index]?.error && (
                                            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
                                                {statusData[index].error}
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSubmit(cls, index);
                                            }}
                                            disabled={loadingStates[index] || statusData[index]?.held === undefined}
                                            className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-200 ${
                                                loadingStates[index] || statusData[index]?.held === undefined
                                                    ? "bg-[#a08a6e] text-[#fef5e7] cursor-not-allowed"
                                                    : "bg-[#d97706] text-white hover:bg-[#d97706]/80 shadow-md hover:shadow-lg"
                                            }`}
                                        >
                                            {loadingStates[index] ? (
                                                <>
                                                    <Loader2 className="animate-spin w-4 h-4" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                "Submit Update"
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClassStatusUpdates;
