import { useCallback, useEffect, useRef, useState } from "react";
import { useBackendStatus } from "@/utilities/BackendStatusContext.jsx";
import DragonRunGame from "./DragonRunGame.jsx";

/**
 * Shown while the free-tier Render backend cold-starts (~30-60s on the first
 * request after it sleeps). The app keeps loading underneath — this only
 * covers the wait so it doesn't feel like a broken page.
 *
 * Dismissal is deliberate about not yanking the game away mid-jump: once the
 * server answers, a run in progress gets a "Continue" button instead.
 */

// Rough cold-start budget, used only to pace the progress bar.
const EXPECTED_WAIT_MS = 55000;
const AUTO_DISMISS_MS = 2500;

const BackendWakeOverlay = () => {
    const { status, elapsedMs, isOffline, retry } = useBackendStatus();
    const [playState, setPlayState] = useState("idle");
    const [dismissed, setDismissed] = useState(false);
    const dismissTimerRef = useRef(null);

    const dismiss = useCallback(() => setDismissed(true), []);

    // Once the server is up: leave immediately if they never started a run,
    // linger briefly after a game over, and wait for them if they're playing.
    useEffect(() => {
        if (status !== "ready" || dismissed) return undefined;
        if (playState === "playing") return undefined;

        const delay = playState === "idle" ? 0 : AUTO_DISMISS_MS;
        dismissTimerRef.current = setTimeout(dismiss, delay);
        return () => clearTimeout(dismissTimerRef.current);
    }, [status, playState, dismissed, dismiss]);

    const visible = !dismissed && (status === "waking" || status === "failed" || (status === "ready" && playState !== "idle"));

    // Lock the page behind the overlay so Space/arrows can't scroll it.
    useEffect(() => {
        if (!visible) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [visible]);

    if (!visible) return null;

    const seconds = Math.floor(elapsedMs / 1000);
    const progress = Math.min(95, (elapsedMs / EXPECTED_WAIT_MS) * 100);
    const isReady = status === "ready";
    const isFailed = status === "failed";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#f8ede3] p-4">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-[#e0c4a8]/30 blur-3xl" />
                <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#d4b896]/30 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                <div className="rounded-2xl border border-[#e6d3bd] bg-[#fdf6ee]/90 p-5 shadow-xl backdrop-blur-sm sm:p-7">
                    <header className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-[#5a4a3c] sm:text-2xl">
                                {isReady && "Server's awake!"}
                                {isFailed && "Still can't reach the server"}
                                {!isReady && !isFailed && "Waking up the server…"}
                            </h1>
                            <p className="mt-1 max-w-md text-sm text-[#7b5c4b]">
                                {isReady && "Tutora is ready whenever you are — finish your run first if you like."}
                                {isFailed &&
                                    "It's taking unusually long. Check your connection, or give it another try."}
                                {!isReady &&
                                    !isFailed &&
                                    (isOffline
                                        ? "You appear to be offline. We'll keep trying in the background."
                                        : "Our server sleeps when idle and takes up to a minute to boot. Have a game of Dragon Run while it wakes up.")}
                            </p>
                        </div>

                        {isReady ? (
                            <button
                                type="button"
                                onClick={dismiss}
                                className="shrink-0 rounded-lg bg-[#8b5e3c] px-4 py-2 text-sm font-semibold text-[#f8ede3] transition-colors hover:bg-[#7b5c4b]"
                            >
                                Continue →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={dismiss}
                                className="shrink-0 rounded-lg border border-[#d7b48f] px-3 py-1.5 text-xs font-medium text-[#7b5c4b] transition-colors hover:bg-[#f0d9c0]/60"
                            >
                                Skip
                            </button>
                        )}
                    </header>

                    <div className="mb-5">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ecdcc9]">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${
                                    isReady ? "bg-[#4c8a5a]" : isFailed ? "bg-[#b5643c]" : "bg-[#8b5e3c]"
                                }`}
                                style={{ width: isReady ? "100%" : `${isFailed ? 100 : progress}%` }}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-[#a08871]">
                            <span className="flex items-center gap-2">
                                <span
                                    className={`inline-block h-2 w-2 rounded-full ${
                                        isReady
                                            ? "bg-[#4c8a5a]"
                                            : isFailed
                                              ? "bg-[#b5643c]"
                                              : "animate-pulse bg-[#8b5e3c]"
                                    }`}
                                />
                                {isReady ? "Connected" : isFailed ? "No response" : "Connecting to Tutora API"}
                            </span>
                            <span className="tabular-nums">{seconds}s</span>
                        </div>
                    </div>

                    <DragonRunGame onPlayStateChange={setPlayState} />

                    <footer className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="hidden text-xs text-[#a08871] sm:block">
                            <kbd className="rounded border border-[#e0c4a8] bg-[#f8ede3] px-1.5 py-0.5">Space</kbd> jump
                            {"  ·  "}
                            <kbd className="rounded border border-[#e0c4a8] bg-[#f8ede3] px-1.5 py-0.5">↓</kbd> duck
                        </p>
                        {isFailed && (
                            <button
                                type="button"
                                onClick={retry}
                                className="rounded-lg bg-[#8b5e3c] px-4 py-2 text-sm font-semibold text-[#f8ede3] transition-colors hover:bg-[#7b5c4b]"
                            >
                                Try again
                            </button>
                        )}
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default BackendWakeOverlay;
