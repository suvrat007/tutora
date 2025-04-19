const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TeacherSchema = new Schema({
    name: {type: String, required: true},
    qualification: {type: String, required: true},
    contact_info: {
        emailId: {type: String, required: true },
        phoneNumber: { type: String, required: true }
    },
    teaching_batches:[{
        batch_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: true
        },
    }],
    classes_taken: [
        {
            scheduled: {
                date: { type: Date, required: true },
                present: { type: Boolean, default: false },
                batch_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Batch'
                }
            },
            extra: {
                date: { type: Date },
                batch_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Batch'
                }
            }
        }
    ],

})
module.exports= mongoose.model('Teacher', TeacherSchema);
