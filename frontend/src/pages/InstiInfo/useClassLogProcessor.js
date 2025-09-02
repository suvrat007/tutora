import { useMemo } from 'react';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid'; // Optional: Remove if uuid is not installed, and uncomment the fallback below

// Helper function to generate expected class dates based on schedule
const generateExpectedDates = (startDate, endDate, days, time) => {
    const dates = [];
    let current = moment.tz(startDate, 'Asia/Kolkata');
    const end = moment.tz(endDate, 'Asia/Kolkata');

    while (current <= end) {
        if (days.includes(current.format('dddd'))) {
            const classDate = moment.tz(`${current.format('YYYY-MM-DD')} ${time}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
            dates.push(classDate.format('ddd MMM DD YYYY HH:mm:ss [GMT+0530] (India Standard Time)'));
        }
        current.add(1, 'days');
    }
    // Deduplicate dates (in case of overlaps)
    return [...new Set(dates)];
};

const useClassLogProcessor = (classLogs, batches) => {
    return useMemo(() => {
        // Use the end of the current day as end date to include all of today
        const endDate = moment.tz('Asia/Kolkata').endOf('day'); // September 3, 2025, 23:59:59 IST

        const processedLogs = classLogs.map(log => {
            // Find corresponding batch
            const batch = batches.find(b => b._id.toString() === log.batch_id._id.toString());
            if (!batch) {
                console.warn(`Batch not found for log: ${log._id}`);
                return { ...log, error: 'Batch not found' };
            }

            // Find subject schedule
            const subject = batch.subject.find(s => s._id.toString() === log.subject_id.toString());
            if (!subject || !subject.classSchedule?.days || !subject.classSchedule?.time) {
                console.warn(`Subject or schedule not found for log: ${log._id}`);
                return { ...log, error: 'Subject or schedule not found' };
            }

            const scheduleDays = subject.classSchedule.days;
            const scheduleTime = subject.classSchedule.time;

            // Use the earliest class date from log.classes or today as start date
            const earliestClass = log.classes.length > 0
                ? log.classes.reduce((earliest, cls) => {
                    const classDate = moment.tz(cls.date, 'Asia/Kolkata');
                    return earliest ? moment.min(earliest, classDate) : classDate;
                }, null)
                : moment.tz('Asia/Kolkata').startOf('day');
            const batchStartDate = earliestClass;

            // Generate all expected class dates
            const expectedDates = generateExpectedDates(
                batchStartDate,
                endDate,
                scheduleDays,
                scheduleTime
            );

            const newClasses = expectedDates.map(date => {
                const classDate = moment.tz(date, 'Asia/Kolkata');
                const clsDateStr = classDate.format('YYYY-MM-DD');
                // Check for multiple classes on the same date
                const matchingClasses = log.classes.filter(cls =>
                    moment.tz(cls.date, 'Asia/Kolkata').format('YYYY-MM-DD') === clsDateStr
                );

                if (matchingClasses.length > 1) {
                    console.warn(`Multiple classes found for date ${clsDateStr} in log ${log._id}:`, matchingClasses);
                }

                const existingClass = matchingClasses[0]; // Take the first matching class to avoid duplicates

                if (existingClass) {
                    // Validate existing class date matches schedule
                    const dayOfWeek = moment.tz(existingClass.date, 'Asia/Kolkata').format('dddd');
                    if (!scheduleDays.includes(dayOfWeek)) {
                        return {
                            ...existingClass,
                            status: 'Invalid schedule day',
                            error: 'Class date does not match schedule'
                        };
                    }

                    return {
                        ...existingClass,
                        status: existingClass.updated
                            ? (existingClass.hasHeld ? 'Conducted' : 'Cancelled')
                            : 'No data recorded'
                    };
                }

                // Create a new class for expected date not in database
                return {
                    date,
                    hasHeld: false,
                    note: 'No Data',
                    attendance: [],
                    updated: false,
                    status: 'No data recorded',
                    _id: `temp_${uuidv4()}`, // Fallback: `temp_${Math.random().toString(36).substr(2, 9)}`
                };
            });

            // Deduplicate classes by date to ensure no duplicates
            const uniqueClasses = [];
            const seenDates = new Set();
            newClasses.forEach(cls => {
                const clsDateStr = moment.tz(cls.date, 'Asia/Kolkata').format('YYYY-MM-DD');
                if (!seenDates.has(clsDateStr)) {
                    seenDates.add(clsDateStr);
                    uniqueClasses.push(cls);
                } else {
                    console.warn(`Duplicate class filtered out for date ${clsDateStr} in log ${log._id}:`, cls);
                }
            });

            return {
                ...log,
                classes: uniqueClasses.sort((a, b) => moment.tz(a.date, 'Asia/Kolkata') - moment.tz(b.date, 'Asia/Kolkata'))
            };
        });

        return processedLogs;
    }, [classLogs, batches]);
};

export default useClassLogProcessor;