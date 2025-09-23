const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    testName: {
        type: String,
        required: true
    },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin',required: true },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    },
    testDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    cancellationReason: {
        type: String
    },
    studentResults: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        appeared: {
            type: Boolean,
            default: false
        },
        marks: {
            type: Number,
            default: 0
        }
    }]
}, { timestamps: true });

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
