import {createSlice} from "@reduxjs/toolkit";
import userSlice from "@/utilities/redux/userSlice.jsx";

const reminderSlice = createSlice({
    name: "reminder",
    initialState: {
        reminders: []
    },
    reducers: {
        setReminders: (state, action) => {
            state.reminders = action.payload;
            state.updatedReminders = {}; // Reset updates when new reminders are loaded
        },
        setStatus: (state, action) => {
            const { batchId, subjectId, reminderId } = action.payload;

            const reminderToUpdate = state.reminders.find(
                (r) =>
                    r.batchId === batchId &&
                    r.subjectId === subjectId &&
                    r.reminderId === reminderId
            );

            if (reminderToUpdate) {
                reminderToUpdate.done = !reminderToUpdate.done;
            } else {
                console.warn(`Reminder with batchId: ${batchId}, subjectId: ${subjectId}, reminderId: ${reminderId} not found.`);
            }
        },
    },
});

export const { setReminders, setStatus } = reminderSlice.actions;
export default reminderSlice.reducer;