const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParentAuthSchema = new Schema({
    studentId:   { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    adminId:     { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    email:       { type: String, required: true },
    relation:    { type: String, enum: ['mom', 'dad'], required: true },
    password:    { type: String, default: null },
    inviteToken: { type: String, default: null },
    tokenExpiry: { type: Date, default: null },
    isActive:    { type: Boolean, default: false },
    createdAt:   { type: Date, default: Date.now }
});

// One ParentAuth doc per student+relation — re-invite updates the same doc
ParentAuthSchema.index({ studentId: 1, relation: 1 }, { unique: true });
ParentAuthSchema.index({ inviteToken: 1 });

module.exports = mongoose.model('ParentAuth', ParentAuthSchema);
