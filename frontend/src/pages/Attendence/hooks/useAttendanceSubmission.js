import { useCallback } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { getLocalTimeHHMM } from '@/lib/utils.js';
import toast from "react-hot-toast";

export const useAttendanceSubmission = (batches) => {
    const submit = useCallback(async (batchName, subjectName, date, presentIds, isValidDateTime, onSuccess) => {
        if (!batchName || !subjectName || !date || !isValidDateTime()) return false;

        const selectedBatch = batches.find((b) => b.name === batchName);
        const selectedSubject = selectedBatch?.subject.find((s) => s.name === subjectName);
        if (!selectedBatch || !selectedSubject) return false;

        try {
            await axiosInstance.patch(
                'classLog/mark-attendance',
                {
                    batch_id: selectedBatch._id,
                    subject_id: selectedSubject._id,
                    date,
                    presentIds: [...presentIds],
                    time: getLocalTimeHHMM(),
                },
                { withCredentials: true }
            );
            if (onSuccess) onSuccess();
            return true;
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to save attendance");
            return false;
        }
    }, [batches]);

    return { submit };
};
