const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    name: { type: String, required: true },
    emailId: { type: String, required: true },
    password: { type: String, required: true },
    institute_info: {
        insti_name: { type: String, required: true },
        logo_URL: { type: String, required: true },
        contact_info: {
            emailId: { type: String, required: true },
            phone_number: { type: String, required: true }
        }
    }
});

module.exports = mongoose.model('Admin', AdminSchema);
