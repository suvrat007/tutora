const Admin = require('../models/Admin');

// Requires userAuth to run first (req.adminId must be set)
const checkSubscription = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.adminId).select('subscription');
        if (!admin) return res.status(401).json({ error: 'Admin not found' });

        const { status, currentPeriodEnd } = admin.subscription;
        const now = new Date();

        if (status === 'active' && currentPeriodEnd && currentPeriodEnd > now) {
            return next();
        }

        // Grace period: if Razorpay is retrying, allow 3 extra days
        if (status === 'pending' && currentPeriodEnd) {
            const grace = new Date(currentPeriodEnd);
            grace.setDate(grace.getDate() + 3);
            if (grace > now) return next();
        }

        return res.status(403).json({ error: 'PRO_REQUIRED', code: 'UPGRADE_TO_PRO' });
    } catch (err) {
        console.error('checkSubscription error:', err);
        res.status(500).json({ error: 'Subscription check failed' });
    }
};

module.exports = checkSubscription;
