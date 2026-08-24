import { createSlice } from "@reduxjs/toolkit";
import { deleteUser, setUser } from "./userSlice.js";

/**
 * How far the admin session check has got. `user` alone can't answer this:
 * null means both "logged out" and "we haven't heard back yet", and telling
 * them apart matters while the backend cold-starts — otherwise a sleeping
 * server looks exactly like a signed-out visitor and we bounce them to /login.
 *
 * "pending"        — the session check hasn't resolved yet
 * "authenticated"  — a session came back
 * "unauthenticated"— the server said no (401/403), or the admin logged out
 * "unreachable"    — the request never got an answer (cold start / offline)
 */
const authStatusSlice = createSlice({
    name: "authStatus",
    initialState: "pending",
    reducers: {
        setAuthStatus: (state, action) => action.payload,
    },
    // Derived from the user actions themselves so the two can never disagree:
    // any login path that sets a user, and logout, are covered without changes.
    extraReducers: (builder) => {
        builder.addCase(setUser, () => "authenticated").addCase(deleteUser, () => "unauthenticated");
    },
});

export const { setAuthStatus } = authStatusSlice.actions;
export default authStatusSlice.reducer;
