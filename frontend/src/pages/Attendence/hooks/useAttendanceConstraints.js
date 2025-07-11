import { useState, useEffect } from "react";

const useAttendanceConstraints = (batchName, subjectName, date, batches) => {
    const [errorMessage, setErrorMessage] = useState("");
    const [disabledDates, setDisabledDates] = useState([]);

    const selectedBatch = batches.find((b) => b.name === batchName);
    const selectedSubject = selectedBatch?.subject.find((s) => s.name === subjectName);

    const isValidDateTime = () => {
        if (!batchName || !subjectName || !date) {
            setErrorMessage("All fields are required");
            return false;
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Constraint 1: Prevent future dates
        if (selectedDate > today) {
            setErrorMessage("Cannot mark attendance for future dates");
            return false;
        }

        // Constraint 2: Check if class is scheduled on the selected day
        const day = selectedDate.toLocaleString("en-US", { weekday: "long" });
        if (!selectedSubject?.classSchedule?.days.includes(day)) {
            setErrorMessage(`Class is not scheduled on ${day}`);
            return false;
        }

        // Constraint 3: Prevent marking before class start time on current date
        if (selectedDate.toDateString() === today.toDateString()) {
            const classTime = selectedSubject?.classSchedule?.time; // e.g., "14:30"
            if (classTime) {
                const [hours, minutes] = classTime.split(":").map(Number);
                const classStart = new Date(selectedDate);
                classStart.setHours(hours, minutes, 0, 0);
                const now = new Date();
                if (now < classStart) {
                    setErrorMessage(`Cannot mark attendance before class starts at ${classTime}`);
                    return false;
                }
            }
        }

        setErrorMessage("");
        return true;
    };

    // Generate disabled dates for calendar
    useEffect(() => {
        if (!selectedSubject?.classSchedule?.days) {
            setDisabledDates([]);
            return;
        }

        const scheduledDays = selectedSubject.classSchedule.days;
        const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const disabledDays = allDays.filter((day) => !scheduledDays.includes(day));

        const isDateDisabled = (date) => {
            const day = date.toLocaleString("en-US", { weekday: "long" });
            return disabledDays.includes(day);
        };

        // Generate disabled dates for a range (past year to today)
        const disabled = [];
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        const endDate = new Date();
        endDate.setHours(0, 0, 0, 0);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (isDateDisabled(d)) {
                disabled.push(new Date(d));
            }
        }

        setDisabledDates(disabled);
    }, [batchName, subjectName, batches]);

    return { isValidDateTime, errorMessage, disabledDates };
};

export default useAttendanceConstraints;