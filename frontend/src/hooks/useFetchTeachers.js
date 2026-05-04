import axios from "axios";
import { useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setTeachers } from "@/utilities/redux/teacherSlice.js";

const useFetchTeachers = () => {
    const dispatch = useDispatch();
    const getAllTeachers = async (signal) => {
        try {
            const response = await axiosInstance.get('teacher/all', { withCredentials: true, signal });
            dispatch(setTeachers(response.data.data));
        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error(error.message);
        }
    };
    return getAllTeachers;
};

export default useFetchTeachers;
