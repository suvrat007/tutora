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

module.exports = {
    SESSION_MINUTES,
    SESSION_MS: SESSION_MINUTES * 60 * 1000,
    isEnabled,
    getDemoAdminId,
    isDemoAdminId,
    resetDemoCache,
};
