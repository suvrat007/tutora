import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import axios from "axios";
import {useFetchOverClasses} from "@/pages/Dashboard/comps/DashboardHooks/useFetchAllClasses.jsx";
import axiosInstance from "@/utilities/axiosInstance.jsx";

const ClassStatusForm = () => {
    const [overClasses, setOverClasses] = useState([]);
    const [error, setError] = useState(null);
    const [openIndex, setOpenIndex] = useState(null);
    const [statusData, setStatusData] = useState({});
    const [loadingStates, setLoadingStates] = useState({});

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const classes = await useFetchOverClasses();
                const finalClasses = [];

                if (!Array.isArray(classes)) throw new Error("Invalid class data");

                for (const classItem of classes) {
                    const { id: batch_id, subject_id, date } = classItem;

                    try {
                        const response = await axiosInstance.get(`/check-class-in-log/${batch_id}`, {
                            params: {
                                subject_id,
                                date: date.split("T")[0]  // Ensure it's in YYYY-MM-DD
                            }
                        });

                        // If class log doesn't exist, add to final list
                        if (!response.data.exists) {
                            finalClasses.push(classItem);
                        }
                    } catch (checkError) {
                        console.error(`Error checking log for batch ${batch_id}:`, checkError);
                    }
                }

                setOverClasses(finalClasses);
            } catch (err) {
                setError(`Failed to fetch classes: ${err.message}`);
            }
        };

        fetchClasses();
    }, []);


    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleStatusChange = (index, held) => {
        setStatusData((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                held,
                error: null
            }
        }));
    };

    const handleInputChange = (index, value) => {
        setStatusData((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                note: value,
                error: null
            }
        }));
    };

    const handleSubmit = async (classInfo, index) => {
        const classStatus = statusData[index];

        if (!classStatus?.note?.trim()) {
            return setStatusData((prev) => ({
                ...prev,
                [index]: {
                    ...prev[index],
                    error: "Note or reason is required."
                }
            }));
        }

        const payload = {
            batchName: classInfo.batchName,
            subject_id: classInfo.subject_id,
            date: new Date().toISOString(),
            hasHeld: classStatus.held,
            note: classStatus.note
        };

        try {
            setLoadingStates((prev) => ({ ...prev, [index]: true }));
            await axiosInstance.post("/add-class-update", payload);
            setLoadingStates((prev) => ({ ...prev, [index]: false }));

            setOverClasses((prev) => prev.filter((_, i) => i !== index));

            setOpenIndex(null);
            setStatusData((prev) => {
                const newData = { ...prev };
                delete newData[index];
                return newData;
            });

            alert("Class log submitted successfully");
        } catch (err) {
            console.error("Submission failed", err);
            setLoadingStates((prev) => ({ ...prev, [index]: false }));
            alert("Failed to submit class log.");
        }
    };


    return (
        <div className="rounded-2xl shadow-xl p-6 border border-gray-200 h-[20em] overflow-y-auto w-full sm:w-[90%] md:w-[70%] lg:w-[50%] bg-white">
            <h1 className="text-xl font-semibold mb-4 text-gray-800">Set Today's Class Status & Reminder</h1>

            {error ? (
                <p className="text-red-500 text-sm">{error}</p>
            ) : overClasses.length === 0 ? (
                <p className="text-gray-500">No classes over yet.</p>
            ) : (
                <div className="space-y-4">
                    {overClasses.map((val, index) => (
                        <div key={index} className="rounded-xl border border-gray-200 shadow-sm p-4 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-medium text-base text-gray-800">Batch: {val.batchName}</h2>
                                    <p className="text-sm text-gray-500">Subject: {val.subjectName}</p>
                                </div>
                                <button
                                    onClick={() => handleToggle(index)}
                                    className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                                >
                                    Update {openIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 space-y-3 overflow-hidden transition-all"
                                    >
                                        {/* Held / Cancelled Buttons */}
                                        <div className="flex gap-2">
                                            {["Held", "Cancelled"].map((label) => (
                                                <button
                                                    key={label}
                                                    onClick={() => handleStatusChange(index, label === "Held")}
                                                    className={`px-3 py-1 rounded-lg border text-sm transition ${
                                                        statusData[index]?.held === (label === "Held")
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-white text-blue-600 hover:bg-blue-100"
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Note Input */}
                                        <input
                                            type="text"
                                            placeholder={
                                                statusData[index]?.held
                                                    ? "What was done in class?"
                                                    : "Reason for cancellation"
                                            }
                                            value={statusData[index]?.note || ""}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />

                                        {/* Error */}
                                        {statusData[index]?.error && (
                                            <p className="text-sm text-red-500">{statusData[index]?.error}</p>
                                        )}

                                        {/* Submit */}
                                        <button
                                            onClick={() => handleSubmit(val, index)}
                                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-medium transition"
                                            disabled={loadingStates[index]}
                                        >
                                            {loadingStates[index] ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
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
            )}
        </div>
    );
};

export default ClassStatusForm;
