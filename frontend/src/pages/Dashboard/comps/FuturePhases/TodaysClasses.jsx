import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance";
import { CalendarDays, NotebookText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const getTodayDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
};

const getTodayDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const processAllClasses = (batches) => {
    const today = getTodayDay();
    const todayDate = getTodayDate();
    const now = new Date();
    const seen = new Set();

    return batches.flatMap(batch =>
        batch.subject
            .filter(subject => {
                if (!subject.classSchedule?.days || !subject.classSchedule?.time) return false;

                const classTime = subject.classSchedule.time;
                const classDateTime = new Date(`${todayDate}T${classTime}:00`);

                return subject.classSchedule.days.includes(today) && classDateTime > now;
            })
            .map(subject => {
                const key = `${batch._id}-${subject._id}`;
                if (seen.has(key)) return null;
                seen.add(key);
                return {
                    batchName: batch.name,
                    normalizedBatchName: batch.name.replace(/\s+/g, "").toLowerCase(),
                    batchId: batch._id,
                    subjectId: subject._id,
                    subjectName: subject.name,
                    time: subject.classSchedule.time,
                    date: todayDate,
                    forStandard: batch.forStandard,
                };
            })
            .filter(cls => cls !== null)
    );
};

const TodaysClasses = () => {
    const batches = useSelector((state) => state.batches);
    const [allClasses, setAllClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const hasLoggedRef = useRef(false);

    useEffect(() => {
        if (!batches || batches.length === 0 || hasLoggedRef.current) {
            setLoading(false);
            return;
        }

        hasLoggedRef.current = true;

        const logClasses = async () => {
            try {
                const processedClasses = processAllClasses(batches);
                setAllClasses(processedClasses);

                if (processedClasses.length > 0) {
                    const updatesToSend = processedClasses.map(cls => ({
                        batch_id: cls.batchId,
                        subject_id: cls.subjectId,
                        date: cls.date,
                        hasHeld: false,
                        note: "No Data",
                    }));

                    await axiosInstance.post(
                        "/api/classLog/add-class-updates",
                        { updates: updatesToSend },
                        { withCredentials: true }
                    );
                }
            } catch (err) {
                toast.error("Failed to load today's classes.");
            } finally {
                setLoading(false);
            }
        };

        logClasses();
    }, [batches]);

    return (
        <div className="p-6 bg-gradient-to-br from-[#fef5e7] to-[#e7c6a5] rounded-xl border border-[#ddb892] shadow-lg h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#4a3a2c] mb-2 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-[#f7c7a3]"/>
                    Today's Classes
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-[#f4e3d0] to-[#e7c6a5] rounded-full"></div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <AnimatePresence>
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full text-[#f7c7a3]"
                        >
                            <NotebookText className="w-8 h-8 text-[#f7c7a3] mb-3 animate-pulse" />
                            <p className="text-sm font-medium text-[#4a3a2c]">Loading today's schedule...</p>
                        </motion.div>
                    ) : allClasses.length > 0 ? (
                        allClasses.map((c, index) => (
                            <motion.div
                                key={`${c.batchId}-${c.subjectId}-${c.date}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-[#f4e3d0]/80 backdrop-blur-sm rounded-xl border border-[#ddb892] p-4 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <div className="mb-3 pb-2 border-b border-[#ddb892]">
                                    <p className="text-base font-semibold text-[#4a3a2c]">{c.batchName}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-[#f7c7a3] font-medium text-xs uppercase tracking-wide">Class</span>
                                        <span className="text-[#4a3a2c] font-medium">{c.forStandard}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[#f7c7a3] font-medium text-xs uppercase tracking-wide">Subject</span>
                                        <span className="text-[#4a3a2c] font-medium">{c.subjectName}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[#f7c7a3] font-medium text-xs uppercase tracking-wide">Time</span>
                                        <span className="text-[#4a3a2c] font-medium">{c.time}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full text-[#6b4c3b]"
                        >
                            <div className="text-4xl mb-3">📚</div>
                            <p className="text-lg font-medium text-[#4a3a2c]">No classes scheduled for today.</p>
                            <p className="text-sm text-[#a08a6e] mt-1">Enjoy your day!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TodaysClasses;