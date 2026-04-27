const mongoose = require('mongoose');

const PendingStudent = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    grade: { type: Number, required: true },
    school_name: { type: String, required: true },
    contact_info: {
        emailIds: {
            mom: { type: String, default: '' },
            dad: { type: String, default: '' },
            student: { type: String, required: true }
        },
        phoneNumbers: {
            mom: { type: String, default: '' },
            dad: { type: String, default: '' },
            student: { type: String, required: true }
        }
    },
    fee_amount: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PendingStudent', PendingStudent);
