import axiosInstance from "../../../utilities/axiosInstance.jsx";

const editStudentAttendance = async (presentStudents, subjectId, batchId, date) => {
    const errors = [];

    // Validate and format the date
    let formattedDate;
    try {
        const inputDate = new Date(date);

        if (isNaN(inputDate.getTime())) {
            throw new Error("Invalid date format");
        }

        // Adjust date forward by 1 day to compensate for backend UTC conversion
        const adjustedDate = new Date(inputDate);
        adjustedDate.setDate(inputDate.getDate() + 1);

        // Format as YYYY-MM-DD
        const year = adjustedDate.getFullYear();
        const month = String(adjustedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(adjustedDate.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`; // e.g., "2025-05-16" for input "2025-05-15"
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
                date: formattedDate,
            };
            console.log(`Submitting attendance for student ${studentId}`, JSON.stringify(payload, null, 2));

            const response = await axiosInstance.put(`/add-attendance/${studentId}`, payload);
            console.log(`✅ Attendance added for student ${studentId}`, JSON.stringify(response.data, null, 2));
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