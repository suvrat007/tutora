import axiosInstance from "../../../../utilities/axiosInstance.jsx";

// Get current day and time
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


const processUpcomingBatches = (batches) => {
    const today = getTodayDay();
    const now = getCurrentTimeInMinutes();

    return batches.flatMap(batch =>
        batch.subject.flatMap(subject =>
            subject.classSchedule
                .filter(schedule =>
                    schedule.days.includes(today) &&
                    parseTimeToMinutes(schedule.time) >= now
                )
                .map(schedule => ({
                    batchName: batch.name,
                    forStandard: batch.forStandard,
                    subjectName: subject.name,
                    time: schedule.time,
                    days: schedule.days
                }))
        )
    );
};

const useFetchAllClasses = async () => {
    try {
        const response = await axiosInstance.get("/get-all-batches");
        const batches = response.data;
        return processUpcomingBatches(batches);
    } catch (error) {
        console.error("Error fetching upcoming classes:", error.message);
        return [];
    }
};
export default useFetchAllClasses;



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
                    date:subject.date,
                    time: schedule.time,
                    days: schedule.days
                }))
        )
    );
};

const useFetchOverClasses = async () => {
    try {
        const response = await axiosInstance.get("/get-all-batches");
        const batches = response.data;
        return processOverBatches(batches);
    } catch (error) {
        console.error("Error fetching over classes:", error.message);
        return [];
    }
};

export { useFetchOverClasses };

