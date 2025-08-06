const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    name: { type: String, required: true },
    emailId: { type: String, required: true },
    isGoogleAuth: { type: Boolean, default: false },
    password: { type: String, required: function() {return !this.isGoogleAuth} },
    adminPicURL: { type: String, required: true, default: 'https://www.svgrepo.com/show/527961/user.svg' },
    institute_info: {
        type:Schema.Types.ObjectId,
        ref: 'Institute',
    }
});

module.exports = mongoose.model('Admin', AdminSchema);
