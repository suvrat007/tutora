import { useState, useEffect } from 'react';
import axiosInstance from "@/utilities/axiosInstance.jsx";

const useAttendanceSummary = (batchName, subjectName, batches, refreshTrigger, startDate = null, endDate = null) => {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!batches.length) return;

        let isMounted = true;

        const fetchSummary = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                let selectedBatch = null;
                let selectedSubject = null;

                if (batchName && subjectName) {
                    selectedBatch = batches.find((b) => b.name === batchName);
                    selectedSubject = selectedBatch?.subject.find((s) => s.name === subjectName);
                    if (!selectedBatch || !selectedSubject) {
                        if (isMounted) setError('Invalid batch or subject selection');
                        return;
                    }
                    params.set('batchId', selectedBatch._id);
                    params.set('subjectId', selectedSubject._id);
                } else if (batchName) {
                    selectedBatch = batches.find((b) => b.name === batchName);
                    if (selectedBatch) params.set('batchId', selectedBatch._id);
                }

                if (startDate) params.set('startDate', startDate);
                if (endDate) params.set('endDate', endDate);

                const paramStr = params.toString();
                const url = `student/attendance/summary${paramStr ? `?${paramStr}` : ''}`;

                const response = await axiosInstance.get(url, { withCredentials: true });

                if (isMounted) {
                    let data = (response.data.data || []);

                    // If filtering by specific batch+subject, narrow subjects shown
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
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to fetch attendance summary');
                    console.error("Error fetching attendance summary:", err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchSummary();
        return () => { isMounted = false; };
    }, [batchName, subjectName, batches, refreshTrigger, startDate, endDate]);

    return { summary, loading, error };
};

export default useAttendanceSummary;
