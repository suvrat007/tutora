const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const All_Student_Schema = new Schema({
    name: { type: String, required: true },
    admission_date: { type: Date, default: Date.now },
    grade: { type: Number, required: true },
    school_name: { type: String, required: true },

    contact_info: {
        emailIds: {
            mom: { type: String },
            dad: { type: String },
            student: { type: String, required: true }
        },
        phoneNumbers: {
            mom: { type: String },
            dad: { type: String },
            student: { type: String, required: true }
        }
    },

    attendance: [
        {
            date: { type: Date, required: true },
            batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
            subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
            present: { type: Boolean, default: false }
        }
    ],

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

module.exports = mongoose.model('StudentSchema', All_Student_Schema);
