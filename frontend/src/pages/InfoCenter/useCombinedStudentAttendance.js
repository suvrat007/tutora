import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useCombinedStudentAttendance = (batchName, subjectName, batches) => {
    const students = useSelector((state) => state.students.groupedStudents) || [];
    const attendance = useSelector((state) => state.attendance.data) || [];

    const combinedData = useMemo(() => {
        // Input validation
        if (!Array.isArray(students) || !Array.isArray(batches)) {
            return { data: [], error: 'Invalid data structure' };
        }

        // Helper function to get subject names from subjectIds
        const getSubjectNames = (subjectIds, batchId) => {
            if (!Array.isArray(subjectIds) || !batchId) return 'None';

            const batch = batches.find((b) => b._id === batchId);
            if (!batch || !Array.isArray(batch.subject)) return 'None';

            const subjectNames = subjectIds
                .map((sid) => batch.subject.find((s) => s._id === sid)?.name)
                .filter(Boolean)
                .join(', ');
            return subjectNames || 'None';
        };

        // Helper function to safely calculate attendance percentage
        const calculateAttendancePercentage = (attended, total) => {
            if (total === 0) return 0;
            return parseFloat(((attended / total) * 100).toFixed(2));
        };

        let filteredStudents = [];

        try {
            // If no batchName is selected, include all students from all batches
            if (!batchName) {
                filteredStudents = students.flatMap((batch) => {
                    if (!batch.students || !Array.isArray(batch.students)) return [];

                    return batch.students.map((student) => ({
                        ...student,
                        batchId: batch.batchId,
                        batchName: batch.batchName,
                        subjectId: Array.isArray(student.subjectId) ? student.subjectId : []
                    }));
                });
            } else {
                // Filter students by selected batch
                const selectedBatch = batches.find((b) => b.name === batchName);
                if (!selectedBatch) {
                    return { data: [], error: 'Invalid batch selection' };
                }

                const batchStudents = students.find((s) => s.batchId === selectedBatch._id);
                if (!batchStudents || !Array.isArray(batchStudents.students)) {
                    return { data: [], error: 'No students found for selected batch' };
                }

                filteredStudents = batchStudents.students.map((student) => ({
                    ...student,
                    batchId: selectedBatch._id,
                    batchName: selectedBatch.name,
                    subjectId: Array.isArray(student.subjectId) ? student.subjectId : []
                }));
            }

            // If subjectName is provided, filter students enrolled in that subject
            if (subjectName && batchName) {
                const selectedBatch = batches.find((b) => b.name === batchName);
                if (!selectedBatch) {
                    return { data: [], error: 'Invalid batch selection for subject filtering' };
                }

                const selectedSubject = selectedBatch.subject?.find((s) => s.name === subjectName);
                if (!selectedSubject) {
                    return { data: [], error: 'Invalid subject selection' };
                }

                filteredStudents = filteredStudents.filter((student) =>
                    student.subjectId.includes(selectedSubject._id)
                );
            }

            // Combine with attendance data
            const data = filteredStudents.map((student) => {
                const attendanceRecord = attendance.find((att) => att.studentId === student._id);
                let percentage = 0;
                let attended = 0;
                let total = 0;

                if (attendanceRecord && Array.isArray(attendanceRecord.subjects)) {
                    if (subjectName && batchName) {
                        // Get attendance for specific subject
                        const selectedBatch = batches.find((b) => b.name === batchName);
                        const selectedSubject = selectedBatch?.subject?.find((s) => s.name === subjectName);

                        if (selectedBatch && selectedSubject) {
                            const subjectAttendance = attendanceRecord.subjects.find(
                                (subj) => subj.batchId === selectedBatch._id && subj.subjectId === selectedSubject._id
                            );

                            if (subjectAttendance) {
                                attended = subjectAttendance.attended || 0;
                                total = subjectAttendance.total || 0;
                                percentage = subjectAttendance.percentage || calculateAttendancePercentage(attended, total);
                            }
                        }
                    } else {
                        // Calculate average attendance across all subjects for this student
                        const subjectAttendances = attendanceRecord.subjects.filter(
                            (subj) => filteredStudents.some((s) => s.batchId === subj.batchId)
                        );

                        if (subjectAttendances.length > 0) {
                            const totalAttended = subjectAttendances.reduce((sum, subj) => sum + (subj.attended || 0), 0);
                            const totalClasses = subjectAttendances.reduce((sum, subj) => sum + (subj.total || 0), 0);

                            percentage = calculateAttendancePercentage(totalAttended, totalClasses);
                            attended = totalAttended;
                            total = totalClasses;
                        }
                    }
                }

                // Determine subject information
                let subjectInfo = {
                    subjectId: student.subjectId,
                    subjectName: subjectName || 'All Subjects',
                    subjects: getSubjectNames(student.subjectId, student.batchId)
                };

                if (subjectName && batchName) {
                    const selectedBatch = batches.find((b) => b.name === batchName);
                    const selectedSubject = selectedBatch?.subject?.find((s) => s.name === subjectName);
                    if (selectedSubject) {
                        subjectInfo = {
                            subjectId: [selectedSubject._id],
                            subjectName: subjectName,
                            subjects: subjectName
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
                    // Additional fields that might be useful
                    address: student.address,
                    fee_status: student.fee_status
                };
            });

            return { data, error: '' };
        } catch (error) {
            console.error('Error in useCombinedStudentAttendance:', error);
            return { data: [], error: 'An error occurred while processing student data' };
        }
    }, [batchName, subjectName, batches, students, attendance]);

    return combinedData;
};