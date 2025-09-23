import { configureStore } from '@reduxjs/toolkit';
import batchSlice from "@/utilities/redux/batchSlice.js";
import userSlice from "@/utilities/redux/userSlice.js";
import studentSlice from "@/utilities/redux/studentSlice.js";
import classLogsSlice from "@/utilities/redux/classLogsSlice.js";
import attendanceSlice from "@/utilities/redux/attendanceSlice.js";
import feeSlice from '@/utilities/redux/feeSlice.js';
import testSlice from './testSlice';

const store =  configureStore({
    reducer: {
        user: userSlice,
        batches : batchSlice,
        students : studentSlice,
        classlogs : classLogsSlice,
        attendance : attendanceSlice,
        fees:feeSlice,
        tests: testSlice,
    },
});

export default store;