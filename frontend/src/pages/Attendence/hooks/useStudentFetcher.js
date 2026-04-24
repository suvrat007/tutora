import { useCallback } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import toast from "react-hot-toast";

export const useStudentFetcher = (batches, setStudents, setMarkedPresentStudents, setPresentIds, setLoading) => {
    const fetchStudents = useCallback(async (batchName, subjectName, date) => {
        if (!batchName || !subjectName || !date) return;

        const selectedBatch = batches.find((b) => b.name === batchName);
        const selectedSubject = selectedBatch?.subject.find((s) => s.name === subjectName);
        const batchId = selectedBatch?._id;
        const subjectId = selectedSubject?._id;

        if (!batchId || !subjectId) {
            toast.error("Invalid batch or subject selection");
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.get(
                `/api/classLog/attendance-status?batchId=${batchId}&subjectId=${subjectId}&date=${date}`,
                { withCredentials: true }
            );

            const { students, presentIds, markedPresentStudents } = response.data;
            setStudents(students);
            setMarkedPresentStudents(markedPresentStudents);
            setPresentIds(new Set(presentIds));

            if (markedPresentStudents.length > 0) {
                toast(`${markedPresentStudents.length} students already marked present`, { icon: '📋' });
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to fetch attendance status");
            setStudents([]);
            setMarkedPresentStudents([]);
            setPresentIds(new Set());
        } finally {
            setLoading(false);
        }
    }, [batches, setStudents, setMarkedPresentStudents, setPresentIds, setLoading]);

    return { fetchStudents };
};
