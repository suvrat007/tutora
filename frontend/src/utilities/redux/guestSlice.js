import { createSlice } from "@reduxjs/toolkit";
import { deleteUser } from "./userSlice.js";

/**
 * Mirrors the guest-demo session into Redux for rendering.
 *
 * `null` means a normal session. Otherwise it holds the local deadline the
 * countdown renders from. Like authStatusSlice, it keys off the user actions so
 * it can never outlive the user it belongs to.
 */
const guestSlice = createSlice({
    name: "guest",
    initialState: null,
    reducers: {
        startGuest: (state, action) => action.payload,
        endGuest: () => null,
    },
    extraReducers: (builder) => {
        builder.addCase(deleteUser, () => null);
    },
});

export const { startGuest, endGuest } = guestSlice.actions;
export default guestSlice.reducer;
