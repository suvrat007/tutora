const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    name: { type: String, required: true },
    emailId: { type: String, required: true },
    isGoogleAuth: { type: Boolean, default: false },
    password: { type: String, required: function() {return !this.isGoogleAuth} },
    adminPicURL: { type: String, required: true, default: 'https://www.svgrepo.com/show/527961/user.svg' },
    // Marks the seeded guest-demo tenant. It is the safety anchor for
    // scripts/seedDemo.js (which may only ever delete data belonging to an
    // isDemo admin) and the flag that blocks password/Google login for it.
    isDemo: { type: Boolean, default: false },
    // When the demo tenant was last rebuilt. Its data is anchored to the day it
    // was seeded, so it goes stale overnight - see config/demo.js.
    demoSeededAt: { type: Date, default: null },
    institute_info: {
        type:Schema.Types.ObjectId,
        ref: 'Institute',
    }
});

module.exports = mongoose.model('Admin', AdminSchema);
