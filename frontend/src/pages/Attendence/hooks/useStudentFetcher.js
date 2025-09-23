import { useCallback } from "react";
import { getLocalDateYYYYMMDD } from '@/lib/utils.js';

export const useStudentFetcher = (
    batches,
    groupedStudents,
    classLogs,
    setStudents,
    setMarkedPresentStudents,
    setPresentIds,
    setSuccess,
    setError
) => {
    const formatDateToYYYYMMDD = useCallback((dateInput) => getLocalDateYYYYMMDD(dateInput), []);

    const fetchStudents = useCallback((batchName, subjectName, date, isValidDateTime, errorMessage) => {
        try {
            if (!batchName || !subjectName || !date) {
                setError("All fields are required.");
                return;
            }

            if (!isValidDateTime()) {
                setError(errorMessage);
                return;
            }

            const selectedBatch = batches.find((b) => b.name === batchName);
            const selectedSubject = selectedBatch?.subject.find((s) => s.name === subjectName);
            const batchId = selectedBatch?._id;
            const subjectId = selectedSubject?._id;

            if (!batchId || !subjectId) {
                setError("Invalid batch or subject selection");
                return;
            }

            const batchGroup = groupedStudents.find((g) => g.batchName === batchName) || {};
            const allStudents = batchGroup.students?.flatMap((s) => s) || [];

            const filteredStudents = allStudents.filter((s) =>
                s.subjectId?.includes(subjectId)
            );

            const classLog = classLogs.find(
                (c) =>
                    c.batch_id?._id?.toString() === batchId.toString() &&
                    c.subject_id?.toString() === subjectId.toString()
            );

            if (!classLog) {
                setError("No class log found for this batch and subject.");
                return;
            }

            const classesForDate = classLog.classes.filter(
                (c) => formatDateToYYYYMMDD(c.date) === formatDateToYYYYMMDD(date)
            );

            let alreadyMarked = [];

            if (classesForDate.length > 0 && classesForDate[0].attendance?.length > 0) {
                alreadyMarked = classesForDate[0].attendance
                    .map((a) => {
                        const student = filteredStudents.find(
                            (s) => s._id === a.studentIds?._id
                        );
                        return student ? { ...student, time: a.time } : null;
                    })
                    .filter(Boolean);
            }

            setStudents(filteredStudents);
            setMarkedPresentStudents(alreadyMarked);
            setPresentIds(new Set());
            setSuccess(
                alreadyMarked.length
                    ? `${alreadyMarked.length} students already marked present.`
                    : "No previous attendance found for this date."
            );
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to fetch students. Please try again.");
        }
    }, [batches, groupedStudents, classLogs, formatDateToYYYYMMDD, setStudents, setMarkedPresentStudents, setPresentIds, setSuccess, setError]);

    return { fetchStudents };
};