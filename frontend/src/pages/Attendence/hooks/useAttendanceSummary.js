import axios from 'axios';
import { useState, useEffect } from 'react';
import axiosInstance from "@/utilities/axiosInstance.jsx";

const useAttendanceSummary = (batchName, subjectName, batches, refreshTrigger) => {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!batches.length) return;

        const controller = new AbortController();

        const fetchSummary = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = 'student/attendance/summary';
                let selectedBatch = null;
                let selectedSubject = null;

                if (batchName && subjectName) {
                    selectedBatch = batches.find((b) => b.name === batchName);
                    selectedSubject = selectedBatch?.subject.find((s) => s.name === subjectName);
                    if (!selectedBatch || !selectedSubject) {
                        setError('Invalid batch or subject selection');
                        return;
                    }
                    url += `?batchId=${selectedBatch._id}&subjectId=${selectedSubject._id}`;
                } else if (batchName) {
                    selectedBatch = batches.find((b) => b.name === batchName);
                    if (selectedBatch) url += `?batchId=${selectedBatch._id}`;
                }

                const response = await axiosInstance.get(url, { withCredentials: true, signal: controller.signal });

                let data = response.data.data || [];
                if (selectedBatch && selectedSubject) {
                    data = data.map(student => ({
                        ...student,
                        subjects: student.subjects.filter(
                            (subj) =>
                                subj.batchId?.toString() === selectedBatch._id.toString() &&
                                subj.subjectId?.toString() === selectedSubject._id.toString()
                        )
                    }));
                }
                setSummary(data.filter(st => st.subjects?.length > 0));
            } catch (err) {
                if (axios.isCancel(err)) return;
                setError('Failed to fetch attendance summary');
                console.error("Error fetching attendance summary:", err);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchSummary();
        return () => controller.abort();
    }, [batchName, subjectName, batches, refreshTrigger]);

    return { summary, loading, error };
};

export default useAttendanceSummary;
