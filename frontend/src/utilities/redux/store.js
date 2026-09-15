import { configureStore, combineReducers } from '@reduxjs/toolkit';
import batchSlice from "@/utilities/redux/batchSlice.js";
import userSlice from "@/utilities/redux/userSlice.js";
import studentSlice from "@/utilities/redux/studentSlice.js";
import classLogsSlice from "@/utilities/redux/classLogsSlice.js";
import feeSlice from '@/utilities/redux/feeSlice.js';
import testSlice from './testSlice';
import teacherSlice from './teacherSlice';
import attendanceSlice from './attendanceSlice';
import feeSummarySlice from './feeSummarySlice';
import parentUserSlice from './parentUserSlice';
import authStatusSlice from './authStatusSlice';
import guestSlice from './guestSlice';

const appReducer = combineReducers({
    user: userSlice,
    authStatus: authStatusSlice,
    guest: guestSlice,
    parentUser: parentUserSlice,
    batches : batchSlice,
    students : studentSlice,
    classlogs : classLogsSlice,
    fees: feeSlice,
    tests: testSlice,
    teachers: teacherSlice,
    attendance: attendanceSlice,
    feeSummary: feeSummarySlice,
});

/** Wipes every slice at once. Dispatch it on logout and when a demo ends. */
export const RESET_APP = 'app/reset';

// Clearing slices one action at a time meant the list drifted as slices were
// added - logout was leaving tests, teachers, attendance and feeSummary behind,
// which leaked one account's data into the next login on a shared device. A
// root-level reset can't miss a slice.
const rootReducer = (state, action) =>
    appReducer(action.type === RESET_APP ? undefined : state, action);

const store = configureStore({
    reducer: rootReducer,
});

export default store;