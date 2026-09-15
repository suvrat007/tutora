/**
 * The guest-demo session, outside React.
 *
 * The axios adapter needs to answer "is this a guest?" synchronously and cannot
 * import the Redux store without a circular import (store -> slices -> hooks ->
 * axiosInstance), so the flag lives here and in localStorage. Redux mirrors it
 * for rendering; this module is the transport for cross-tab coordination and
 * for non-React callers.
 */

import { clearJournal, loadJournal } from "./guestSandbox.js";

const KEY = 'tutora_guest_session';
const CHANNEL = 'tutora-guest';

let channel = null;
try {
    channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null;
} catch {
    channel = null;
}

const read = () => {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const write = (session) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(session));
    } catch {
        /* private mode - the session still works, it just won't survive a reload */
    }
};

const clear = () => {
    try {
        localStorage.removeItem(KEY);
    } catch {
        /* nothing to do */
    }
};

/**
 * Turns the server's `{ expiresAt, serverNow }` into a local deadline.
 *
 * Deriving the deadline from the server's own clock reading means a device
 * whose clock is hours off still gets exactly ten minutes.
 */
export const normaliseSession = (guest) => {
    if (!guest?.expiresAt) return null;
    const skewMs = guest.serverNow ? Date.parse(guest.serverNow) - Date.now() : 0;
    return {
        sessionId: guest.sessionId ?? null,
        hasParentPreview: Boolean(guest.hasParentPreview),
        expiresAtLocal: Date.parse(guest.expiresAt) - skewMs,
    };
};

export const getSession = () => read();

/** True only while a session exists AND has time left on it. */
export const isGuest = () => {
    const s = read();
    return Boolean(s?.expiresAtLocal && s.expiresAtLocal > Date.now());
};

export const beginSession = (session) => {
    if (!session) return;
    write(session);
    // Keyed by session id: a refresh keeps the guest's changes, a new session
    // starts clean.
    loadJournal(session.sessionId);
    try {
        channel?.postMessage({ type: 'begin', session });
    } catch {
        /* best effort */
    }
};

export const endSession = ({ broadcast = true } = {}) => {
    clear();
    clearJournal();
    if (!broadcast) return;
    try {
        channel?.postMessage({ type: 'end' });
    } catch {
        /* best effort */
    }
};

/**
 * Subscribes to session changes from other tabs. BroadcastChannel carries the
 * message; the storage event is the fallback for browsers or contexts where it
 * isn't available.
 */
export const onSessionChange = (handler) => {
    const onMessage = (event) => handler(event.data?.type ?? 'end');
    const onStorage = (event) => {
        if (event.key !== KEY) return;
        handler(event.newValue ? 'begin' : 'end');
    };

    channel?.addEventListener('message', onMessage);
    window.addEventListener('storage', onStorage);

    return () => {
        channel?.removeEventListener('message', onMessage);
        window.removeEventListener('storage', onStorage);
    };
};
