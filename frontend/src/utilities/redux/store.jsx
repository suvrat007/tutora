import { configureStore } from '@reduxjs/toolkit';
import userDataSlice from "@/utilities/redux/userDataSlice.jsx";
import userSlice from "@/utilities/redux/userSlice.jsx";
import reminderSlice from "@/utilities/redux/reminderSlice.js";

const store =  configureStore({
    reducer: {
        user: userSlice,
        userData : userDataSlice,
        reminder : reminderSlice,
    },
});

export default store;