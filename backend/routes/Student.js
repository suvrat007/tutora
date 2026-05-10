const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require("../models/Student.js");
const Batch = require("../models/Batch.js");
const userAuth = require("../middleware/userAuth.js");
const checkStudentLimit = require("../middleware/checkStudentLimit.js");

router.post("/add-new-student", userAuth, checkStudentLimit, async (req, res) => {
    const { contact_info, batchId, fee_status } = req.body;
    const adminId = req.adminId;

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
        const adminId = req.adminId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            Student.countDocuments({ adminId }),
            Student.find({ adminId }).populate('batchId').skip(skip).limit(limit)
        ]);

        return res.status(200).json({
            data,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ message: "Failed to fetch students", error: error.message });
    }
});

router.get("/get-students-grouped-by-batch", userAuth, async (req, res) => {
    try {
        const adminId = req.adminId;

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

router.delete("/delete-all-by-batch/:batchId", userAuth, async (req, res) => {
    try {
        const { batchId } = req.params;
        const adminId = req.adminId;
        const result = await Student.deleteMany({ adminId, batchId });
        return res.status(200).json({ message: `Deleted ${result.deletedCount} students`, deletedCount: result.deletedCount });
    } catch (error) {
        console.error("Error bulk deleting students:", error.message);
        return res.status(500).json({ message: "Failed to delete students", error: error.message });
    }
});

router.delete("/delete-student/:id", userAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.adminId;
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
    const adminId = req.adminId;
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


router.post("/transfer-batch/:id", userAuth, async (req, res) => {
    const { id } = req.params;
    const { newBatchId, newSubjectIds } = req.body;
    const adminId = req.adminId;

    try {
        const student = await Student.findOne({ _id: id, adminId });
        if (!student) return res.status(404).json({ message: "Student not found" });

        if (student.batchId?.toString() === newBatchId) {
            return res.status(400).json({ message: "Student is already in this batch" });
        }

        const newBatch = await Batch.findOne({ _id: newBatchId, adminId });
        if (!newBatch) return res.status(404).json({ message: "Target batch not found" });

        // Record current enrollment in history before switching
        if (student.batchId) {
            const currentBatch = await Batch.findById(student.batchId);
            // joinedAt = when they joined the current batch:
            //   first ever transfer → admission_date
            //   subsequent transfers → leftAt of previous history entry
            const prevEntry = student.enrollmentHistory?.slice(-1)[0];
            const joinedAt = prevEntry ? prevEntry.leftAt : student.admission_date;

            student.enrollmentHistory.push({
                batchId: student.batchId,
                batchName: currentBatch?.name || "Unknown Batch",
                subjectIds: [...(student.subjectId || [])],
                joinedAt,
                leftAt: new Date(),
            });
        }

        student.batchId = newBatchId;
        student.subjectId = Array.isArray(newSubjectIds) ? newSubjectIds : [];
        await student.save();

        return res.status(200).json({ message: "Student transferred successfully", student });
    } catch (err) {
        console.error("Transfer error:", err);
        return res.status(500).json({ message: "Transfer failed", error: err.message });
    }
});

router.get('/attendance/summary', userAuth, async (req, res) => {
    try {
        if (!req.adminId) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }
        const adminId = new mongoose.Types.ObjectId(req.adminId);
        const studentId = req.query.studentId;

        const matchStage = { adminId };
        if (studentId) {
            matchStage._id = new mongoose.Types.ObjectId(studentId);
        }
        if (req.query.batchId) {
            matchStage.batchId = new mongoose.Types.ObjectId(req.query.batchId);
        }
        if (req.query.subjectId) {
            matchStage.subjectId = new mongoose.Types.ObjectId(req.query.subjectId);
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

        const targetMonth = new Date(date).getUTCMonth();
        const targetYear = new Date(date).getUTCFullYear();

        await Promise.all(
            students.map(async (student) => {
                student.fee_status.feeStatus = student.fee_status.feeStatus.filter((status) => {
                    const statusDate = new Date(status.date);
                    return (
                        statusDate.getUTCMonth() !== targetMonth ||
                        statusDate.getUTCFullYear() !== targetYear
                    );
                });

                student.fee_status.feeStatus.push({
                    date,
                    paid,
                    paid_at: paid ? new Date() : null,
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
        const adminId = req.adminId;
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

// Fee Dashboard Summary Route
router.get("/fees/dashboard-summary", userAuth, async (req, res) => {
    try {
        const adminId = req.adminId;
        const targetMonthYear = req.query.month || `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`;

        const isWholeYear = targetMonthYear.startsWith("Whole Year");
        const yearStr = isWholeYear ? targetMonthYear.split(" ")[2] : targetMonthYear.split(" ")[1];
        const targetYearNum = parseInt(yearStr);
        let targetMonthNum = -1;

        if (!isWholeYear) {
            const monthName = targetMonthYear.split(" ")[0];
            const targetDate = new Date(`${monthName} 1, ${yearStr} UTC`);
            targetMonthNum = targetDate.getUTCMonth();
            if (isNaN(targetMonthNum)) targetMonthNum = new Date().getUTCMonth();
        }

        const getSafeDate = { $convert: { input: "$$fs.date", to: "date", onError: new Date("2000-01-01"), onNull: new Date("2000-01-01") } };

        const summary = await Student.aggregate([
            { $match: { adminId: new mongoose.Types.ObjectId(adminId) } },
            {
                $facet: {
                    globalStats: [
                        {
                            $project: {
                                amount: { $ifNull: ["$fee_status.amount", 0] },
                                yearlyPaidCount: {
                                    $size: {
                                        $filter: {
                                            input: { $ifNull: ["$fee_status.feeStatus", []] },
                                            as: "fs",
                                            cond: { 
                                                $and: [
                                                    isWholeYear 
                                                        ? { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                        : { $and: [
                                                              { $eq: [{ $month: getSafeDate }, targetMonthNum + 1] },
                                                              { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                          ]}, 
                                                    { $eq: ["$$fs.paid", true] }
                                                ] 
                                            }
                                        }
                                    }
                                },
                                yearlyTotalCount: {
                                    $size: {
                                        $filter: {
                                            input: { $ifNull: ["$fee_status.feeStatus", []] },
                                            as: "fs",
                                            cond: isWholeYear 
                                                    ? { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                    : { $and: [
                                                          { $eq: [{ $month: getSafeDate }, targetMonthNum + 1] },
                                                          { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                      ]}
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalInstituteFees: {
                                    $sum: isWholeYear 
                                        ? { $multiply: ["$amount", "$yearlyTotalCount"] } 
                                        : "$amount"
                                },
                                studentsCount: { $sum: 1 },
                                totalPaidAmount: {
                                    $sum: isWholeYear
                                        ? { $multiply: ["$amount", "$yearlyPaidCount"] }
                                        : { $cond: [{ $gt: ["$yearlyPaidCount", 0] }, "$amount", 0] }
                                }
                            }
                        }
                    ],
                    batchWise: [
                        {
                            $project: {
                                batchId: 1,
                                amount: { $ifNull: ["$fee_status.amount", 0] },
                                yearlyPaidCount: {
                                    $size: {
                                        $filter: {
                                            input: { $ifNull: ["$fee_status.feeStatus", []] },
                                            as: "fs",
                                            cond: { 
                                                $and: [
                                                    isWholeYear 
                                                        ? { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                        : { $and: [
                                                              { $eq: [{ $month: getSafeDate }, targetMonthNum + 1] },
                                                              { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                          ]}, 
                                                    { $eq: ["$$fs.paid", true] }
                                                ] 
                                            }
                                        }
                                    }
                                },
                                yearlyTotalCount: {
                                    $size: {
                                        $filter: {
                                            input: { $ifNull: ["$fee_status.feeStatus", []] },
                                            as: "fs",
                                            cond: isWholeYear 
                                                    ? { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                    : { $and: [
                                                          { $eq: [{ $month: getSafeDate }, targetMonthNum + 1] },
                                                          { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                      ]}
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$batchId",
                                batchTotalFees: {
                                    $sum: isWholeYear 
                                        ? { $multiply: ["$amount", "$yearlyTotalCount"] } 
                                        : "$amount"
                                },
                                batchPaidAmount: {
                                    $sum: isWholeYear
                                        ? { $multiply: ["$amount", "$yearlyPaidCount"] }
                                        : { $cond: [{ $gt: ["$yearlyPaidCount", 0] }, "$amount", 0] }
                                },
                                batchStudentsCount: { $sum: 1 }
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
                        { $unwind: { path: "$batchInfo", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 0,
                                batchId: "$_id",
                                batchName: { $ifNull: ["$batchInfo.name", "No Batch"] },
                                forStandard: { $ifNull: ["$batchInfo.forStandard", ""] },
                                totalFees: "$batchTotalFees",
                                paidAmount: "$batchPaidAmount",
                                studentsCount: "$batchStudentsCount"
                            }
                        }
                    ]
                }
            }
        ]);

        const result = {
            globalStats: summary[0].globalStats[0] || { totalInstituteFees: 0, studentsCount: 0, totalPaidAmount: 0 },
            batchWise: summary[0].batchWise || []
        };

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching fee dashboard summary:", error);
        res.status(500).json({ error: "Failed to fetch fee summary", details: error.message });
    }
});

// Fee List with Pagination & Filtering
router.get("/fees/list", userAuth, async (req, res) => {
    try {
        const adminId = req.adminId;
        const targetMonthYear = req.query.month || `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`;
        const batchFilter = req.query.batchId || "";
        const subjectFilter = req.query.subject || "";
        const paidStatusFilter = req.query.status || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const isWholeYear = targetMonthYear.startsWith("Whole Year");
        const yearStr = isWholeYear ? targetMonthYear.split(" ")[2] : targetMonthYear.split(" ")[1];
        const targetYearNum = parseInt(yearStr);
        let targetMonthNum = -1;

        if (!isWholeYear) {
            const monthName = targetMonthYear.split(" ")[0];
            const targetDate = new Date(`${monthName} 1, ${yearStr} UTC`);
            targetMonthNum = targetDate.getUTCMonth();
            if (isNaN(targetMonthNum)) targetMonthNum = new Date().getUTCMonth();
        }

        const getSafeDate = { $convert: { input: "$$fs.date", to: "date", onError: new Date("2000-01-01"), onNull: new Date("2000-01-01") } };

        const matchStage = { adminId: new mongoose.Types.ObjectId(adminId) };

        if (batchFilter) {
            matchStage.batchId = new mongoose.Types.ObjectId(batchFilter);
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "batches",
                    localField: "batchId",
                    foreignField: "_id",
                    as: "batchInfo"
                }
            },
            { $unwind: { path: "$batchInfo", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    studentId: "$_id",
                    name: 1,
                    batchId: 1,
                    subjectId: 1,
                    batchName: { $ifNull: ["$batchInfo.name", "No Batch"] },
                    batchSubjects: { $ifNull: ["$batchInfo.subject", []] },
                    amount: { $ifNull: ["$fee_status.amount", 0] },
                    
                    yearlyFeeStatuses: {
                        $filter: {
                            input: { $ifNull: ["$fee_status.feeStatus", []] },
                            as: "fs",
                            cond: { $eq: [{ $year: getSafeDate }, targetYearNum] }
                        }
                    },

                    isPaidThisMonth: {
                        $anyElementTrue: [
                            {
                                $map: {
                                    input: { $ifNull: ["$fee_status.feeStatus", []] },
                                    as: "fs",
                                    in: {
                                        $and: [
                                            isWholeYear 
                                                ? { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                : { $and: [
                                                      { $eq: [{ $month: getSafeDate }, targetMonthNum + 1] },
                                                      { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                  ]},
                                            { $eq: ["$$fs.paid", true] }
                                        ]
                                    }
                                }
                            }
                        ]
                    },
                    paidAt: {
                        $let: {
                            vars: {
                                match: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: { $ifNull: ["$fee_status.feeStatus", []] },
                                                as: "fs",
                                                cond: {
                                                    $and: [
                                                        isWholeYear 
                                                            ? { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                            : { $and: [
                                                                  { $eq: [{ $month: getSafeDate }, targetMonthNum + 1] },
                                                                  { $eq: [{ $year: getSafeDate }, targetYearNum] }
                                                              ]},
                                                        { $eq: ["$$fs.paid", true] }
                                                    ]
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            },
                            in: { $ifNull: ["$$match.paid_at", null] }
                        }
                    }
                }
            }
        ];

        if (paidStatusFilter === "paid") {
            pipeline.push({ $match: { isPaidThisMonth: true } });
        } else if (paidStatusFilter === "unpaid") {
            pipeline.push({ $match: { isPaidThisMonth: false } });
        }

        pipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: limit }]
            }
        });

        const results = await Student.aggregate(pipeline);
        const total = results[0].metadata[0] ? results[0].metadata[0].total : 0;
        let data = results[0].data;

        // Post-process to map subject names
        data = data.map(st => {
             const subjectNames = (st.subjectId || []).map(sId => {
                 if (!sId) return "Unknown Subject";
                 const match = (st.batchSubjects || []).find(bs => bs && bs._id && bs._id.toString() === sId.toString());
                 return match ? match.name : "Unknown Subject";
             });
             return {
                 ...st,
                 subjects: subjectNames
             };
        });

        if (subjectFilter) {
            data = data.filter(st => st.subjects.includes(subjectFilter));
        }

        res.status(200).json({
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching fee list:", error);
        res.status(500).json({ error: "Failed to fetch fee list", details: error.message });
    }
});

// ── Face Descriptor Endpoints ─────────────────────────────────────────────────

router.patch("/face-descriptor/:studentId", userAuth, async (req, res) => {
    const { descriptor } = req.body;
    const adminId = req.adminId;
    const { studentId } = req.params;

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
        return res.status(400).json({ message: "descriptor must be an array of 128 numbers" });
    }

    try {
        const student = await Student.findOne({ _id: studentId, adminId });
        if (!student) return res.status(404).json({ message: "Student not found" });

        student.face_descriptor = {
            descriptor,
            has_face: true,
            registered_at: new Date()
        };
        await student.save();

        return res.status(200).json({ message: "Face registered successfully", studentId });
    } catch (error) {
        console.error("Error saving face descriptor:", error);
        return res.status(500).json({ message: "Failed to save face descriptor", error: error.message });
    }
});

router.get("/face-descriptors", userAuth, async (req, res) => {
    const adminId = req.adminId;
    const { batchId } = req.query;

    try {
        const query = { adminId, "face_descriptor.has_face": true };
        if (batchId) query.batchId = batchId;

        const students = await Student.find(query, "_id name face_descriptor.descriptor");
        const result = students.map(s => ({
            _id: s._id,
            name: s.name,
            descriptor: s.face_descriptor.descriptor
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching face descriptors:", error);
        return res.status(500).json({ message: "Failed to fetch face descriptors", error: error.message });
    }
});

router.delete("/face-descriptor/:studentId", userAuth, async (req, res) => {
    const adminId = req.adminId;
    const { studentId } = req.params;

    try {
        const student = await Student.findOne({ _id: studentId, adminId });
        if (!student) return res.status(404).json({ message: "Student not found" });

        student.face_descriptor = { descriptor: null, has_face: false, registered_at: null };
        await student.save();

        return res.status(200).json({ message: "Face data deleted successfully" });
    } catch (error) {
        console.error("Error deleting face descriptor:", error);
        return res.status(500).json({ message: "Failed to delete face descriptor", error: error.message });
    }
});

// GET /api/v1/student/enrollment-history/:id
// Returns full batch history with per-subject attendance and test results for each enrollment period.
router.get('/enrollment-history/:id', userAuth, async (req, res, next) => {
    try {
        const student = await Student.findOne({ _id: req.params.id, adminId: req.adminId });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const ClassLog   = require('../models/ClassLogSchema');
        const Test       = require('../models/Test');

        // Build all periods: past (enrollmentHistory) + current batch
        const periods = [];

        for (const eh of (student.enrollmentHistory || [])) {
            periods.push({
                batchId   : eh.batchId,
                batchName : eh.batchName,
                subjectIds: eh.subjectIds || [],
                joinedAt  : eh.joinedAt,
                leftAt    : eh.leftAt,
                isCurrent : false,
            });
        }

        if (student.batchId) {
            const currentBatch = await Batch.findById(student.batchId).select('name subject');
            const prevEntry    = (student.enrollmentHistory || []).slice(-1)[0];
            const joinedAt     = prevEntry ? prevEntry.leftAt : student.admission_date;

            periods.push({
                batchId   : student.batchId,
                batchName : currentBatch?.name || 'Unknown',
                subjectIds: student.subjectId || [],
                joinedAt,
                leftAt    : null,
                isCurrent : true,
                _batchDoc : currentBatch,
            });
        }

        if (periods.length === 0) return res.json({ history: [] });

        const studentIdStr = student._id.toString();

        const history = await Promise.all(periods.map(async (period) => {
            // Date bounds as YYYY-MM-DD strings for ClassLog (dates stored as strings)
            const toDateStr = (d) => d ? new Date(d).toISOString().slice(0, 10) : null;
            const fromStr   = toDateStr(period.joinedAt);
            const toStr     = toDateStr(period.leftAt) || toDateStr(new Date());

            // Get subject names from batch
            let batchDoc = period._batchDoc;
            if (!batchDoc) batchDoc = await Batch.findById(period.batchId).select('subject');
            const subjectMap = {};
            (batchDoc?.subject || []).forEach(s => { subjectMap[s._id.toString()] = s.name; });

            // Attendance per subject
            const subjectIds = period.subjectIds.map(id => id.toString());
            const classLogs  = await ClassLog.find({
                adminId   : req.adminId,
                batch_id  : period.batchId,
                subject_id: { $in: period.subjectIds },
            }).select('subject_id classes');

            const subjects = subjectIds.map(subjectIdStr => {
                const log = classLogs.find(cl => cl.subject_id.toString() === subjectIdStr);
                const heldClasses = (log?.classes || []).filter(c =>
                    c.hasHeld && c.updated &&
                    c.date >= (fromStr || '') &&
                    c.date <= toStr
                );
                const total    = heldClasses.length;
                const attended = heldClasses.filter(c =>
                    c.attendance.some(a => a.studentIds.toString() === studentIdStr)
                ).length;
                return {
                    subjectId  : subjectIdStr,
                    subjectName: subjectMap[subjectIdStr] || 'Unknown Subject',
                    attended,
                    total,
                    percentage : total > 0 ? Math.round((attended / total) * 100) : 0,
                };
            });

            // Tests for this period
            const dateQuery = {};
            if (period.joinedAt) dateQuery.$gte = new Date(period.joinedAt);
            if (period.leftAt)   dateQuery.$lte = new Date(period.leftAt);

            const testQuery = {
                adminId : req.adminId,
                batchId : period.batchId,
                status  : 'completed',
                'studentResults.studentId': student._id,
            };
            if (Object.keys(dateQuery).length) testQuery.testDate = dateQuery;

            const tests     = await Test.find(testQuery).select('testName testDate subjectId maxMarks passMarks studentResults').sort({ testDate: 1 });
            const testResults = tests.map(t => {
                const r = t.studentResults.find(x => x.studentId.toString() === studentIdStr);
                return {
                    testName   : t.testName,
                    testDate   : t.testDate,
                    subjectName: subjectMap[t.subjectId?.toString()] || '',
                    marks      : r?.marks ?? 0,
                    maxMarks   : t.maxMarks,
                    passMarks  : t.passMarks,
                    appeared   : r?.appeared ?? false,
                    passed     : r?.appeared && r?.marks >= t.passMarks,
                };
            });

            return {
                batchId   : period.batchId,
                batchName : period.batchName,
                joinedAt  : period.joinedAt,
                leftAt    : period.leftAt,
                isCurrent : period.isCurrent,
                subjects,
                tests     : testResults,
            };
        }));

        // Most recent period first
        res.json({ history: history.reverse() });
    } catch (err) {
        next(err);
    }
});

module.exports = router;