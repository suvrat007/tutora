import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userSlice from "@/utilities/redux/userSlice.js";
import authStatusSlice, { setAuthStatus } from "@/utilities/redux/authStatusSlice.js";
import { setUser, deleteUser } from "@/utilities/redux/userSlice.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import BackendStatusContext from "@/utilities/BackendStatusContext.jsx";

vi.mock("react-hot-toast", () => ({
    default: { error: vi.fn(), success: vi.fn() },
}));

const makeStore = () =>
    configureStore({ reducer: { user: userSlice, authStatus: authStatusSlice } });

const admin = { _id: "a1", institute_info: { name: "Tutora Classes" } };

const renderGuard = (store, backendStatus = "waking") =>
    render(
        <Provider store={store}>
            <BackendStatusContext.Provider
                value={{ status: backendStatus, elapsedMs: 0, isOffline: false, retry: () => {} }}
            >
                <MemoryRouter initialEntries={["/main"]}>
                    <Routes>
                        <Route
                            path="/main"
                            element={
                                <ProtectedRoute>
                                    <div>Dashboard</div>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/login" element={<div>Login page</div>} />
                    </Routes>
                </MemoryRouter>
            </BackendStatusContext.Provider>
        </Provider>
    );

describe("ProtectedRoute during a backend cold start", () => {
    let store;
    beforeEach(() => {
        store = makeStore();
    });

    it("holds the loader instead of logging the admin out while the server boots", async () => {
        renderGuard(store, "waking");
        store.dispatch(setAuthStatus("unreachable"));

        // The old guard redirected 500ms after mount regardless of why the
        // session check failed; this must not happen while the server is cold.
        await new Promise((r) => setTimeout(r, 900));
        expect(screen.queryByText("Login page")).not.toBeInTheDocument();
        expect(screen.getByText(/verifying your access/i)).toBeInTheDocument();
    });

    it("lets the admin through once the retried session check succeeds", async () => {
        renderGuard(store, "waking");
        store.dispatch(setAuthStatus("unreachable"));

        await new Promise((r) => setTimeout(r, 600));
        store.dispatch(setUser(admin)); // what the retry-on-wake does

        await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
    });

    it("still redirects when the server actually rejects the session", async () => {
        renderGuard(store, "ready");
        store.dispatch(setAuthStatus("unauthenticated"));

        await waitFor(() => expect(screen.getByText("Login page")).toBeInTheDocument());
    });

    it("gives up and redirects if the backend never wakes", async () => {
        renderGuard(store, "failed");
        store.dispatch(setAuthStatus("unreachable"));

        await waitFor(() => expect(screen.getByText("Login page")).toBeInTheDocument());
    });
});

describe("authStatus slice", () => {
    it("tracks the user actions so it can't drift from the session", () => {
        expect(authStatusSlice(undefined, { type: "@@init" })).toBe("pending");
        expect(authStatusSlice("pending", setUser(admin))).toBe("authenticated");
        expect(authStatusSlice("authenticated", deleteUser())).toBe("unauthenticated");
        expect(authStatusSlice("pending", setAuthStatus("unreachable"))).toBe("unreachable");
    });
});
