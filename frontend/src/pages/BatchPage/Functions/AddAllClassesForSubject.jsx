

export const addAllClassesForSubject = (batchData) => {
    const dayToNumber = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6
    };

    const currentYear = 2025;
    const years = [currentYear, currentYear + 1]; // Cover 2025 and 2026
    const allSubjects = batchData.subject.map(subject => {
        const allClasses = [];

        years.forEach(year => {
            const startDate = new Date(year, 0, 1); // January 1st
            const endDate = new Date(year, 11, 31); // December 31st

            // Iterate through each day in the year
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                const dayName = Object.keys(dayToNumber).find(key => dayToNumber[key] === date.getDay());

                subject.classSchedule.forEach(schedule => {
                    if (schedule.days.includes(dayName)) {
                        // Parse time from schedule (e.g., "14:00")
                        const [hours, minutes] = schedule.time.split(':').map(Number);
                        const sessionDate = new Date(date);
                        sessionDate.setHours(hours, minutes, 0, 0);

                        // Construct a class entry
                        allClasses.push({
                            date: new Date(sessionDate),
                            sessions: [{
                                held: false,
                                updates: "",
                                forDate: new Date(sessionDate),
                                done: false,
                                updated: false
                            }],
                            teacher_id: null // Placeholder for ObjectId reference
                        });
                    }
                });
            }
        });

        return {
            ...subject,
            allClasses
        };
    });

    return {
        ...batchData,
        subject: allSubjects
    };
};