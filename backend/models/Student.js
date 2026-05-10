// Fields: camelCase for refs/meta (adminId, batchId, subjectId), snake_case for user-facing data (school_name, admission_date, fee_status)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Student = new Schema({
    adminId:{type: Schema.Types.ObjectId, ref: 'Admin'},
    batchId:{type: Schema.Types.ObjectId, ref: 'Batch',required:false},
    subjectId:[{type: Schema.Types.ObjectId}],
    name: { type: String, required: true },
    address: { type: String, required: true },
    admission_date: { type: Date, default: Date.now },
    grade: { type: Number, required: true },
    school_name: { type: String, required: true },
    contact_info: {
        emailIds: {
            mom: { type: String },
            dad: { type: String },
            student: { type: String, required: true , unique:true}
        },
        phoneNumbers: {
            mom: { type: String },
            dad: { type: String },
            student: { type: String, required: true , unique:true}
        }
    },
    fee_status: {
        amount: { type: Number, required: true },
        feeStatus: [
            {
                date: { type: Date, required: true },
                paid: { type: Boolean, default: false },
                paid_at: { type: Date, default: null }
            }
        ]
    },
    enrollmentHistory: [
        {
            batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
            batchName: { type: String },
            subjectIds: [{ type: Schema.Types.ObjectId }],
            joinedAt: { type: Date },
            leftAt: { type: Date }
        }
    ]
});

// Optimizes GET /api/v1/student queries filtered by adminId and optional batchId
Student.index({ adminId: 1, batchId: 1 });

module.exports = mongoose.model('Student', Student);
