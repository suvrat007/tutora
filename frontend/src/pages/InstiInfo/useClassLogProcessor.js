import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate expected class dates based on schedule
const generateExpectedDates = (startDate, endDate, days, time) => {
    const dates = [];
    let current = moment.tz(startDate, 'Asia/Kolkata');
    const end = moment.tz(endDate, 'Asia/Kolkata');

    while (current <= end) {
        if (days.includes(current.format('dddd'))) {
            const classDate = moment.tz(`${current.format('YYYY-MM-DD')} ${time}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
            dates.push(classDate.format('YYYY-MM-DD HH:mm:ss'));
        }
        current.add(1, 'days');
    }
    // Deduplicate dates (in case of overlaps)
    return [...new Set(dates)];
};

const useClassLogProcessor = (classLogs, batches) => {
    // Use the end of the current day as end date to include all of today
    const endDate = moment.tz('Asia/Kolkata').endOf('day'); // e.g., September 06, 2025, 23:59:59 IST

    const processedLogs = classLogs.map(log => {
        // Find corresponding batch
        const batch = batches.find(b => b._id.toString() === log.batch_id._id.toString());
        if (!batch) {
            console.warn(`Batch not found for log: ${log._id}`);
            return { ...log, error: 'Batch not found' };
        }

        // Find subject schedule and validate subject
        const subject = batch.subject.find(s => s._id.toString() === log.subject_id.toString());
        if (!subject || !subject.name || !subject.classSchedule?.days || !subject.classSchedule?.time || !subject.startDate) {
            console.warn(`Invalid subject data for log: ${log._id} - Skipping processing due to missing name or schedule`);
            return null; // Return null to filter out invalid subjects
        }

        const scheduleDays = subject.classSchedule.days;
        const scheduleTime = subject.classSchedule.time;
        const batchStartDate = moment.tz(subject.startDate, 'Asia/Kolkata').isValid()
            ? moment.tz(subject.startDate, 'Asia/Kolkata')
            : moment.tz('Asia/Kolkata').startOf('day'); // Fallback to today if startDate is invalid

        // Generate all expected class dates up to the end of today
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
                _id: `temp_${uuidv4()}`,
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
    }).filter(log => log !== null); // Filter out null entries for invalid subjects

    return processedLogs;
};

export default useClassLogProcessor;