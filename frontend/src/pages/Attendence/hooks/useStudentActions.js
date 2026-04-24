import { useCallback } from "react";

export const useStudentActions = (presentIds, setPresentIds, students, markedPresentStudents, markDirty) => {
    const togglePresent = useCallback((id) => {
        setPresentIds((prev) => {
            const copy = new Set(prev);
            copy.has(id) ? copy.delete(id) : copy.add(id);
            return copy;
        });
        markDirty();
    }, [setPresentIds, markDirty]);

    const selectAll = useCallback(() => {
        setPresentIds(new Set(students.map((s) => s._id)));
        markDirty();
    }, [students, setPresentIds, markDirty]);

    const clearAll = useCallback(() => {
        setPresentIds(new Set());
        markDirty();
    }, [setPresentIds, markDirty]);

    const markAllPreviouslyPresent = useCallback(() => {
        const newPresentIds = new Set(presentIds);
        markedPresentStudents.forEach((student) => {
            newPresentIds.add(student._id);
        });
        setPresentIds(newPresentIds);
        markDirty();
    }, [presentIds, markedPresentStudents, setPresentIds, markDirty]);

    return { togglePresent, selectAll, clearAll, markAllPreviouslyPresent };
};
