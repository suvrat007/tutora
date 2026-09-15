import axiosInstance from "@/utilities/axiosInstance.jsx";
import store, { RESET_APP } from "@/utilities/redux/store.js";
import { endSession } from "./guestSession.js";

/**
 * Ends a guest demo and leaves nothing behind.
 *
 * Used by the countdown expiring, by the guest choosing to leave, and by the
 * server rejecting an expired token. Idempotent, because all three can race.
 */

let running = false;

/**
 * Drops cached API responses.
 *
 * The service worker caches every GET /api/v1/* NetworkFirst for 24 hours. Left
 * in place, the demo institute's student list could be served from cache to
 * whoever uses this device next - including a real tutor during a cold start.
 */
export const clearApiCaches = async () => {
    if (typeof caches === "undefined") return;
    try {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k.startsWith("api-")).map((k) => caches.delete(k)));
    } catch {
        /* cache storage unavailable (private mode) - nothing cached to clear */
    }
};

export const endGuestSession = async ({ broadcast = true } = {}) => {
    if (running) return;
    running = true;

    try {
        endSession({ broadcast });
        store.dispatch({ type: RESET_APP });

        // Best effort: the JWT has already expired server-side in the common
        // case, and this only clears the cookies.
        try {
            await axiosInstance.post("auth/logout", {});
        } catch {
            /* the session is over either way */
        }

        await clearApiCaches();

        try {
            sessionStorage.clear();
        } catch {
            /* nothing to do */
        }
    } finally {
        running = false;
    }
};
