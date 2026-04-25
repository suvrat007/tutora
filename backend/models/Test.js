// Fields: camelCase for refs/meta (adminId, batchId, subjectId), camelCase for user-facing data (testName, maxMarks, passMarks, testDate)
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
        // optional: form allows "No Subject" selection
    },
    maxMarks: {
        type: Number,
        required: true
    },
    passMarks: {
        type: Number,
        default: 0
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

// Optimizes GET /api/v1/test/getAllTests queries filtered by adminId + batchId
testSchema.index({ adminId: 1, batchId: 1 });

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
