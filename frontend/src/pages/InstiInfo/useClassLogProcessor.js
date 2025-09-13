import { getLocalDateYYYYMMDD, toLocalISOSeconds } from '@/lib/utils.js';
import { v4 as uuidv4 } from 'uuid';

// Helper: format day name from Date
const getWeekday = (date) => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
};

// Helper function to generate expected class dates based on schedule (LOCAL time)
const generateExpectedDates = (startDate, endDate, days, time) => {
    const dates = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    while (current <= end) {
        if (days.includes(getWeekday(current))) {
            const [hh, mm] = (time || '00:00').split(':').map(Number);
            const classDate = new Date(
                current.getFullYear(),
                current.getMonth(),
                current.getDate(),
                hh,
                mm,
                0,
                0
            );
            dates.push(classDate);
        }
        // next day
        current.setDate(current.getDate() + 1);
    }
    // Deduplicate dates (in case of overlaps)
    return [...new Set(dates.map(d => d.getTime()))].map(ts => new Date(ts));
};

const useClassLogProcessor = (classLogs, batches) => {
    // Use the end of the current day as end date to include all of today (LOCAL)
    console.log("useClassLogProcessor called with classLogs:", batches, classLogs);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

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

        const scheduleDays = subject.classSchedule.days || [];
        const scheduleTime = subject.classSchedule.time || '00:00';
        // Determine a reasonable local start date - prioritize subject.startDate
        let batchStartDate;
        if (subject.startDate) {
            // Parse ISO string to Date object
            batchStartDate = new Date(subject.startDate);
            // Ensure it's at the start of the day in local time
            batchStartDate.setHours(0, 0, 0, 0);
        } else {
            // Fallback to other candidates if no startDate
            const candidates = [];
            const firstExistingClass = Array.isArray(log.classes) && log.classes.length > 0 ? new Date(log.classes[0].date) : null;
            if (firstExistingClass) candidates.push(firstExistingClass);
            if (batch.createdAt) candidates.push(new Date(batch.createdAt));
            // default to 60 days back
            const sixtyDaysBack = new Date();
            sixtyDaysBack.setDate(sixtyDaysBack.getDate() - 60);
            candidates.push(sixtyDaysBack);
            batchStartDate = new Date(Math.min(...candidates.map(d => d.getTime())));
            batchStartDate.setHours(0,0,0,0);
        }

        // Generate all expected class dates up to the end of today
        const expectedDates = generateExpectedDates(batchStartDate, endDate, scheduleDays, scheduleTime);

        const newClasses = expectedDates.map(date => {
            const clsDateStr = getLocalDateYYYYMMDD(date);
            // Check for multiple classes on the same date
            const matchingClasses = (log.classes || []).filter(cls => getLocalDateYYYYMMDD(cls.date) === clsDateStr);

            if (matchingClasses.length > 1) {
                console.warn(`Multiple classes found for date ${clsDateStr} in log ${log._id}:`, matchingClasses);
            }

            const existingClass = matchingClasses[0]; // Take the first matching class to avoid duplicates

            if (existingClass) {
                // Validate existing class date matches schedule
                const dayOfWeek = getWeekday(new Date(existingClass.date));
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
                date: toLocalISOSeconds(date),
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
            const clsDateStr = getLocalDateYYYYMMDD(cls.date);
            if (!seenDates.has(clsDateStr)) {
                seenDates.add(clsDateStr);
                uniqueClasses.push(cls);
            } else {
                console.warn(`Duplicate class filtered out for date ${clsDateStr} in log ${log._id}:`, cls);
            }
        });

        return {
            ...log,
            classes: uniqueClasses.sort((a, b) => new Date(a.date) - new Date(b.date))
        };
    }).filter(log => log !== null); // Filter out null entries for invalid subjects

    return processedLogs;
};

export default useClassLogProcessor;