import { createSlice } from '@reduxjs/toolkit';

const teacherSlice = createSlice({
    name: 'teachers',
    initialState: { teachers: [] },
    reducers: {
        setTeachers: (state, action) => { state.teachers = action.payload; },
        addTeacher: (state, action) => { state.teachers.push(action.payload); },
        updateTeacher: (state, action) => {
            const idx = state.teachers.findIndex(t => t._id === action.payload._id);
            if (idx !== -1) state.teachers[idx] = action.payload;
        },
        removeTeacher: (state, action) => {
            state.teachers = state.teachers.filter(t => t._id !== action.payload);
        },
    },
});

export const { setTeachers, addTeacher, updateTeacher, removeTeacher } = teacherSlice.actions;
export default teacherSlice.reducer;
