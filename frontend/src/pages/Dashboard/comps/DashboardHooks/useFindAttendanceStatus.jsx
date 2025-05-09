import axiosInstance from "../../../../utilities/axiosInstance.jsx";

const checkAttendanceStatus = async (batchId) => {
    if (!batchId) return { hasAttendance: false, error: "No batch ID provided" };

    try {
        const response = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
        const students = response.data;

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Check if any student has attendance for today
        const hasAttendance = students.some((student) => {
            // Skip if attendance is null, undefined, or not a string/object
            if (!student.attendance || typeof student.attendance !== "string") {
                return false;
            }

            // Validate attendance as a date string
            try {
                // Check if the string matches ISO date format (e.g., "2025-05-08T12:00:06.139Z")
                const isValidDateString = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(student.attendance);
                if (!isValidDateString) {
                    console.warn(`Invalid attendance format for student: ${student.attendance}`);
                    return false;
                }

                // Extract YYYY-MM-DD from valid ISO date string
                const attendanceDate = student.attendance.split("T")[0];
                return attendanceDate === today;
            } catch (error) {
                console.warn(`Invalid attendance date for student: ${student.attendance}, Error: ${error.message}`);
                return false;
            }
        });

        return { hasAttendance, error: null };
    } catch (error) {
        console.error("Error checking attendance:", error.message);
        return { hasAttendance: false, error: error.message };
    }
};

export { checkAttendanceStatus };