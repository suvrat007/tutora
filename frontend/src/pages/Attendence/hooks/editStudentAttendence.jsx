import axiosInstance from "../../../utilities/axiosInstance.jsx";

const editStudentAttendance = async (presentStudentIds, subjectId, batchId, date) => {
    const errors = [];

    let formattedDateTime;  // Move declaration here so it's accessible below

    try {
        // Parse the date provided (keep only the date part)
        const inputDate = new Date(date);
        if (isNaN(inputDate.getTime())) {
            throw new Error("Invalid date format");
        }

        // Get current time (local)
        const now = new Date();

        // Set current time (hours, minutes, seconds, milliseconds) into inputDate
        inputDate.setHours(
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
            now.getMilliseconds()
        );

        // Convert to ISO string
        formattedDateTime = inputDate.toLocaleString('sv-SE').replace(' ', 'T');

    } catch (error) {
        console.error("❌ Invalid date provided:", error.message);
        return [{ error: "Invalid date format provided" }];
    }

    // Process each student
    for (const studentId of presentStudentIds) {
        try {
            const response = await axiosInstance.put(`/add-attendance/${studentId}`, {
                subject: subjectId,
                batch: batchId,
                present: true,
                date: formattedDateTime,  // now correctly available here
            });
            console.log(`✅ Attendance added for student ${studentId}`, response.data);
        } catch (error) {
            console.error(
                `❌ Error adding attendance for student ${studentId}:`,
                error.response?.data || error.message
            );
            errors.push({
                studentId,
                error: error.response?.data?.message || error.message,
            });
        }
    }

    return errors;
};

export default editStudentAttendance;
