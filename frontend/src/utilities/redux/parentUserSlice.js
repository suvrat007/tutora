import { createSlice } from "@reduxjs/toolkit";

const parentUserSlice = createSlice({
    name: "parentUser",
    initialState: null,
    reducers: {
        setParentUser: (state, action) => action.payload,
        clearParentUser: () => null
    }
});

export const { setParentUser, clearParentUser } = parentUserSlice.actions;
export default parentUserSlice.reducer;
