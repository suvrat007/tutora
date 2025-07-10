const express = require("express");
const router = express.Router();
const ClassLog = require("../models/ClassLogSchema.js");
const userAuth = require("../middleware/userAuth.js");
const mongoose = require("mongoose");

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
        const adminId = req.user._id;
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
        const adminId = req.user._id;
        const { batch_id, subject_id, date, presentIds } = req.body;

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

        let classLog = await ClassLog.findOne({
            adminId,
            batch_id,
            subject_id,
        }).populate('classes.attendance.studentIds');

        if (!classLog) {
            return res.status(400).json({ message: "No Class Logs for the given data" });
        }

        let classEntry = classLog.classes.find((c) => formatDateToYYYYMMDD(c.date) === formattedDate);

        if (!classEntry) {
            return res.status(400).json({ message: "No Class Entry for the given date" });
        }

        const currentTime = new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });

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
        const adminId = req.user._id;

        const response = await ClassLog.find({ adminId })
            .populate('batch_id')
            .populate('classes.attendance.studentIds');

        res.status(200).json(response);

    } catch (error) {
        console.error("Error fetching class logs:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;