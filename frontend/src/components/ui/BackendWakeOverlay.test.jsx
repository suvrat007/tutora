import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import BackendWakeOverlay from "./BackendWakeOverlay.jsx";
import { BackendStatusProvider } from "@/utilities/BackendStatusContext.jsx";
import DragonRunGame from "./DragonRunGame.jsx";

/** jsdom has no canvas: hand the game a context whose every method is a no-op. */
const stubCanvas = () => {
    const noop = () => {};
    const ctx = new Proxy(
        { createLinearGradient: () => ({ addColorStop: noop }) },
        {
            get: (target, prop) => (prop in target ? target[prop] : noop),
            set: () => true,
        }
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
};

const stubResizeObserver = () => {
    globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
};

beforeEach(() => {
    stubCanvas();
    stubResizeObserver();
    localStorage.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe("BackendWakeOverlay", () => {
    it("stays out of the way when the backend answers quickly", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ status: "ok" }) })
        );

        render(
            <BackendStatusProvider>
                <BackendWakeOverlay />
            </BackendStatusProvider>
        );

        await waitFor(() => expect(fetch).toHaveBeenCalled());
        await new Promise((r) => setTimeout(r, 2200)); // past SHOW_AFTER_MS
        expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("shows the wake-up screen with the game once the ping is slow", async () => {
        vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {}))); // never settles

        const { container } = render(
            <BackendStatusProvider>
                <BackendWakeOverlay />
            </BackendStatusProvider>
        );

        await waitFor(
            () => expect(screen.getByRole("heading", { name: /waking up the server/i })).toBeInTheDocument(),
            { timeout: 4000 }
        );
        expect(container.querySelector("canvas")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
    });

    it("hits the health route with a cache-busting param so the service worker can't answer it", async () => {
        vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

        render(
            <BackendStatusProvider>
                <BackendWakeOverlay />
            </BackendStatusProvider>
        );

        await waitFor(() => expect(fetch).toHaveBeenCalled());
        const [url, options] = fetch.mock.calls[0];
        expect(url).toMatch(/\/api\/v1\/health\?t=\d+/);
        expect(options.cache).toBe("no-store");
    });
});

describe("DragonRunGame", () => {
    it("starts a run on Space and reports the play state", async () => {
        const onPlayStateChange = vi.fn();
        render(<DragonRunGame onPlayStateChange={onPlayStateChange} />);

        act(() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
        });

        expect(onPlayStateChange).toHaveBeenCalledWith("playing");
    });

    it("eventually crashes into an obstacle when the player never jumps again", async () => {
        const onPlayStateChange = vi.fn();
        render(<DragonRunGame onPlayStateChange={onPlayStateChange} />);

        act(() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
        });

        // Let the loop run for real: the first spire has to reach the dragon.
        await waitFor(() => expect(onPlayStateChange).toHaveBeenCalledWith("gameover"), { timeout: 12000 });
    }, 15000);

    it("remembers the high score across mounts", async () => {
        const { unmount } = render(<DragonRunGame />);
        act(() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
        });
        await waitFor(() => expect(Number(localStorage.getItem("tutora_dragon_high_score"))).toBeGreaterThan(0), {
            timeout: 12000,
        });
        const first = Number(localStorage.getItem("tutora_dragon_high_score"));
        unmount();

        render(<DragonRunGame />);
        expect(Number(localStorage.getItem("tutora_dragon_high_score"))).toBe(first);
    }, 15000);
});
