import { useState, useCallback } from "react";

export const useAttendanceState = () => {
    const [batchName, setBatchName] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [date, setDate] = useState("");
    const [students, setStudents] = useState([]);
    const [presentIds, setPresentIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [markedPresentStudents, setMarkedPresentStudents] = useState([]);

    const clearForm = useCallback(() => {
        setBatchName("");
        setSubjectName("");
        setDate("");
        setStudents([]);
        setPresentIds(new Set());
        setMarkedPresentStudents([]);
    }, []);

    const resetStudentData = useCallback(() => {
        setStudents([]);
        setMarkedPresentStudents([]);
        setPresentIds(new Set());
    }, []);

    return {
        batchName, setBatchName,
        subjectName, setSubjectName,
        date, setDate,
        students, setStudents,
        presentIds, setPresentIds,
        loading, setLoading,
        markedPresentStudents, setMarkedPresentStudents,
        clearForm,
        resetStudentData
    };
};
