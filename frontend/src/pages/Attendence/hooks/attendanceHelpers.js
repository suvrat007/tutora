export const filterAlreadyPresentStudents = (students, dateStr, subjectId) => {
    const alreadyMarkedPresent = [];
    const alreadyMarkedIds = new Set();

    for (const student of students) {
        const attendances = student?.attendance || [];
        for (const record of attendances) {
            if (!record.date) continue;

            const dateObj = new Date(record.date);
            if (isNaN(dateObj.getTime())) continue;

            const recordDateStr = dateObj.toISOString().split("T")[0];
            if (recordDateStr === dateStr && record.subject === subjectId) {
                const time = dateObj.toLocaleTimeString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                alreadyMarkedPresent.push({ student, time });
                alreadyMarkedIds.add(student._id);
            }
        }
    }

    return { alreadyMarkedPresent, alreadyMarkedIds };
};
