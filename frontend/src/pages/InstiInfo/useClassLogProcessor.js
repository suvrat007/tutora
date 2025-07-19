import { useMemo } from 'react';
import moment from 'moment';

// Helper function to generate expected class dates based on schedule
const generateExpectedDates = (startDate, endDate, days, time) => {
    const dates = [];
    let current = moment(startDate);
    const end = moment(endDate);

    while (current <= end) {
        if (days.includes(current.format('dddd'))) {
            const classDate = moment(current.format('YYYY-MM-DD') + ' ' + time);
            dates.push(classDate.format('ddd MMM DD YYYY HH:mm:ss [GMT+0530] (India Standard Time)'));
        }
        current.add(1, 'days');
    }
    return dates;
};

const useClassLogProcessor = (classLogs, batches) => {
    return useMemo(() => {
        // Use the current date as end date to include today
        const endDate = moment(); // July 13, 2025, 02:35 AM IST

        // Process each class log
        const processedLogs = classLogs.map(log => {
            // Find corresponding batch
            const batch = batches.find(b => b._id.toString() === log.batch_id._id.toString());
            if (!batch) {
                console.warn(`Batch not found for log: ${log._id}`);
                return log;
            }

            // Find subject schedule
            const subject = batch.subject.find(s => s._id.toString() === log.subject_id.toString());
            if (!subject) {
                console.warn(`Subject not found for log: ${log._id}`);
                return log;
            }

            const scheduleDays = subject.classSchedule.days;
            const scheduleTime = subject.classSchedule.time;

            // Get earliest class date to start generating expected dates
            const earliestClass = log.classes.reduce((earliest, cls) => {
                const classDate = moment(cls.date);
                return earliest ? moment.min(earliest, classDate) : classDate;
            }, null) || moment().startOf('day');

            // Generate all expected class dates using scheduled time
            const expectedDates = generateExpectedDates(
                earliestClass,
                endDate,
                scheduleDays,
                scheduleTime
            );

            // Debug: Log expected dates
            console.log(`Expected dates for log ${log._id}:`, expectedDates);

            // Create new classes array with all expected dates
            const newClasses = expectedDates.map(date => {
                const existingClass = log.classes.find(cls =>
                    moment(cls.date).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')
                );

                if (existingClass) {
                    return {
                        ...existingClass,
                        status: existingClass.updated
                            ? (existingClass.hasHeld ? 'Conducted' : 'Cancelled')
                            : 'No data recorded'
                    };
                }

                // Add missing class with scheduled time
                return {
                    date,
                    hasHeld: false,
                    note: 'No Data',
                    attendance: [],
                    updated: false,
                    status: 'No data recorded',
                    _id: `temp_${Math.random().toString(36).substr(2, 9)}` // Temporary ID for new entries
                };
            });

            return {
                ...log,
                classes: newClasses.sort((a, b) => moment(a.date) - moment(b.date))
            };
        });

        // Debug: Log processed logs
        console.log('Processed logs:', processedLogs);
        return processedLogs;
    }, [classLogs, batches]);
};

export default useClassLogProcessor;