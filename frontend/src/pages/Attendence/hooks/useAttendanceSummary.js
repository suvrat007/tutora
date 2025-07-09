import { useSelector, useDispatch } from 'react-redux';

const useAttendanceSummary = (batchName, subjectName, batches) => {
    const { data: summary, loading, error } = useSelector((state) => state.attendance);

    if (!batchName || !subjectName || !batches.length) {
        return { summary: [], loading, error };
    }

    const selectedBatch = batches.find((b) => b.name === batchName);
    const selectedSubject = selectedBatch?.subject.find((s) => s.name === subjectName);

    if (!selectedBatch || !selectedSubject) {
        return { summary: [], loading, error: 'Invalid batch or subject selection' };
    }

    const filteredSummary = summary
        .filter((student) =>
            student.subjects.some(
                (subj) =>
                    subj.batchId.toString() === selectedBatch._id.toString() &&
                    subj.subjectId.toString() === selectedSubject._id.toString()
            )
        )
        .map((student) => ({
            ...student,
            subjects: student.subjects.filter(
                (subj) =>
                    subj.batchId.toString() === selectedBatch._id.toString() &&
                    subj.subjectId.toString() === selectedSubject._id.toString()
            ),
        }));

    return { summary: filteredSummary, loading, error };
};

export default useAttendanceSummary;