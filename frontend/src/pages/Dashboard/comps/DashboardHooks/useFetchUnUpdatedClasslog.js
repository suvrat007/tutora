import { useState, useEffect } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";

const getCurrentTimeString = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
};

const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatDateToYYYYMMDD = (dateString) => {
    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return null;
    }
};

const useFetchUnUpdatedClasslog = (rerenderKey = false) => {
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get("/api/classLog/getAllClasslogs", {
                    withCredentials: true
                });

                const allLogs = response.data;
                const nowTime = getCurrentTimeString();
                const todayDate = getTodayDate();
                console.log(allLogs);
                const result = [];

                allLogs.forEach(log => {
                    const batch = log.batch_id;

                    if (!batch || !batch.subject) {
                        console.warn("Missing batch or subject:", log);
                        return;
                    }

                    const subject = batch.subject.find(
                        sub => sub._id.toString() === log.subject_id.toString()
                    );

                    if (!subject?.classSchedule?.time) {
                        console.warn("Missing subject schedule:", log);
                        return;
                    }

                    const { time } = subject.classSchedule;

                    log.classes.forEach(cls => {
                        // Convert the date string to YYYY-MM-DD format
                        const clsDateStr = formatDateToYYYYMMDD(cls.date);
                        // console.log(clsDateStr)
                        if (!clsDateStr) {
                            console.warn("Invalid date format:", cls.date);
                            return;
                        }

                        const isToday = clsDateStr === todayDate;
                        const isPastOrToday = clsDateStr <= todayDate;
                        const isTimePassed = isPastOrToday && (!isToday || time <= nowTime);

                        if (cls?.updated === false && isTimePassed) {
                            result.push({
                                logId: log._id,
                                classId: cls._id,
                                batchId: batch._id,
                                batchName: batch.name,
                                subjectId: subject._id,
                                subjectName: subject.name,
                                hasHeld: cls.hasHeld,
                                note: cls.note,
                                attendance: cls.attendance || [],
                                date: clsDateStr,
                                scheduledTime: time,
                                originalDate: cls.date
                            });
                        }
                    });
                });

                setFilteredLogs(result);
            } catch (err) {
                console.error("Error fetching class logs:", err);
                setError("Failed to fetch class logs. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [rerenderKey]);

    return { filteredLogs, loading, error };
};

export default useFetchUnUpdatedClasslog;