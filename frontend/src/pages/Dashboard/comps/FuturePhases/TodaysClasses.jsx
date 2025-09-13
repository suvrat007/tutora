import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance";
import { CalendarDays, NotebookText } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { getLocalDateYYYYMMDD } from '@/lib/utils.js';

const getTodayDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
};

const getTodayDate = () => getLocalDateYYYYMMDD();

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
    const [error, setError] = useState(null);
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
                    // console.log("Class updates sent:", response.data);
                }
            } catch (err) {
                console.error("Error details:", err.response?.data || err.message);
                setError("Failed to load or log classes. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        logClasses();
    }, [batches]);

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
        <div className="bg-[#f8ede3] rounded-3xl shadow-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] p-6 h-full flex flex-col overflow-hidden border border-[#e6c8a8]">
            <div className="sticky top-0 z-10 bg-[#f8ede3] pb-3">
                <h1 className="text-xl font-semibold text-[#5a4a3c] border-b border-[#e6c8a8] pb-2 flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-[#e0c4a8]" />
                    Today's Classes
                </h1>
            </div>
            <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#7b5c4b] animate-pulse">
                        <NotebookText className="w-10 h-10 text-[#e0c4a8] mb-3" />
                        <p className="text-base">Loading today's schedule...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-base font-medium p-4">{error}</div>
                ) : allClasses.length > 0 ? (
                    <AnimatePresence>
                        {allClasses.map((c, index) => (
                            <motion.div
                                key={`${c.batchId}-${c.subjectId}-${c.date}`}
                                custom={index}
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="border border-[#e6c8a8] rounded-xl p-4 bg-white hover:bg-[#f0d9c0] transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                <div className="mb-2 border-b border-[#e6c8a8] pb-2">
                                    <p className="text-lg font-semibold text-[#e0c4a8]">{c.batchName}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-sm text-[#5a4a3c] font-medium">
                                    <p><span className="text-[#7b5c4b] font-semibold">Class:</span> {c.forStandard}</p>
                                    <p><span className="text-[#7b5c4b] font-semibold">Subject:</span> {c.subjectName}</p>
                                    <p><span className="text-[#7b5c4b] font-semibold">Time:</span> {c.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="flex flex-col items-center justify-center text-[#7b5c4b] animate-pulse ">
                        <NotebookText className="w-12 h-12 mb-3 text-[#e0c4a8]" />
                        <p className="text-lg font-medium">Yay! No classes scheduled for today.</p>
                        <p className="text-sm text-[#7b5c4b] mt-2">Take a break or plan ahead 📘</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default TodaysClasses;
