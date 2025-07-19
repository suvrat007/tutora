const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require("../models/Student.js");
const Batch = require("../models/Batch.js");
const userAuth = require("../middleware/userAuth.js");

router.post("/add-new-student", userAuth, async (req, res) => {
    const { contact_info, batchId, fee_status } = req.body;
    const adminId = req.user._id;

    try {
        const duplicateQuery = {
            adminId: adminId,
            $or: [
                { "contact_info.emailIds.student": contact_info.emailIds.student },
                { "contact_info.phoneNumbers.student": contact_info.phoneNumbers.student }
            ]
        };

        if (batchId) {
            duplicateQuery.batchId = batchId;
        }

        const existingStudent = await Student.findOne(duplicateQuery);

        if (existingStudent) {
            return res.status(409).json({ message: "Student with same email or phone already exists" });
        }

        const studentData = {
            adminId,
            ...req.body,
            fee_status: {
                amount: fee_status?.amount || 0,
                feeStatus: fee_status?.feeStatus || [{ date: new Date(), paid: false }]
            }
        };

        if (!batchId) {
            delete studentData.batchId;
        }

        const newStudent = new Student(studentData);
        await newStudent.save();

        return res.status(201).json({
            message: "Student added successfully",
            student: newStudent
        });

    } catch (error) {
        console.error("Error adding student:", error);
        return res.status(500).json({ message: "Failed to add student", error: error.message });
    }
});

router.get("/get-all-students-of-institute", userAuth, async (req, res) => {
    try {
        const adminId = req.user._id;
        const students = await Student.find({ adminId }).populate('batchId');
        return res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ message: "Failed to fetch students", error: error.message });
    }
});

