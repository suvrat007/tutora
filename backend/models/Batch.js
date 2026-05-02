// Fields: camelCase for refs/meta (adminId, normalized_name), snake_case for user-facing data (forStandard, startDate)
const mongoose = require('mongoose');
const Schema = mongoose.Schema

const BatchSchema = new Schema({
    adminId:{
        type:Schema.Types.ObjectId,
        ref:"Admin"
    },
    name: {type: String, required: true},
    normalized_name: { type: String, required: true },
    forStandard: {type: String, required: true},
    teacherInCharge: { type: String, default: "" },
    subject: [
        {
            name: {type: String, required: true},
            startDate: {type:Date, required: true},
            classSchedule:
                {
                    time: { type: String, required: true },
                    days: {
                        type: [String],
                        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                        required: true
                    }
                }

        }
    ]
})
BatchSchema.index({ adminId: 1, normalized_name: 1 }, { unique: true });

module.exports= mongoose.model('Batch', BatchSchema);
