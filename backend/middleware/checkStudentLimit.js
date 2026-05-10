const Admin = require('../models/Admin');
const Student = require('../models/Student');

const FREE_STUDENT_LIMIT = 12;

// Requires userAuth to run first (req.adminId must be set)
const checkStudentLimit = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.adminId).select('subscription');
        if (!admin) return res.status(401).json({ error: 'Admin not found' });

        // Pro users have no limit
        const { status, currentPeriodEnd } = admin.subscription;
        const now = new Date();
        const isPro =
            (status === 'active' && currentPeriodEnd && currentPeriodEnd > now) ||
            (status === 'pending' && currentPeriodEnd && (() => {
                const grace = new Date(currentPeriodEnd);
                grace.setDate(grace.getDate() + 3);
                return grace > now;
            })());

        if (isPro) return next();

        const count = await Student.countDocuments({ adminId: req.adminId });
        if (count >= FREE_STUDENT_LIMIT) {
            return res.status(403).json({
                error: 'STUDENT_LIMIT_REACHED',
                code: 'UPGRADE_TO_PRO',
                limit: FREE_STUDENT_LIMIT,
                current: count,
            });
        }

        next();
    } catch (err) {
        console.error('checkStudentLimit error:', err);
        res.status(500).json({ error: 'Student limit check failed' });
    }
};

module.exports = checkStudentLimit;
