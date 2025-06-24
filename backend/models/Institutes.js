const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Institutes = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
    name: { type: String, required: true },
    logo_URL: { type: String, required: true },
    contact_info: {
        emailId: { type: String, required: true },
        phone_number: { type: String, required: true }
    }
});

module.exports = mongoose.model('Institute', Institutes);
