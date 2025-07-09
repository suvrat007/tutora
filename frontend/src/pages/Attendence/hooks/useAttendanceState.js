import { useState, useCallback } from "react";

export const useAttendanceState = () => {
    const [batchName, setBatchName] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [date, setDate] = useState("");
    const [students, setStudents] = useState([]);
    const [presentIds, setPresentIds] = useState(new Set());
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [markedPresentStudents, setMarkedPresentStudents] = useState([]);

    const clearForm = useCallback(() => {
        setBatchName("");
        setSubjectName("");
        setDate("");
        setStudents([]);
        setPresentIds(new Set());
        setMarkedPresentStudents([]);
        setError("");
        setSuccess("");
    }, []);

    const resetStudentData = useCallback(() => {
        setStudents([]);
        setMarkedPresentStudents([]);
        setPresentIds(new Set());
        setError("");
        setSuccess("");
    }, []);

    return {
        batchName, setBatchName,
        subjectName, setSubjectName,
        date, setDate,
        students, setStudents,
        presentIds, setPresentIds,
        error, setError,
        loading, setLoading,
        success, setSuccess,
        markedPresentStudents, setMarkedPresentStudents,
        clearForm,
        resetStudentData
    };
};