router.get("/get-students-grouped-by-batch", userAuth, async (req, res) => {
    try {
        const adminId = req.user._id;

        const groupedStudents = await Student.aggregate([
            {
                $match: { adminId: new mongoose.Types.ObjectId(adminId) }
            },
            {
                $facet: {
                    withBatch: [
                        { $match: { batchId: { $ne: null } } },
                        {
                            $group: {
                                _id: "$batchId",
                                students: { $push: "$$ROOT" }
                            }
                        },
                        {
                            $lookup: {
                                from: "batches",
                                localField: "_id",
                                foreignField: "_id",
                                as: "batchInfo"
                            }
                        },
                        { $unwind: "$batchInfo" },
                        {
                            $project: {
                                _id: 0,
                                batchId: "$batchInfo._id",
                                batchName: "$batchInfo.name",
                                forStandard: "$batchInfo.forStandard",
                                students: 1
                            }
                        }
                    ],
                    noBatch: [
                        { $match: { batchId: null } },
                        {
                            $group: {
                                _id: null,
                                students: { $push: "$$ROOT" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                batchId: null,
                                batchName: "No Batch",
                                forStandard: "N/A",
                                students: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    allGroups: { $concatArrays: ["$withBatch", "$noBatch"] }
                }
            },
            { $unwind: "$allGroups" },
            { $replaceRoot: { newRoot: "$allGroups" } }
        ]);

        res.status(200).json(groupedStudents);
    } catch (error) {
        console.error("Error grouping students by batch:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.delete("/delete-student/:id", userAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user._id;
        const response = await Student.deleteOne({ adminId, _id: id });
        // console.log(response);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error deleting student:", error.message);
        return res.status(500).json({ message: "Failed to delete student", error: error.message });
    }
});

router.patch("/update-student/:id", userAuth, async (req, res) => {
    const { id } = req.params;
    const adminId = req.user._id;
    const updateData = req.body;

    try {
        const student = await Student.findById(id);
        if (!student || student.adminId.toString() !== adminId.toString()) {
            return res.status(404).json({ message: "Student not found or unauthorized" });
        }

        const updatedFields = {
            ...updateData,
            name: updateData.name ?? student.name,
            address: updateData.address ?? student.address,
            grade: updateData.grade ?? student.grade,
            school_name: updateData.school_name ?? student.school_name,
            contact_info: {
                emailIds: {
                    student: updateData.contact_info?.emailIds?.student ?? student.contact_info.emailIds.student,
                    mom: updateData.contact_info?.emailIds?.mom ?? student.contact_info.emailIds.mom,
                    dad: updateData.contact_info?.emailIds?.dad ?? student.contact_info.emailIds.dad
                },
                phoneNumbers: {
                    student: updateData.contact_info?.phoneNumbers?.student ?? student.contact_info.phoneNumbers.student,
                    mom: updateData.contact_info?.phoneNumbers?.mom ?? student.contact_info.phoneNumbers.mom,
                    dad: updateData.contact_info?.phoneNumbers?.dad ?? student.contact_info.phoneNumbers.dad
                }
            },
            fee_status: {
                amount: updateData.fee_status?.amount ?? student.fee_status.amount,
                feeStatus: updateData.fee_status?.feeStatus ?? (student.fee_status.feeStatus?.length > 0
                    ? student.fee_status.feeStatus
                    : [{ date: student.admission_date, paid: false }])
            }
        };

        if (updateData.batchId === null || updateData.batchId === undefined) {
            updatedFields.batchId = null;
        } else if (updateData.batchId) {
            updatedFields.batchId = updateData.batchId;
        }

        if (updateData.subjectId !== undefined) {
            updatedFields.subjectId = Array.isArray(updateData.subjectId) ? updateData.subjectId : student.subjectId;
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Error updating student", error: error.message });
    }
});


router.get('/attendance/summary', userAuth, async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }
        const adminId = req.user._id;
        const studentId = req.query.studentId;

        const matchStage = { adminId };
        if (studentId) {
            matchStage._id = mongoose.Types.ObjectId(studentId);
        }

        const summary = await Student.aggregate([
            { $match: matchStage },
            // Include admission_date in the projection
            {
                $project: {
                    adminId: 1,
                    batchId: 1,
                    subjectId: 1,
                    name: 1,
                    admission_date: 1
                }
            },
            { $unwind: { path: '$subjectId', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'batches',
                    localField: 'batchId',
                    foreignField: '_id',
                    as: 'batchInfo',
                },
            },
            {
                $unwind: { path: '$batchInfo', preserveNullAndEmptyArrays: true },
            },
            {
                $addFields: {
                    subjectInfo: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: { $ifNull: ['$batchInfo.subject', []] },
                                    as: 'subj',
                                    cond: { $eq: ['$$subj._id', '$subjectId'] },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $match: {
                    $and: [
                        { batchId: { $ne: null } },
                        { subjectId: { $ne: null } },
                        { 'subjectInfo._id': { $exists: true } },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'classlogs',
                    let: { studentId: '$_id', batchId: '$batchId', subjectId: '$subjectId', admissionDate: '$admission_date' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$adminId', adminId] },
                                        { $eq: ['$batch_id', '$$batchId'] },
                                        { $eq: ['$subject_id', '$$subjectId'] },
                                    ],
                                },
                            },
                        },
                        { $unwind: { path: '$classes', preserveNullAndEmptyArrays: true } },
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$classes.updated', true] },
                                        { $eq: ['$classes.hasHeld', true] },
                                        // Filter classes on or after admission_date
                                        { $gte: ['$classes.date', { $dateToString: { format: '%Y-%m-%d', date: '$$admissionDate' } }] },
                                    ],
                                },
                            },
                        },
                        { $unwind: { path: '$classes.attendance', preserveNullAndEmptyArrays: true } },
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$classes.attendance.studentIds', '$$studentId'],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                attendedClasses: { $sum: 1 },
                            },
                        },
                    ],
                    as: 'attendance',
                },
            },
            {
                $unwind: { path: '$attendance', preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: 'classlogs',
                    let: { batchId: '$batchId', subjectId: '$subjectId', admissionDate: '$admission_date' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$adminId', adminId] },
                                        { $eq: ['$batch_id', '$$batchId'] },
                                        { $eq: ['$subject_id', '$$subjectId'] },
                                    ],
                                },
                            },
                        },
                        { $unwind: { path: '$classes', preserveNullAndEmptyArrays: true } },
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$classes.updated', true] },
                                        { $eq: ['$classes.hasHeld', true] },
                                        // Filter classes on or after admission_date
                                        { $gte: ['$classes.date', { $dateToString: { format: '%Y-%m-%d', date: '$$admissionDate' } }] },
                                    ],
                                },
                            },
                        },
                        { $count: 'totalClasses' },
                    ],
                    as: 'tc',
                },
            },
            {
                $unwind: { path: '$tc', preserveNullAndEmptyArrays: true },
            },
            {
                $group: {
                    _id: '$_id',
                    studentName: { $first: '$name' },
                    subjects: {
                        $push: {
                            subjectId: '$subjectId',
                            batchId: '$batchId',
                            subjectName: { $ifNull: ['$subjectInfo.name', 'Unknown'] },
                            attended: { $ifNull: ['$attendance.attendedClasses', 0] },
                            total: { $ifNull: ['$tc.totalClasses', 0] },
                            percentage: {
                                $cond: {
                                    if: { $eq: [{ $ifNull: ['$tc.totalClasses', 0] }, 0] },
                                    then: 0,
                                    else: {
                                        $round: [
                                            {
                                                $multiply: [
                                                    { $divide: [{ $ifNull: ['$attendance.attendedClasses', 0] }, '$tc.totalClasses'] },
                                                    100,
                                                ],
                                            },
                                            2,
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    studentId: '$_id',
                    studentName: 1,
                    subjects: 1,
                },
            },
        ]);

        if (!summary.length) {
            return res.status(200).json({ message: 'No attendance data found', data: [] });
        }

        return res.status(200).json({ data: summary });
    } catch (error) {
        console.error('Attendance summary error:', error);
        return res.status(500).json({ message: 'Failed to fetch attendance summary', error: error.message });
    }
});

router.post("/bulk-update-fee-status", userAuth, async (req, res) => {
    const { studentIds, paid, date } = req.body;

    try {
        const students = await Student.find({ _id: { $in: studentIds } });

        if (students.length !== studentIds.length) {
            return res.status(400).json({ error: "Some student IDs are invalid" });
        }

        const targetMonth = new Date(date).getMonth();
        const targetYear = new Date(date).getFullYear();

        await Promise.all(
            students.map(async (student) => {
                student.fee_status.feeStatus = student.fee_status.feeStatus.filter((status) => {
                    const statusDate = new Date(status.date);
                    return (
                        statusDate.getMonth() !== targetMonth ||
                        statusDate.getFullYear() !== targetYear
                    );
                });

                student.fee_status.feeStatus.push({
                    date,
                    paid,
                });

                await student.save();
            })
        );

        res.status(200).json({ message: "Fee statuses updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update fee statuses" });
    }
});

router.post("/ensure-current-month-fee-status", userAuth, async (req, res) => {
    try {
        const adminId = req.user._id;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const students = await Student.find({ adminId });

        const updatedStudents = await Promise.all(
            students.map(async (student) => {
                const latestFeeStatus = student.fee_status?.feeStatus?.length > 0
                    ? student.fee_status.feeStatus.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                    : null;

                const latestMonth = latestFeeStatus ? new Date(latestFeeStatus.date).getMonth() : null;
                const latestYear = latestFeeStatus ? new Date(latestFeeStatus.date).getFullYear() : null;

                // If the latest fee status is not from the current month, add a new one
                if (!latestFeeStatus || latestMonth !== currentMonth || latestYear !== currentYear) {
                    student.fee_status.feeStatus.push({
                        date: currentDate,
                        paid: false // Default to unpaid for the new month
                    });
                    await student.save();
                    return student;
                }
                return null; // No update needed
            })
        );

        const updatedCount = updatedStudents.filter(student => student !== null).length;

        res.status(200).json({
            message: `Fee statuses updated for ${updatedCount} students`,
            updatedCount
        });
    } catch (error) {
        console.error("Error ensuring current month fee status:", error);
        res.status(500).json({ message: "Failed to ensure current month fee status", error: error.message });
    }
});

module.exports = router;