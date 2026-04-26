import { useMemo } from "react";

const checkConstraints = (batchName, subjectName, date, batches) => {
    if (!batchName || !subjectName || !date) return { valid: false, error: "" };

    const selectedBatch = batches.find((b) => b.name === batchName);
    const selectedSubject = selectedBatch?.subject.find((s) => s.name === subjectName);

    const selectedDate = new Date(date + "T00:00:00"); // local midnight
    const now = new Date();
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    // Future date
    if (selectedDate > todayMidnight) {
        return { valid: false, error: "Cannot mark attendance for future dates." };
    }

    // Check if class is scheduled on this day of the week
    const scheduledDays = selectedSubject?.classSchedule?.days;
    const dayName = selectedDate.toLocaleString("en-US", { weekday: "long" });
    if (Array.isArray(scheduledDays) && scheduledDays.length > 0 && !scheduledDays.includes(dayName)) {
        return { valid: false, error: `No class scheduled on ${dayName} for this subject.` };
    }

    // For today: check if the class start time has passed
    if (selectedDate.toDateString() === now.toDateString()) {
        const classTime = selectedSubject?.classSchedule?.time; // "HH:MM"
        if (classTime) {
            const [hours, minutes] = classTime.split(":").map(Number);
            const classStart = new Date();
            classStart.setHours(hours, minutes, 0, 0);
            if (now < classStart) {
                const fmt = classStart.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                return { valid: false, error: `Class hasn't started yet. Starts at ${fmt}.` };
            }
        }
    }

    return { valid: true, error: "" };
};

const useAttendanceConstraints = (batchName, subjectName, date, batches) => {
    const { valid: canMark, error: constraintError } = useMemo(
        () => checkConstraints(batchName, subjectName, date, batches),
        [batchName, subjectName, date, batches]
    );

    // isValidDateTime kept for the submit path (same logic, no setState side-effects)
    const isValidDateTime = () => checkConstraints(batchName, subjectName, date, batches).valid;

    return { canMark, constraintError, isValidDateTime };
};

export default useAttendanceConstraints;
