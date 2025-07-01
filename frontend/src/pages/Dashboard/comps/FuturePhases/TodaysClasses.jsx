import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance";
import { CalendarDays, NotebookText } from "lucide-react";

const getTodayDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const processAllClasses = (batches) => {
    const today = getTodayDay();
    const todayDate = getTodayDate();
    const currentTime = getCurrentTime();

    return batches.flatMap(batch =>
        batch.subject
            .filter(subject =>
                subject.classSchedule?.days.includes(today) &&
                subject.classSchedule?.time > currentTime
            )
            .map(subject => ({
                batchName: batch.name,
                normalizedBatchName: batch.name.replace(/\s+/g, "").toLowerCase(),
                batchId: batch._id,
                subjectId: subject._id,
                subjectName: subject.name,
                time: subject.classSchedule.time,
                date: todayDate,
                forStandard: batch.forStandard,
            }))
    );
};




const TodaysClasses = () => {
    const batches = useSelector((state) => state.batches);
    const [allClasses, setAllClasses] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const logClasses = async () => {
            try {
                const processedClasses = processAllClasses(batches);
                setAllClasses(processedClasses);

                for (const cls of processedClasses) {
                    try {
                        await axiosInstance.post(
                            "/api/classLog/add-class-update",
                            {
                                batch_id: cls.batchId,
                                subject_id: cls.subjectId,
                                date: cls.date,
                                hasHeld: false,
                                note: "Auto-added from schedule"
                            },
                            { withCredentials: true }
                        );
                    } catch (err) {
                        console.error(`Error logging class [${cls.batchName} - ${cls.subjectName}]:`, err.message);
                        setError("Some classes failed to log. Please try again.");
                    }
                }
            } catch (err) {
                console.error("Error processing classes:", err.message);
                setError("Something went wrong while loading today's classes.");
            } finally {
                setLoading(false);
            }
        };

        logClasses();
    }, [batches]);

    return (
        <div className="flex flex-col h-full w-full bg-white rounded-2xl border-2 shadow-md overflow-hidden">
            <h1 className="text-lg font-semibold text-gray-800 p-4 border-b-2 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Today's Classes
            </h1>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 animate-pulse">
                    <NotebookText className="w-8 h-8 text-blue-400 mb-2" />
                    <p>Loading today's schedule...</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
                    {error && (
                        <div className="text-red-500 text-sm font-medium mb-2">
                            {error}
                        </div>
                    )}
                    {allClasses.length > 0 ? (
                        allClasses.map((c, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:shadow transition-all duration-200"
                            >
                                <div className="mb-2 border-b pb-2">
                                    <p className="text-sm font-medium text-blue-600">
                                        {c.batchName}
                                    </p>
                                </div>
                                <div className="flex justify-between text-sm text-gray-700 font-medium">
                                    <p><span className="text-gray-500">Class: </span>{c.forStandard}</p>
                                    <p><span className="text-gray-500">Subject: </span>{c.subjectName}</p>
                                    <p><span className="text-gray-500">Time: </span>{c.time}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-pulse">
                            <NotebookText className="w-10 h-10 mb-2 text-blue-400" />
                            <p className="text-md font-medium">Yay! No classes scheduled for today.</p>
                            <p className="text-sm text-gray-400 mt-1">Take a break or plan ahead 📘</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TodaysClasses;
