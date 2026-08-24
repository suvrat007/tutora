import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Pings the backend on app load and reports whether it is still cold-starting.
 *
 * The API lives on a free Render instance that sleeps after inactivity, so the
 * first request of a session can take ~30-60s while the container boots. We
 * poll a cheap `/health` route (unrated-limited, no DB work) and expose the
 * wait so the UI can put something entertaining on screen meanwhile.
 *
 * Status: "checking" (too early to bother the user) → "waking" | "ready" | "failed".
 */

const HEALTH_URL = (import.meta.env.VITE_API_URL ?? "") + "/api/v1/health";

const SHOW_AFTER_MS = 2000;      // warm servers answer well inside this — no flash
const ATTEMPT_TIMEOUT_MS = 12000; // a boot in progress just never answers; retry instead
const RETRY_DELAY_MS = 2500;
const MAX_WAIT_MS = 150000;      // Render cold starts are slow, but not this slow

const useBackendWakeup = () => {
    const [status, setStatus] = useState("checking");
    const [elapsedMs, setElapsedMs] = useState(0);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    const startedAtRef = useRef(0);
    const timersRef = useRef([]);
    const abortRef = useRef(null);
    const cancelledRef = useRef(false);
    const attemptsRef = useRef(0);

    const clearTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    const run = useCallback(() => {
        cancelledRef.current = false;
        attemptsRef.current = 0;
        startedAtRef.current = Date.now();
        setStatus("checking");
        setElapsedMs(0);

        // Only reveal the overlay if the first attempt is visibly slow.
        timersRef.current.push(
            setTimeout(() => {
                if (!cancelledRef.current) {
                    setStatus((s) => (s === "checking" ? "waking" : s));
                }
            }, SHOW_AFTER_MS)
        );

        const attempt = async () => {
            if (cancelledRef.current) return;
            attemptsRef.current += 1;

            const controller = new AbortController();
            abortRef.current = controller;
            const timeoutId = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
            timersRef.current.push(timeoutId);

            try {
                // Unique query param keeps the PWA service worker (NetworkFirst on
                // /api/v1/*) from ever answering this from cache.
                const res = await fetch(`${HEALTH_URL}?t=${Date.now()}`, {
                    method: "GET",
                    cache: "no-store",
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (cancelledRef.current) return;
                if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
                setStatus("ready");
            } catch {
                clearTimeout(timeoutId);
                if (cancelledRef.current) return;
                if (Date.now() - startedAtRef.current > MAX_WAIT_MS) {
                    setStatus("failed");
                    return;
                }
                setStatus((s) => (s === "checking" ? "waking" : s));
                timersRef.current.push(setTimeout(attempt, RETRY_DELAY_MS));
            }
        };

        attempt();
    }, []);

    useEffect(() => {
        run();
        return () => {
            cancelledRef.current = true;
            clearTimers();
            abortRef.current?.abort();
        };
    }, [run]);

    // Elapsed clock, only while the user is actually waiting.
    useEffect(() => {
        if (status !== "waking") return;
        const id = setInterval(() => {
            setElapsedMs(Date.now() - startedAtRef.current);
        }, 250);
        return () => clearInterval(id);
    }, [status]);

    useEffect(() => {
        const online = () => setIsOffline(false);
        const offline = () => setIsOffline(true);
        window.addEventListener("online", online);
        window.addEventListener("offline", offline);
        return () => {
            window.removeEventListener("online", online);
            window.removeEventListener("offline", offline);
        };
    }, []);

    const retry = useCallback(() => {
        cancelledRef.current = true;
        clearTimers();
        abortRef.current?.abort();
        run();
    }, [run]);

    return { status, elapsedMs, isOffline, retry };
};

export default useBackendWakeup;
