import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { onSessionChange } from "@/utilities/guest/guestSession.js";

/**
 * Time left in the guest demo.
 *
 * Every tick recomputes from an absolute deadline rather than decrementing a
 * counter, which is what makes it survive the three things that break naive
 * timers: a wrong device clock (the deadline was derived from the server's own
 * clock reading at handshake), a throttled or sleeping background tab (waking
 * recomputes immediately rather than resuming where it left off), and a second
 * tab (every tab holds the same deadline, and ending in one broadcasts to the
 * rest).
 *
 * The real enforcement is the JWT's own expiry - this is what the user sees.
 */
const useGuestCountdown = (onExpire) => {
    const guest = useSelector((state) => state.guest);
    const expiresAtLocal = guest?.expiresAtLocal ?? null;

    const [remainingMs, setRemainingMs] = useState(() =>
        expiresAtLocal ? Math.max(0, expiresAtLocal - Date.now()) : null
    );

    const expiredRef = useRef(false);
    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    const fireExpiry = useCallback((reason) => {
        if (expiredRef.current) return;
        expiredRef.current = true;
        onExpireRef.current?.(reason);
    }, []);

    useEffect(() => {
        if (!expiresAtLocal) {
            setRemainingMs(null);
            expiredRef.current = false;
            return undefined;
        }

        const tick = () => {
            const left = expiresAtLocal - Date.now();
            setRemainingMs(Math.max(0, left));
            if (left <= 0) fireExpiry("expired");
        };

        tick();
        const id = setInterval(tick, 1000);

        // A backgrounded tab's interval is throttled to once a minute or less,
        // and a suspended one stops entirely - so recheck the moment it wakes.
        const onWake = () => tick();
        document.addEventListener("visibilitychange", onWake);
        window.addEventListener("focus", onWake);
        window.addEventListener("pageshow", onWake);

        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", onWake);
            window.removeEventListener("focus", onWake);
            window.removeEventListener("pageshow", onWake);
        };
    }, [expiresAtLocal, fireExpiry]);

    // Another tab ended the demo.
    useEffect(() => {
        if (!expiresAtLocal) return undefined;
        return onSessionChange((type) => {
            if (type === "end") fireExpiry("other-tab");
        });
    }, [expiresAtLocal, fireExpiry]);

    return {
        isGuest: Boolean(expiresAtLocal),
        remainingMs,
        hasParentPreview: Boolean(guest?.hasParentPreview),
    };
};

export default useGuestCountdown;
