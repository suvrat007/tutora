import axiosInstance from "../../../../utilities/axiosInstance.jsx";

const checkAttendanceStatus = async (batchId) => {
    if (!batchId) {
        console.error("No batch ID provided");
        return { hasAttendance: false, error: "No batch ID provided" };
    }

    try {
        const response = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
        const students = response.data;

        if (!students || !Array.isArray(students) || students.length === 0) {
            console.warn("No valid students found for batch:", batchId);
            return { hasAttendance: false, error: "No students found for this batch" };
        }

        const today = new Date().toISOString().split("T")[0];

        const hasAttendance = students.some((student) => {
            const attendanceArray = student?.attendance;

            if (!attendanceArray || !Array.isArray(attendanceArray)) {
                console.warn(`No valid attendance array for student: ${student.name || student._id}`);
                return false;
            }

            return attendanceArray.some((record) => {
                if (!record || typeof record.date !== "string") {
                    console.warn(`Invalid or missing date in attendance record for student: ${student.name || student._id}`);
                    return false;
                }

                const isValidDate = /^\d{4}-\d{2}-\d{2}/.test(record.date);
                if (!isValidDate) {
                    console.warn(`Invalid date format for student: ${student.name || student._id}, Date: ${record.date}`);
                    return false;
                }

                const attendanceDate = record.date.split("T")[0];
                return attendanceDate === today;
            });
        });

        return { hasAttendance, error: null };
    } catch (error) {
        console.error("Error checking attendance:", error.message);
        return { hasAttendance: false, error: `Failed to check attendance: ${error.message}` };
    }
};

export { checkAttendanceStatus };