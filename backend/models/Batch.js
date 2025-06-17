const mongoose = require('mongoose');
const Schema = mongoose.Schema

const BatchSchema = new Schema({
    name: {type: String, required: true},
    normalized_name: { type: String, required: true, unique: true }, // internal use only
    forStandard: {type: String, required: true},
    enrolledStudents: [{type: Schema.Types.ObjectId, ref: "Student"}],
    subject: [
        {
            name: {type: String, required: true},
            classSchedule: [
                {
                    time: { type: String, required: true },
                    days: {
                        type: [String],
                        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                        required: true
                    }
                }
            ],
        }
    ]



})
module.exports= mongoose.model('Batch', BatchSchema);
