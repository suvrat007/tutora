import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Clock, Eye, Users } from "lucide-react";
import useGuestCountdown from "@/hooks/useGuestCountdown.js";
import { endGuestSession } from "@/utilities/guest/guestTeardown.js";

/**
 * Everything a guest sees about their demo session: the countdown, the warning,
 * and the hand-off at the end.
 *
 * Rendered at the route roots (Body and ParentBody) rather than in the Navbar,
 * because the Navbar doesn't exist on the parent-portal preview and the
 * countdown has to follow the guest everywhere.
 */

const WARN_AT_MS = 2 * 60 * 1000;
const URGENT_AT_MS = 30 * 1000;

const formatClock = (ms) => {
    const total = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const GuestChrome = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [ended, setEnded] = useState(false);
    const warnedRef = useRef(false);

    const { isGuest, remainingMs, hasParentPreview } = useGuestCountdown(() => setEnded(true));
    const inParentPortal = pathname.startsWith("/parent");

    // One-shot warning. A ref latch, not state, so re-renders can't refire it.
    useEffect(() => {
        if (!isGuest || remainingMs === null || warnedRef.current) return;
        if (remainingMs > WARN_AT_MS) return;
        warnedRef.current = true;
        toast("Two minutes left in your demo.", { id: "guest-warning", duration: 6000 });
    }, [isGuest, remainingMs]);

    // Tear down once, then hand them to the login page with the reason.
    useEffect(() => {
        if (!ended) return;
        let cancelled = false;
        (async () => {
            await endGuestSession();
            if (!cancelled) navigate("/login?demo=ended", { replace: true });
        })();
        return () => {
            cancelled = true;
        };
    }, [ended, navigate]);

    if (!isGuest || remainingMs === null) return null;

    const urgent = remainingMs <= URGENT_AT_MS;
    const warning = remainingMs <= WARN_AT_MS;

    const tone = urgent
        ? "bg-[#8a2f1d] text-[#fdeee8]"
        : warning
          ? "bg-[#a8703f] text-[#fff8f0]"
          : "bg-[#2c1a0e]/90 text-[#f8ede3]";

    return (
        <>
            {/* Sits above the mobile bottom nav, which MainLayout pads for. */}
            <div className="fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-2 md:bottom-4">
                {/* The only way into the parent preview - the portal has its own
                    login and no path back to the dashboard, so the switch has to
                    live out here with the countdown. */}
                {hasParentPreview && (
                    <button
                        type="button"
                        onClick={() => navigate(inParentPortal ? "/main" : "/parent")}
                        className="flex items-center gap-2 rounded-full bg-[#fdf6ee] px-3.5 py-2 text-xs font-semibold text-[#7b5c4b] shadow-lg ring-1 ring-[#e0c4a8] transition-colors hover:bg-white"
                    >
                        {inParentPortal ? (
                            <>
                                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                Back to tutor view
                            </>
                        ) : (
                            <>
                                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                                See the parent view
                            </>
                        )}
                    </button>
                )}

                <div className={`flex items-center gap-2.5 rounded-full px-3.5 py-2 shadow-lg backdrop-blur ${tone}`}>
                    <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="text-xs font-semibold">Demo</span>
                    <span className="flex items-center gap-1 text-xs tabular-nums opacity-90">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatClock(remainingMs)}
                    </span>
                    <button
                        type="button"
                        onClick={() => setEnded(true)}
                        className="ml-0.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold transition-colors hover:bg-white/25"
                    >
                        Sign up
                    </button>
                </div>
            </div>

            {ended && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#2c1a0e]/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-[#fdf6ee] p-6 text-center shadow-2xl">
                        <h2 className="text-lg font-bold text-[#2c1a0e]">Your demo has ended</h2>
                        <p className="mt-2 text-sm text-[#7b5c4b]">
                            Hope you liked the look of it. Create a free account to start with your own students.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default GuestChrome;
