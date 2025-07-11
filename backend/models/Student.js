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
                paid: { type: Boolean, default: false }
            }
        ]
    }
});

module.exports = mongoose.model('Student', Student);
