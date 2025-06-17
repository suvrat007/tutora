const mongoose = require('mongoose');
const {ObjectId} = require("mongodb")
const Schema = mongoose.Schema

const ClassLogSchema = new Schema({
    adminId: {type: ObjectId, default: null},
    instituteId: {type: ObjectId, default: null},
    batch_id: {type: Schema.Types.ObjectId,required: true, ref: 'Batch'},
    classes: [
        {
            subject_id: {type: String,required: true},
            date: {type: Date, default: Date.now, required: true},
            hasHeld: {type: Boolean, default: false},
            note: {type: String, default: null, required: true},
        }
    ]

})
module.exports= mongoose.model('ClassLog', ClassLogSchema);
