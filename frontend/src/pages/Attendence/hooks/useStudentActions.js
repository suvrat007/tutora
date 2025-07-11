import { useCallback } from "react";

export const useStudentActions = (presentIds, setPresentIds, students, markedPresentStudents) => {
    const togglePresent = useCallback((id) => {
        setPresentIds((prev) => {
            const copy = new Set(prev);
            copy.has(id) ? copy.delete(id) : copy.add(id);
            return copy;
        });
    }, [setPresentIds]);

    const selectAll = useCallback(() => {
        setPresentIds(new Set(students.map((s) => s._id)));
    }, [students, setPresentIds]);

    const clearAll = useCallback(() => {
        setPresentIds(new Set());
    }, [setPresentIds]);

    const markAllPreviouslyPresent = useCallback(() => {
        const newPresentIds = new Set(presentIds);
        markedPresentStudents.forEach((student) => {
            newPresentIds.add(student._id);
        });
        setPresentIds(newPresentIds);
    }, [presentIds, markedPresentStudents, setPresentIds]);

    return {
        togglePresent,
        selectAll,
        clearAll,
        markAllPreviouslyPresent
    };
};
