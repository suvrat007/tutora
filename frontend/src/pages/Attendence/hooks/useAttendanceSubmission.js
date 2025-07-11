import { useCallback } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";

export const useAttendanceSubmission = (
    batches,
    fetchAllClassLogs,fetchAttendance,
    setLoading,
    setError,
    setSuccess
) => {
    const submit = useCallback(async (
        batchName,
        subjectName,
        date,
        presentIds,
        isValidDateTime,
        errorMessage,
        refetchStudents
    ) => {
        try {
            if (!batchName || !subjectName || !date) {
                return setError("All fields required");
            }

            if (!isValidDateTime()) {
                return setError(errorMessage);
            }

            if (!presentIds.size) {
                return setError("No students marked present");
            }

            setLoading(true);

            const selectedBatch = batches.find((b) => b.name === batchName);
            const selectedSubject = selectedBatch?.subject.find((s) => s.name === subjectName);

            const res = await axiosInstance.patch(
                "api/classLog/mark-attendance",
                {
                    batch_id: selectedBatch._id,
                    subject_id: selectedSubject._id,
                    date,
                    presentIds: [...presentIds],
                },
                { withCredentials: true }
            );

            setSuccess(res.data.message || "Attendance marked successfully");
            await fetchAllClassLogs();
            await fetchAttendance()
            refetchStudents();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to submit attendance");
        } finally {
            setLoading(false);
        }
    }, [batches, fetchAttendance,fetchAllClassLogs, setLoading, setError, setSuccess]);

    return { submit };
};
