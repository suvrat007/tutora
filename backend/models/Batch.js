const mongoose = require('mongoose');
const {Timestamp} = require("mongodb");
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
            heldOn:[
                {
                    date: { type: Date, required: true },
                    topic: { type: String },
                    teacher_id: {
                        type: Schema.Types.ObjectId,
                        ref: 'Teacher'
                    }
                }
            ]
        }
    ]



})
module.exports= mongoose.model('Batch', BatchSchema);
