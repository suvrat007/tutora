import axiosInstance from "../../../utilities/axiosInstance.jsx";

const editStudentAttendance = async (presentStudentIds, subjectId, batchId, date) => {
    const errors = [];

    // Format the date once instead of per loop
    const formattedDate = new Date(date).toISOString();

    for (const studentId of presentStudentIds) {
        try {
            const response = await axiosInstance.post(`/add-attendance/${studentId}`, {
                subject: subjectId,
                batch: batchId,
                present: true,
                date: formattedDate,
            });
            console.log(`✅ Attendance added for student ${studentId}`, response.data);
        } catch (error) {
            console.error(`❌ Error adding attendance for ${studentId}:`, error.response?.data || error.message);
            errors.push({
                studentId,
                error: error.response?.data?.message || error.message
            });
        }
    }

    return errors; // You can handle/display these on the frontend if needed
};

export default editStudentAttendance;
