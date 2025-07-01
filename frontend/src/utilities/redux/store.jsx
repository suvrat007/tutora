import { configureStore } from '@reduxjs/toolkit';
import batchSlice from "@/utilities/redux/batchSlice.jsx";
import userSlice from "@/utilities/redux/userSlice.jsx";
import reminderSlice from "@/utilities/redux/reminderSlice.js";
import studentSlice from "@/utilities/redux/studentSlice.jsx";

const store =  configureStore({
    reducer: {
        user: userSlice,
        batches : batchSlice,
        students : studentSlice,
        reminder : reminderSlice,
    },
});

export default store;