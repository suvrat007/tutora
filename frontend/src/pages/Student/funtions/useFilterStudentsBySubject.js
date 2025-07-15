import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useFilterStudentsBySubject = (batches, selectedSubject, selectedBatch) => {
    const [filteredStudents, setFilteredStudents] = useState([]);
    const groupedStudents = useSelector((state) => state.students.groupedStudents);

    useEffect(() => {
        if (!selectedSubject) {
            setFilteredStudents([]);
            return;
        }

        const studentsWithSubject = [];
        groupedStudents
            .filter((group) => !selectedBatch || group.batchId === selectedBatch)
            .forEach((group) => {
                const batch = batches.find((b) => b._id === group.batchId);
                if (batch) {
                    const subject = batch.subject.find(
                        (subj) => subj.name.toLowerCase() === selectedSubject.toLowerCase()
                    );
                    if (subject) {
                        const students = group.students.filter((student) =>
                            student.subjectId?.includes(subject._id)
                        );
                        studentsWithSubject.push(
                            ...students.map((student) => ({ ...student, batchName: batch.name }))
                        );
                    }
                }
            });
        setFilteredStudents(studentsWithSubject);
    }, [selectedSubject, selectedBatch, groupedStudents, batches]);

    return filteredStudents;
};

export default useFilterStudentsBySubject;