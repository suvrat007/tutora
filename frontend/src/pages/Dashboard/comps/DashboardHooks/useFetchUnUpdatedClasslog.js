import { useState, useEffect } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";

const getCurrentTimeString = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // "HH:MM"
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

const useFetchUnUpdatedClasslog = (rerenderKey = false) => {
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axiosInstance.get(`/api/classLog/getAllClasslogs`, { withCredentials: true });
                const allLogs = response.data;
                const nowTime = getCurrentTimeString();
                const todayDate = getTodayDate();

                console.log(response.data)
                const result = [];

                allLogs.forEach(log => {
                    const batch = log.batch_id;
                    const subject = batch.subject.find(sub => sub._id === log.subject_id);
                    if (!subject?.classSchedule) return;

                    const { time } = subject.classSchedule;

                    log.classes.forEach(cls => {
                        const classDate = new Date(cls.date).toISOString().split("T")[0];
                        const isToday = classDate === todayDate;
                        const isPastOrToday = classDate <= todayDate;
                        const isTimePassed = isPastOrToday && (!isToday || time <= nowTime);

                        if (cls.updated === false && isTimePassed) {
                            result.push({
                                logId: log._id,
                                classId: cls._id,
                                batchId: batch._id,
                                batchName: batch.name,
                                subjectId: subject._id,
                                subjectName: subject.name,
                                attendance: cls.attendance || [],
                                date: classDate,
                                scheduledTime: time
                            });
                        }
                    });
                });

                setFilteredLogs(result);
            } catch (err) {
                console.error("Error fetching logs", err);
                setError("Failed to fetch class logs.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [rerenderKey]);

    return { filteredLogs, loading, error };
};

export default useFetchUnUpdatedClasslog;
