const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Admin = require('../models/Admin');

// POST /api/webhooks/razorpay
// Note: express.raw({ type: 'application/json' }) must be mounted on this path in index.js BEFORE express.json()
router.post('/razorpay', async (req, res) => {
    try {
        const receivedSig = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('RAZORPAY_WEBHOOK_SECRET not set');
            return res.status(500).json({ error: 'Webhook secret not configured' });
        }

        const rawBody = req.body.toString('utf8');

        const expectedSig = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        if (expectedSig !== receivedSig) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const event = JSON.parse(rawBody);
        const eventType = event.event;
        const sub = event.payload?.subscription?.entity;
        const payment = event.payload?.payment?.entity;

        if (!sub) {
            // Not a subscription event — ignore
            return res.status(200).json({ received: true });
        }

        const admin = await Admin.findOne({ 'subscription.razorpaySubscriptionId': sub.id });
        if (!admin) {
            console.warn(`Webhook: no admin found for subscription ${sub.id}`);
            return res.status(200).json({ received: true });
        }

        // Idempotency: skip if this payment was already processed
        if (payment?.id && admin.subscription.lastPaymentId === payment.id) {
            return res.status(200).json({ received: true, duplicate: true });
        }

        const update = {};

        switch (eventType) {
            case 'subscription.authenticated':
                update['subscription.status'] = 'authenticated';
                break;

            case 'subscription.activated':
                update['subscription.status'] = 'active';
                update['subscription.planType'] = sub.plan_id === process.env.RAZORPAY_PLAN_ANNUAL ? 'annual' : 'monthly';
                if (sub.charge_at) update['subscription.currentPeriodEnd'] = new Date(sub.charge_at * 1000);
                update['subscription.paidCount'] = sub.paid_count || 0;
                break;

            case 'subscription.charged':
                update['subscription.status'] = 'active';
                if (sub.charge_at) update['subscription.currentPeriodEnd'] = new Date(sub.charge_at * 1000);
                update['subscription.paidCount'] = sub.paid_count || admin.subscription.paidCount + 1;
                if (payment?.id) update['subscription.lastPaymentId'] = payment.id;
                break;

            case 'subscription.pending':
                update['subscription.status'] = 'pending';
                break;

            case 'subscription.halted':
                update['subscription.status'] = 'halted';
                break;

            case 'subscription.cancelled':
                update['subscription.status'] = 'cancelled';
                break;

            case 'subscription.completed':
                update['subscription.status'] = 'completed';
                break;

            case 'subscription.paused':
                update['subscription.status'] = 'paused';
                break;

            case 'subscription.resumed':
                update['subscription.status'] = 'active';
                break;

            default:
                return res.status(200).json({ received: true, ignored: true });
        }

        await Admin.findByIdAndUpdate(admin._id, update);

        res.status(200).json({ received: true });
    } catch (err) {
        console.error('Webhook handler error:', err);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

module.exports = router;
