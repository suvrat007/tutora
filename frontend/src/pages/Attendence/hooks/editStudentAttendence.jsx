import axiosInstance from "../../../utilities/axiosInstance.jsx";

const editStudentAttendence = async (presentStudentIds, subjectId, batchId ,date) => {
    try {
        for (const studentId of presentStudentIds) {
            const response = await axiosInstance.post(`/add-attendance/${studentId}`, {
                subject: subjectId,
                batch: batchId,
                present: true,
                date: date,
            });
            console.log(`Attendance added for student ${studentId}`, response.data);
        }
    } catch (error) {
        console.error("Error adding attendance:", error);
    }
}
export default editStudentAttendence;