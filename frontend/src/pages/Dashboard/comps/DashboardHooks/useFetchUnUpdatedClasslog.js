import { useState, useEffect } from "react";
import moment from 'moment-timezone';
import axiosInstance from "@/utilities/axiosInstance.jsx";

const getCurrentTimeString = () => {
    return moment.tz('Asia/Kolkata').format('HH:mm');
};

const getTodayDate = () => {
    return moment.tz('Asia/Kolkata').format('YYYY-MM-DD');
};

const formatDateToYYYYMMDD = (dateString) => {
    try {
        const date = moment.tz(dateString, 'Asia/Kolkata');
        if (!date.isValid()) {
            throw new Error("Invalid date");
        }
        return date.format('YYYY-MM-DD');
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
                const nowTime = getCurrentTimeString(); // e.g., "01:28"
                const todayDate = getTodayDate(); // e.g., "2025-09-03"
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
                        if (!clsDateStr) {
                            console.warn("Invalid date format:", cls.date);
                            return;
                        }

                        // Only include un-updated classes for today where scheduled time has passed
                        const isToday = clsDateStr === todayDate;
                        const isTimePassed = isToday && time <= nowTime;

                        if (cls?.updated === false && isToday && isTimePassed) {
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