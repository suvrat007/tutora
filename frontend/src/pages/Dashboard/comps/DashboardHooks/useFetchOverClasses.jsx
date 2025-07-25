import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const getTodayDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
};

const getCurrentTimeInMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
};

const processOverBatches = (batches) => {
    const today = getTodayDay();
    const now = getCurrentTimeInMinutes();

    return batches.flatMap(batch =>
        batch.subject.flatMap(subject =>
            subject.classSchedule
                .filter(schedule =>
                    schedule.days.includes(today) &&
                    parseTimeToMinutes(schedule.time) < now
                )
                .map(schedule => ({
                    batchName: batch.name,
                    id: batch._id,
                    forStandard: batch.forStandard,
                    subjectName: subject.name,
                    subject_id: subject._id,
                    date: subject.date || new Date().toISOString(),
                    time: schedule.time,
                    days: schedule.days
                }))
        )
    );
};

const useFetchOverClasses = () => {
    const batches = useSelector((state) => state.batches);
    const [overClasses, setOverClasses] = useState([]);

    useEffect(() => {
        const processedBatches = processOverBatches(batches);
        setOverClasses(processedBatches);
    }, [batches]);

    return { overClasses };
};

export default useFetchOverClasses;