import axiosInstance from "../../../utilities/axiosInstance.jsx";

const editStudentAttendance = async (presentStudents, subjectId, batchId, date) => {
    const errors = [];

    // Validate and format the date (keep only the date part)
    let formattedDate;
    try {
        const inputDate = new Date(date);
        if (isNaN(inputDate.getTime())) {
            throw new Error("Invalid date format");
        }
        formattedDate = inputDate.toISOString().split("T")[0]; // e.g., "2025-04-29"
        console.log("Submitting attendance for date:", formattedDate);
    } catch (error) {
        console.error("❌ Invalid date provided:", error.message);
        return [{ error: "Invalid date format provided" }];
    }

    for (const studentId of presentStudents) {
        try {
            const payload = {
                subject: subjectId,
                batch: batchId,
                present: true,
                date: formattedDate, // e.g., "2025-04-29"
            };
            console.log(`Submitting attendance for student ${studentId}`, payload);

            const response = await axiosInstance.put(`/add-attendance/${studentId}`, payload);
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