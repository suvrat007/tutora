const jwt = require('jsonwebtoken');

/**
 * Hard-blocks every write carried by a guest-demo token.
 *
 * The frontend already fakes guest writes so they never leave the browser, but
 * that is a UX device, not a security boundary - a guest can open devtools and
 * call the API directly with their cookie. This is the boundary.
 *
 * It is mounted before every router (see index.js) so it also covers routes
 * added later, and it inspects both cookies so the parent-portal preview is
 * locked down on the same terms.
 */

// Requests a guest legitimately needs to make. Everything else that isn't a
// read is refused.
const EXEMPT = new Set(['/api/v1/auth/logout', '/api/v1/auth/guest', '/api/v1/parent/logout']);

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const guestGuard = (req, res, next) => {
    if (READ_METHODS.has(req.method)) return next();

    const path = (req.originalUrl || req.url).split('?')[0];
    if (EXEMPT.has(path)) return next();

    const raw = req.cookies?.token || req.cookies?.parentToken;
    if (!raw) return next();

    let decoded;
    try {
        decoded = jwt.verify(raw, process.env.JWT_KEY);
    } catch {
        // Invalid or expired: not this middleware's job. Let the route's own
        // auth answer with a proper 401 (an expired guest token must read as
        // "your session ended", not "this is read-only").
        return next();
    }

    if (decoded?.guest === true) {
        return res.status(403).json({
            code: 'GUEST_READ_ONLY',
            message: "You're exploring a demo - changes aren't saved. Create a free account to keep them.",
        });
    }

    return next();
};

module.exports = guestGuard;
