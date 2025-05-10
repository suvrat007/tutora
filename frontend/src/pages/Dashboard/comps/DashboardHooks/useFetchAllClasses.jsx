import axiosInstance from "../../../../utilities/axiosInstance.jsx";


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

const processBatches = (batches) => {
    const today = getTodayDay();
    const now = getCurrentTimeInMinutes();

    return batches.flatMap(batch =>
        batch.subject.flatMap(subject =>
            subject.classSchedule
                .filter(schedule => schedule.days.includes(today) && parseTimeToMinutes(schedule.time) >= now)
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

    try{
        const response = await axiosInstance.get("/get-all-batches");
        // console.log(response.data);
        const batches = response.data;
        const filtered = processBatches(batches);
        console.log(filtered);
        return filtered;
    }catch(error){
        console.log(error.message);
    }
}
export default useFetchAllClasses;


const processOverBatches = (batches) => {
    const today = getTodayDay();
    const now = getCurrentTimeInMinutes();

    return batches.flatMap(batch =>
        batch.subject.flatMap(subject =>
            subject.classSchedule
                .filter(schedule => schedule.days.includes(today) && parseTimeToMinutes(schedule.time) < now)
                .map(schedule => ({
                    batchName: batch.name,
                    id:batch._id,
                    forStandard: batch.forStandard,
                    subjectName: subject.name,
                    subjectId: subject._id,
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
        console.log(batches)
        const filtered = processOverBatches(batches);
        console.log(filtered);
        return filtered;
    } catch (error) {
        console.log(error.message);
    }
};

export {useFetchOverClasses};
