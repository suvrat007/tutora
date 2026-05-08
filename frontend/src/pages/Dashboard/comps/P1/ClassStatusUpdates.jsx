import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import moment from 'moment';
import axiosInstance from "@/utilities/axiosInstance.jsx";
import toast from "react-hot-toast";
import useFetchUnUpdatedClasslog from "../DashboardHooks/useFetchUnUpdatedClasslog.js";
import useFetchClassLogs from "@/hooks/useFetchClassLogs.js";

const ClassStatusUpdates = () => {
    const [rerender, setRerender] = useState(false);
    const { filteredLogs, loading, error } = useFetchUnUpdatedClasslog(rerender);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);
    const [statusData, setStatusData] = useState({});
    const [openIndex, setOpenIndex] = useState(null);
    const [loadingStates, setLoadingStates] = useState({});
    const fetchClassLogs = useFetchClassLogs();

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
        if (!status) { toast.error("Please select Held or Cancelled."); return; }
        if (!status.held && !status.note?.trim()) { toast.error("Provide a cancellation reason."); return; }

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
            await axiosInstance.post("classLog/add-class-updates", { updates: [payload] }, { withCredentials: true });
            toast.success("Class updated!");
            fetchClassLogs();
            setOpenIndex(null);
            setRerender(prev => !prev);
            setStatusData(prev => { const p = { ...prev }; delete p[index]; return p; });
        } catch (err) {
            console.error("Update failed:", err);
            toast.error(err.response?.data?.message || "Update failed.");
        } finally {
            setLoadingStates(prev => ({ ...prev, [index]: false }));
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
            <div className="p-6 rounded-3xl border border-[#e6c8a8] shadow-[0_8px_24px_rgba(0,0,0,0.15)] bg-[#f8ede3] flex flex-col h-full">
                <h2 className="text-lg font-semibold text-[#5a4a3c] border-b border-[#e6c8a8] pb-2.5 mb-4 shrink-0">Pending Class Updates</h2>
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-4 text-[#7b5c4b]">
                            <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading classes...
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <p className="text-[#7b5c4b] text-center py-4">No classes to update at the moment.</p>
                    ) : (
                        <AnimatePresence>
                            {filteredLogs.map((cls, index) => (
                                <motion.div
                                    key={cls.classId}
                                    custom={index}
                                    variants={listVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="mb-4 border border-[#e6c8a8] p-4 rounded-xl bg-white shadow-md hover:shadow-lg hover:bg-[#f0d9c0] transition-all duration-300"
                                >
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => handleToggle(index)}>
                                        <div>
                                            <p className="text-sm font-semibold text-[#5a4a3c]">Batch: {cls.batchName}</p>
                                            <p className="text-xs text-[#7b5c4b]">Subject: {cls.subjectName}</p>
                                            <p className="text-xs text-[#7b5c4b]">
                                                Date: {moment(cls.date).format('YYYY-MM-DD')} | Time: {cls.scheduledTime}
                                            </p>
                                        </div>
                                        <button className="text-[#e0c4a8] text-sm flex items-center gap-1">
                                            {openIndex === index ? "Close" : "Update"} {openIndex === index ? <ChevronUp /> : <ChevronDown />}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
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
                                                            className={`px-3 py-1 rounded-lg border border-[#e6c8a8] text-sm transition-all duration-300 ${
                                                                statusData[index]?.held === (label === "Held")
                                                                    ? "bg-[#e0c4a8] text-[#5a4a3c] shadow-md"
                                                                    : "bg-white text-[#e0c4a8] hover:bg-[#f0d9c0]"
                                                            }`}
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={statusData[index]?.note || ""}
                                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                                    className="w-full border border-[#e6c8a8] p-2 rounded-md text-sm resize-y min-h-[60px] text-[#5a4a3c] focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
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
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSubmit(cls, index);
                                                    }}
                                                    disabled={loadingStates[index] || statusData[index]?.held === undefined}
                                                    className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-300 ${
                                                        loadingStates[index] || statusData[index]?.held === undefined
                                                            ? "bg-[#f0d9c0] text-[#7b5c4b] cursor-not-allowed"
                                                            : "bg-[#e0c4a8] text-[#5a4a3c] hover:bg-[#d8bca0] shadow-md"
                                                    }`}
                                                >
                                                    {loadingStates[index] ? (
                                                        <>
                                                            <Loader2 className="animate-spin w-4 h-4" /> Submitting...
                                                        </>
                                                    ) : (
                                                        "Submit Update"
                                                    )}
                                                </motion.button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        );
    }


        export default ClassStatusUpdates;