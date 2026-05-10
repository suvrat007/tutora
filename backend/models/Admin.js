const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    name: { type: String, required: true },
    emailId: { type: String, required: true },
    isGoogleAuth: { type: Boolean, default: false },
    password: { type: String, required: function() {return !this.isGoogleAuth} },
    adminPicURL: { type: String, required: true, default: 'https://www.svgrepo.com/show/527961/user.svg' },
    institute_info: {
        type: Schema.Types.ObjectId,
        ref: 'Institute',
    },
    subscription: {
        status: {
            type: String,
            enum: ['none', 'created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'paused'],
            default: 'none',
        },
        planType: { type: String, enum: ['free', 'monthly', 'annual'], default: 'free' },
        razorpaySubscriptionId: { type: String, default: null },
        currentPeriodEnd: { type: Date, default: null },
        paidCount: { type: Number, default: 0 },
        lastPaymentId: { type: String, default: null },
    },
    fraud: {
        ipAtSignup: { type: String, default: null },
        browserFingerprint: { type: String, default: null },
        flagged: { type: Boolean, default: false },
    },
});

module.exports = mongoose.model('Admin', AdminSchema);
