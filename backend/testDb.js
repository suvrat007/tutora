const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.VITE_MONGO_URI)
    .then(async () => {
        try {
            const Student = require('./models/Student');
            console.log('Connected to DB');
            const student = await Student.findOne({ adminId: { $ne: null } });
            if (!student) {
                console.log('No students in DB');
                process.exit(0);
            }
            console.log('Found student auth, running aggregation for admin:', student.adminId);
            
            const adminId = student.adminId;
            const targetMonthNum = new Date().getMonth();
            const targetYearNum = new Date().getFullYear();
            
            const pipeline = [
                { $match: { adminId: new mongoose.Types.ObjectId(adminId) } },
                {
                    $lookup: {
                        from: 'batches',
                        localField: 'batchId',
                        foreignField: '_id',
                        as: 'batchInfo'
                    }
                },
                { $unwind: { path: '$batchInfo', preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        targetFeeStatus: {
                            $filter: {
                                input: { $ifNull: ['$fee_status.feeStatus', []] },
                                as: 'fs',
                                cond: {
                                    $and: [
                                        { $eq: [{ $month: { $toDate: '$$fs.date' } }, targetMonthNum + 1] },
                                        { $eq: [{ $year: { $toDate: '$$fs.date' } }, targetYearNum] }
                                    ]
                                }
                            }
                        }
                    }
                }
            ];
            
            const res = await Student.aggregate(pipeline);
            console.log('Aggregation success. Results count:', res.length);
        } catch (e) {
            console.error('Aggregation Failed:', e.message);
        }
        process.exit(0);
    });
