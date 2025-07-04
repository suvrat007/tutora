const mongoose = require('mongoose');
const {ObjectId} = require("mongodb")
const Schema = mongoose.Schema

const ClassLogSchema = new Schema({
    adminId: {type: ObjectId, ref: 'Admin'},
    batch_id: {type: Schema.Types.ObjectId,required: true, ref: 'Batch'},
    subject_id: {type: Schema.Types.ObjectId,required: true},
    classes: [
        {
            date: {type: Date, default: Date.now, required: true},
            hasHeld: {type: Boolean, default: false},
            note: {type: String, default: null, required: true},
            attendance: [{type: Schema.Types.ObjectId, ref: 'Student'}],
            updated:{ type: Boolean, default: false , required: true },
        }
    ]

})
module.exports= mongoose.model('ClassLog', ClassLogSchema);