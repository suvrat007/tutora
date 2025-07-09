const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require("../models/Student.js");
const Batch = require("../models/Batch.js");
const userAuth  =require("../middleware/userAuth.js");


router.post("/add-new-student", userAuth, async (req, res) => {
    const { contact_info, batchId } = req.body;
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
            ...req.body
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



router.delete("/delete-student/:id",userAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user._id;
        const response = await Student.deleteOne({ adminId ,_id: id });
        console.log(response);
        return res.status(200).json(response.data);
    }catch(error){
        console.error("Error deleting student:", error.message);
    }
})

router.patch("/update-student/:id", userAuth, async (req, res) => {
    const { id } = req.params;
    const adminId = req.user._id;

    try {
        const student = await Student.findById(id);
        if (!student || student.adminId.toString() !== adminId.toString()) {
            return res.status(404).json({ message: "Student not found or unauthorized" });
        }

        const updated = await Student.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error updating student", error: error.message });
    }
});

router.get('/attendance/summary', userAuth ,async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }
        const adminId = req.user._id;

        const summary = await Student.aggregate([
            { $match: { adminId } },
            // Unwind subjectId to process each subject
            { $unwind: { path: '$subjectId', preserveNullAndEmptyArrays: true } },

            // Lookup batch details to get subject info
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

            // Filter out students with invalid batch or subject
            {
                $match: {
                    $and: [
                        { batchId: { $ne: null } },
                        { subjectId: { $ne: null } },
                        { 'subjectInfo._id': { $exists: true } },
                    ],
                },
            },

            // Lookup attendance data from ClassLog
            {
                $lookup: {
                    from: 'classlogs',
                    let: { studentId: '$_id', batchId: '$batchId', subjectId: '$subjectId' },
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

            // Lookup total classes held (hasHeld: true)
            {
                $lookup: {
                    from: 'classlogs',
                    let: { batchId: '$batchId', subjectId: '$subjectId' },
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
                        { $match: { 'classes.hasHeld': true } },
                        { $count: 'totalClasses' },
                    ],
                    as: 'tc',
                },
            },
            {
                $unwind: { path: '$tc', preserveNullAndEmptyArrays: true },
            },

            // Group by student to collect subjects
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

            // Final projection
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

module.exports=router