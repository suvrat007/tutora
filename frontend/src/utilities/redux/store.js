import { configureStore } from '@reduxjs/toolkit';
import batchSlice from "@/utilities/redux/batchSlice.js";
import userSlice from "@/utilities/redux/userSlice.js";
import studentSlice from "@/utilities/redux/studentSlice.js";
import classLogsSlice from "@/utilities/redux/classLogsSlice.js";
import feeSlice from '@/utilities/redux/feeSlice.js';
import testSlice from './testSlice';
import teacherSlice from './teacherSlice';

const store =  configureStore({
    reducer: {
        user: userSlice,
        batches : batchSlice,
        students : studentSlice,
        classlogs : classLogsSlice,
        fees:feeSlice,
        tests: testSlice,
        teachers: teacherSlice,
    },
});

export default store;