import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useAttendanceSummary from '@/pages/Attendence/hooks/useAttendanceSummary';

export const useCombinedStudentAttendance = (batchName, subjectName, batches) => {
    const students = useSelector((state) => state.students.groupedStudents) || [];

    // Fetch all attendance from API — filtering is done client-side below
    const { summary: attendance, loading, error: attendanceError } = useAttendanceSummary('', '', batches, null);

    const combinedData = useMemo(() => {
        if (!Array.isArray(students) || !Array.isArray(batches)) {
            return { data: [], error: 'Invalid data structure' };
        }

        const getSubjectNames = (subjectIds, batchId) => {
            if (!Array.isArray(subjectIds) || !batchId) return 'None';
            const batch = batches.find((b) => b._id === batchId);
            if (!batch || !Array.isArray(batch.subject)) return 'None';
            return subjectIds
                .map((sid) => batch.subject.find((s) => s._id === sid)?.name)
                .filter(Boolean)
                .join(', ') || 'None';
        };

        const calculateAttendancePercentage = (attended, total) => {
            if (!total) return 0;
            return parseFloat(((attended / total) * 100).toFixed(2));
        };

        try {
            let filteredStudents = [];

            if (!batchName) {
                filteredStudents = students.flatMap((batch) => {
                    if (!batch.students || !Array.isArray(batch.students)) return [];
                    return batch.students.map((student) => ({
                        ...student,
                        batchId: batch.batchId,
                        batchName: batch.batchName,
                        subjectId: Array.isArray(student.subjectId) ? student.subjectId : [],
                    }));
                });
            } else {
                const selectedBatch = batches.find((b) => b.name === batchName);
                if (!selectedBatch) return { data: [], error: 'Invalid batch selection' };

                const batchStudents = students.find((s) => s.batchId === selectedBatch._id);
                if (!batchStudents || !Array.isArray(batchStudents.students)) {
                    return { data: [], error: 'No students found for selected batch' };
                }

                filteredStudents = batchStudents.students.map((student) => ({
                    ...student,
                    batchId: selectedBatch._id,
                    batchName: selectedBatch.name,
                    subjectId: Array.isArray(student.subjectId) ? student.subjectId : [],
                }));
            }

            if (subjectName && batchName) {
                const selectedBatch = batches.find((b) => b.name === batchName);
                if (!selectedBatch) return { data: [], error: 'Invalid batch selection for subject filtering' };
                const selectedSubject = selectedBatch.subject?.find((s) => s.name === subjectName);
                if (!selectedSubject) return { data: [], error: 'Invalid subject selection' };
                filteredStudents = filteredStudents.filter((student) =>
                    student.subjectId.includes(selectedSubject._id)
                );
            }

            const data = filteredStudents.map((student) => {
                const attendanceRecord = attendance.find(
                    (att) => att.studentId?.toString() === student._id?.toString()
                );

                let percentage = 0;
                let attended = 0;
                let total = 0;

                if (attendanceRecord && Array.isArray(attendanceRecord.subjects)) {
                    if (subjectName && batchName) {
                        const selectedBatch = batches.find((b) => b.name === batchName);
                        const selectedSubject = selectedBatch?.subject?.find((s) => s.name === subjectName);

                        if (selectedBatch && selectedSubject) {
                            const subjectAttendance = attendanceRecord.subjects.find(
                                (subj) =>
                                    subj.batchId?.toString() === selectedBatch._id?.toString() &&
                                    subj.subjectId?.toString() === selectedSubject._id?.toString()
                            );
                            if (subjectAttendance) {
                                attended = subjectAttendance.attended || 0;
                                total = subjectAttendance.total || 0;
                                percentage = subjectAttendance.percentage || calculateAttendancePercentage(attended, total);
                            }
                        }
                    } else {
                        const relevantSubjects = batchName
                            ? attendanceRecord.subjects.filter(
                                (subj) => subj.batchId?.toString() === student.batchId?.toString()
                              )
                            : attendanceRecord.subjects;

                        if (relevantSubjects.length > 0) {
                            attended = relevantSubjects.reduce((sum, subj) => sum + (subj.attended || 0), 0);
                            total = relevantSubjects.reduce((sum, subj) => sum + (subj.total || 0), 0);
                            percentage = calculateAttendancePercentage(attended, total);
                        }
                    }
                }

                let subjectInfo = {
                    subjectId: student.subjectId,
                    subjectName: subjectName || 'All Subjects',
                    subjects: getSubjectNames(student.subjectId, student.batchId),
                };

                if (subjectName && batchName) {
                    const selectedBatch = batches.find((b) => b.name === batchName);
                    const selectedSubject = selectedBatch?.subject?.find((s) => s.name === subjectName);
                    if (selectedSubject) {
                        subjectInfo = {
                            subjectId: [selectedSubject._id],
                            subjectName: subjectName,
                            subjects: subjectName,
                        };
                    }
                }

                return {
                    studentId: student._id,
                    studentName: student.name,
                    batchId: student.batchId,
                    batchName: student.batchName,
                    ...subjectInfo,
                    attended,
                    total,
                    percentage,
                    grade: student.grade,
                    school_name: student.school_name,
                    admission_date: student.admission_date,
                    contact_info: student.contact_info,
                    address: student.address,
                    fee_status: student.fee_status,
                };
            });

            return { data, error: '' };
        } catch (err) {
            console.error('Error in useCombinedStudentAttendance:', err);
            return { data: [], error: 'An error occurred while processing student data' };
        }
    }, [batchName, subjectName, batches, students, attendance]);

    if (attendanceError) return { data: [], error: attendanceError, loading };
    return { ...combinedData, loading };
};
