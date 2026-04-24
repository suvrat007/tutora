import { useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setGroupedStudents } from "@/utilities/redux/studentSlice.js";

const useFetchStudents = () => {
    const dispatch = useDispatch();

    const fetchGroupedStudents = async () => {
        try {
            const response = await axiosInstance.get("/api/student/get-students-grouped-by-batch", {
                withCredentials: true,
            });
            dispatch(setGroupedStudents(response.data));
        } catch (error) {
            console.error("useFetchStudents:", error.message, error.response?.data);
        }
    };

    return fetchGroupedStudents;
};

export default useFetchStudents;
