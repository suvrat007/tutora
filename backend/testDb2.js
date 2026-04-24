const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.VITE_MONGO_URI)
    .then(async () => {
        try {
            const Student = require('./models/Student');
            console.log('Connected to DB');
            const student = await Student.findOne({ adminId: { $ne: null } });
            if (!student) {
                console.log('No students found');
                process.exit(0);
            }
            const adminId = student.adminId;
            console.log('Using adminId:', adminId);

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

            console.log('Grouped Students Result:', JSON.stringify(groupedStudents, null, 2));

        } catch (e) {
            console.error('Test Failed:', e);
        }
        process.exit(0);
    });
