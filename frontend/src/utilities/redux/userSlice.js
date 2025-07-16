import {createSlice} from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: null,
    reducers: {
        setUser: (state, action) => {
            return action.payload;
        },
        deleteUser: () => {
            return null
        }
    }
})
export const {setUser,deleteUser} = userSlice.actions;
export default userSlice.reducer;