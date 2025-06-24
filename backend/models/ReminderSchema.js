    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const ReminderSchema = new Schema({
        batchName: { type: String },
        subjectName: { type: String },
        reminderDate: { type: Date, required: true },
        reminder: { type: String, required: true },
    });

    module.exports = mongoose.model('Reminder', ReminderSchema);
