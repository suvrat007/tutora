const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const userAuth = require('../middleware/userAuth');
const Admin = require('../models/Admin');
const razorpay = require('../utils/razorpay');

// GET /api/v1/subscription/status
router.get('/status', userAuth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId).select('subscription');
        if (!admin) return res.status(404).json({ error: 'Admin not found' });

        const { subscription } = admin;
        const now = new Date();

        let isPro = false;
        if (subscription.status === 'active' && subscription.currentPeriodEnd && subscription.currentPeriodEnd > now) {
            isPro = true;
        } else if (subscription.status === 'pending' && subscription.currentPeriodEnd) {
            const grace = new Date(subscription.currentPeriodEnd);
            grace.setDate(grace.getDate() + 3);
            if (grace > now) isPro = true;
        }

        res.json({
            planType: subscription.planType || 'free',
            status: subscription.status || 'none',
            currentPeriodEnd: subscription.currentPeriodEnd,
            paidCount: subscription.paidCount,
            isPro,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
});

// POST /api/v1/subscription/create
router.post('/create', userAuth, async (req, res) => {
    try {
        const { planType } = req.body;
        if (!['monthly', 'annual'].includes(planType)) {
            return res.status(400).json({ error: 'Invalid planType. Must be monthly or annual.' });
        }

        const admin = await Admin.findById(req.adminId).select('name emailId subscription');
        if (!admin) return res.status(404).json({ error: 'Admin not found' });

        // If already active, return existing subscription id
        if (admin.subscription.status === 'active' && admin.subscription.razorpaySubscriptionId) {
            return res.status(400).json({ error: 'Already have an active subscription' });
        }

        const planId = planType === 'annual'
            ? process.env.RAZORPAY_PLAN_ANNUAL
            : process.env.RAZORPAY_PLAN_MONTHLY;

        if (!planId) {
            return res.status(500).json({ error: 'Razorpay plan not configured on server' });
        }

        const sub = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: planType === 'annual' ? 5 : 60,
            quantity: 1,
            customer_notify: true,
            notes: { adminId: req.adminId.toString() },
        });

        await Admin.findByIdAndUpdate(req.adminId, {
            'subscription.razorpaySubscriptionId': sub.id,
            'subscription.status': 'created',
            'subscription.planType': planType,
        });

        res.json({ subscriptionId: sub.id });
    } catch (err) {
        console.error('Subscription create error:', err);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// POST /api/v1/subscription/verify-payment
router.post('/verify-payment', userAuth, async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

        if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment fields' });
        }

        const expectedSig = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
            .digest('hex');

        if (expectedSig !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Mark as authenticated — webhook will set it to active
        await Admin.findByIdAndUpdate(req.adminId, {
            'subscription.status': 'authenticated',
            'subscription.lastPaymentId': razorpay_payment_id,
        });

        res.json({ success: true, message: 'Payment verified. Subscription activating shortly.' });
    } catch (err) {
        console.error('Verify payment error:', err);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

// POST /api/v1/subscription/cancel
router.post('/cancel', userAuth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId).select('subscription');
        if (!admin) return res.status(404).json({ error: 'Admin not found' });

        const subId = admin.subscription.razorpaySubscriptionId;
        if (!subId) return res.status(400).json({ error: 'No active subscription found' });

        // cancel_at_cycle_end = true means access continues until period end
        await razorpay.subscriptions.cancel(subId, true);

        await Admin.findByIdAndUpdate(req.adminId, {
            'subscription.status': 'cancelled',
        });

        res.json({ success: true, message: 'Subscription cancelled. Access continues until period end.' });
    } catch (err) {
        console.error('Cancel subscription error:', err);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

module.exports = router;
