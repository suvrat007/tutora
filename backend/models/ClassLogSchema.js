const mongoose = require('mongoose');
const { Schema } = mongoose;

const ClassLogSchema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    batch_id: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    subject_id: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classes: [
        {
            date: { type: String, required: true },
            hasHeld: { type: Boolean, default: false, required: true },
            note: { type: String, default: "No Data", required: true },
            attendance: [{
                studentIds: {type: Schema.Types.ObjectId, ref: 'Student'},
                time: { type: String, required: true },
            }],
            updated: { type: Boolean, default: false, required: true }
        }
    ]
}, {
    indexes: [
        { key: { adminId: 1, batch_id: 1, subject_id: 1 }, unique: true }
    ]
});

module.exports = mongoose.model('ClassLog', ClassLogSchema);