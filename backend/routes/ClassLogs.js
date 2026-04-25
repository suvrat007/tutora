const express = require("express");
const router = express.Router();
const ClassLog = require("../models/ClassLogSchema.js");
const userAuth = require("../middleware/userAuth.js");
const mongoose = require("mongoose");
const Student = require("../models/Student.js");

const formatDateToYYYYMMDD = (dateInput) => {
    try {
        const date = new Date(dateInput);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Error formatting date:", dateInput, error);
        return null;
    }
};

router.post("/add-class-updates", userAuth, async (req, res) => {
    try {
        const adminId = req.adminId;
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ message: "Updates array is required and cannot be empty" });
        }

        for (const update of updates) {
            if (
                !mongoose.Types.ObjectId.isValid(update.batch_id) ||
                !mongoose.Types.ObjectId.isValid(update.subject_id) ||
                !update.date || isNaN(new Date(update.date).getTime())
            ) {
                return res.status(400).json({ message: `Invalid data in update: ${JSON.stringify(update)}` });
            }
            update.batch_id = new mongoose.Types.ObjectId(update.batch_id);
            update.subject_id = new mongoose.Types.ObjectId(update.subject_id);
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        const results = [];
        try {
            for (const { batch_id, subject_id, date, hasHeld, note, updated } of updates) {
                // Use consistent date formatting
                const formattedDate = formatDateToYYYYMMDD(date);

                if (!formattedDate) {
                    throw new Error(`Invalid date format: ${date}`);
                }

                let classLog = await ClassLog.findOne(
                    { adminId, batch_id, subject_id },
                    null,
                    { session }
                );

                if (classLog) {
                    const existingClass = classLog.classes.find(
                        (cls) => formatDateToYYYYMMDD(cls.date) === formattedDate
                    );

                    if (existingClass) {
                        // Update existing class
                        existingClass.hasHeld = hasHeld !== undefined ? hasHeld : existingClass.hasHeld;
                        existingClass.note = note || existingClass.note;
                        existingClass.updated = updated !== undefined ? updated : existingClass.updated;
                        await classLog.save({ session });
                    } else {
                        // Add new class
                        classLog.classes.push({
                            date: new Date(formattedDate),
                            hasHeld: hasHeld || false,
                            note: note || "No Data",
                            attendance: [],
                            updated: updated !== undefined ? updated : false,
                        });
                        await classLog.save({ session });
                    }

                    results.push(classLog);
                } else {
                    classLog = new ClassLog({
                        adminId,
                        batch_id,
                        subject_id,
                        classes: [
                            {
                                date: new Date(formattedDate),
                                hasHeld: hasHeld || false,
                                note: note || "No Data",
                                attendance: [],
                                updated: updated !== undefined ? updated : false,
                            },
                        ],
                    });

                    await classLog.save({ session });
                    results.push(classLog);
                }
            }

            const populatedResults = await ClassLog.find(
                { _id: { $in: results.map((r) => r._id) } },
                null,
                { session }
            ).populate("batch_id");

            await session.commitTransaction();

            return res.status(201).json({
                message: "Class logs updated successfully",
                batches: populatedResults,
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error("Error adding class logs:", error.message, error.stack);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.patch("/mark-attendance", userAuth, async (req, res) =>  {
    try {
        const adminId = req.adminId;
        const { batch_id, subject_id, date, presentIds, time } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(batch_id) ||
            !mongoose.Types.ObjectId.isValid(subject_id) ||
            !Array.isArray(presentIds) ||
            !date
        ) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        const formattedDate = formatDateToYYYYMMDD(date);

        if (!formattedDate) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        let classLog = await ClassLog.findOne({ adminId, batch_id, subject_id });

        if (!classLog) {
            classLog = new ClassLog({ adminId, batch_id, subject_id, classes: [] });
        }

        let classEntry = classLog.classes.find((c) => formatDateToYYYYMMDD(c.date) === formattedDate);

        if (!classEntry) {
            classLog.classes.push({
                date: new Date(formattedDate),
                hasHeld: true,
                note: "No Data",
                attendance: [],
                updated: false,
            });
            classEntry = classLog.classes[classLog.classes.length - 1];
        }

        const currentTime = typeof time === 'string' && /\d{2}:\d{2}/.test(time)
            ? time
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Replace existing attendance with new list
        classEntry.attendance = presentIds.map((id) => ({
            studentIds: new mongoose.Types.ObjectId(id),
            time: currentTime,
        }));

        await classLog.save();

        return res.status(200).json({
            message: "Attendance updated successfully",
            presentCount: classEntry.attendance.length,
            date: formattedDate,
        });
    } catch (error) {
        console.error("Error updating attendance:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
});

router.get('/getAllClasslogs', userAuth, async (req, res) => {
    try {
        const adminId = req.adminId;

        const response = await ClassLog.find({ adminId })
            .populate('batch_id')
            .populate('classes.attendance.studentIds');

        res.status(200).json(response);

    } catch (error) {
        console.error("Error fetching class logs:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/attendance-status', userAuth, async (req, res) => {
    try {
        const adminId = req.adminId;
        const { batchId, subjectId, date } = req.query;

        if (!mongoose.Types.ObjectId.isValid(batchId) ||
            !mongoose.Types.ObjectId.isValid(subjectId) ||
            !date) {
            return res.status(400).json({ message: "Invalid batch, subject, or date query parameters." });
        }

        const formattedDate = formatDateToYYYYMMDD(date);
        if (!formattedDate) {
            return res.status(400).json({ message: "Invalid date format." });
        }

        const [students, classLog] = await Promise.all([
            Student.find({
                adminId: new mongoose.Types.ObjectId(adminId),
                batchId: new mongoose.Types.ObjectId(batchId),
                subjectId: new mongoose.Types.ObjectId(subjectId)
            }, "_id name"),
            ClassLog.findOne({
                adminId: new mongoose.Types.ObjectId(adminId),
                batch_id: new mongoose.Types.ObjectId(batchId),
                subject_id: new mongoose.Types.ObjectId(subjectId)
            })
        ]);

        const attendanceMap = new Map();
        const presentIds = [];

        if (classLog) {
            const classEntry = classLog.classes.find(c => formatDateToYYYYMMDD(c.date) === formattedDate);
            if (classEntry?.attendance?.length) {
                for (const att of classEntry.attendance) {
                    attendanceMap.set(att.studentIds.toString(), att.time);
                    presentIds.push(att.studentIds.toString());
                }
            }
        }

        const markedPresentStudents = [];
        const payloadStudents = students.map(st => {
            const isPresent = attendanceMap.has(st._id.toString());
            const obj = { _id: st._id, name: st.name, isPresent, time: isPresent ? attendanceMap.get(st._id.toString()) : null };
            if (isPresent) markedPresentStudents.push(obj);
            return obj;
        });

        return res.status(200).json({ students: payloadStudents, presentIds, markedPresentStudents });
    } catch (error) {
        console.error("Error fetching attendance status:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get('/today-pending', userAuth, async (req, res) => {
    try {
        const adminId = req.adminId;
        const { localDate, localTime } = req.query;

        if (!localDate || !localTime) {
            return res.status(400).json({ message: "localDate and localTime query params are required" });
        }

        const logs = await ClassLog.find({ adminId }).populate('batch_id');
        const result = [];

        for (const log of logs) {
            const batch = log.batch_id;
            if (!batch?.subject) continue;

            const subject = batch.subject.find(
                s => s._id.toString() === log.subject_id.toString()
            );
            if (!subject?.classSchedule?.time) continue;

            const { time } = subject.classSchedule;
            if (time > localTime) continue;

            for (const cls of log.classes) {
                const clsDate = formatDateToYYYYMMDD(cls.date);
                if (clsDate === localDate && cls.updated === false) {
                    result.push({
                        logId: log._id,
                        classId: cls._id,
                        batchId: batch._id,
                        batchName: batch.name,
                        subjectId: subject._id,
                        subjectName: subject.name,
                        hasHeld: cls.hasHeld,
                        note: cls.note,
                        attendance: cls.attendance || [],
                        date: clsDate,
                        scheduledTime: time,
                        originalDate: cls.date
                    });
                }
            }
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching today-pending logs:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;