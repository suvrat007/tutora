const Admin = require('../models/Admin');

/**
 * Guest-demo configuration.
 *
 * The demo tenant is identified by the `isDemo` flag on its Admin document
 * rather than a hardcoded ObjectId, so scripts/seedDemo.js owns the identity
 * and there is only one source of truth. The lookup is cached because it sits
 * on the guest-login path.
 */

const SESSION_MINUTES = 10;

// Kill switch: set DEMO_ENABLED=false to turn the guest pass off everywhere
// without a deploy of the frontend.
const isEnabled = () => process.env.DEMO_ENABLED !== 'false';

let cachedId = null;
let cachedAt = 0;
const CACHE_MS = 5 * 60 * 1000;

const getDemoAdminId = async () => {
    if (cachedId && Date.now() - cachedAt < CACHE_MS) return cachedId;
    const admin = await Admin.findOne({ isDemo: true }).select('_id').lean();
    cachedId = admin ? admin._id : null;
    cachedAt = Date.now();
    return cachedId;
};

/** True when `id` is the demo tenant - used to lock public writes out of it. */
const isDemoAdminId = async (id) => {
    if (!id) return false;
    const demoId = await getDemoAdminId();
    return Boolean(demoId) && String(demoId) === String(id);
};

/** Drops the cache so a re-seed is picked up without a restart. */
const resetDemoCache = () => {
    cachedId = null;
    cachedAt = 0;
};

/** Local calendar day, matching the ymd() the seeder writes class dates with. */
const dayKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/**
 * Rebuilds the demo tenant if it wasn't built today.
 *
 * The dataset is anchored to the day it was seeded: today's classes are seeded
 * unmarked so a visitor has something to do, fees are keyed to the current
 * month, and a few tests sit in the near future. Left alone, all of that decays
 * overnight - the dashboard's "Today's Classes" card empties out, attendance has
 * nothing to mark, and the upcoming tests drift into the past.
 *
 * Rather than depend on an external scheduler being configured, the first guest
 * of the day pays for the rebuild (a second or two, against a cold start that is
 * far longer). The claim below is atomic, so when several arrive at once exactly
 * one rebuilds and the rest are served immediately.
 *
 * Returns true if this call rebuilt the tenant.
 */
const ensureFreshDemo = async () => {
    const demoId = await getDemoAdminId();
    if (!demoId) return false;

    const admin = await Admin.findById(demoId).select('demoSeededAt').lean();
    if (admin?.demoSeededAt && dayKey(admin.demoSeededAt) === dayKey(new Date())) {
        return false;
    }

    // Claim the rebuild by moving the stamp forward first. Whoever loses this
    // race gets null back and simply uses the data that is already there.
    const claimed = await Admin.findOneAndUpdate(
        {
            _id: demoId,
            $or: [
                { demoSeededAt: null },
                { demoSeededAt: { $lt: new Date(new Date().setHours(0, 0, 0, 0)) } },
            ],
        },
        { $set: { demoSeededAt: new Date() } }
    );
    if (!claimed) return false;

    try {
        // Required lazily: the seeder pulls in every model, and this module is
        // loaded by routes that have no other reason to.
        const { seedDemo } = require('../scripts/seedDemo');
        await seedDemo();
        resetDemoCache();
        return true;
    } catch (err) {
        console.error('demo reseed failed:', err.message);
        // Clear the stamp so the next visitor retries rather than waiting a day.
        await Admin.updateOne({ _id: demoId }, { $set: { demoSeededAt: null } }).catch(() => {});
        return false;
    }
};

module.exports = {
    ensureFreshDemo,
    SESSION_MINUTES,
    SESSION_MS: SESSION_MINUTES * 60 * 1000,
    isEnabled,
    getDemoAdminId,
    isDemoAdminId,
    resetDemoCache,
};
