import { useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setGroupedStudents } from "@/utilities/redux/studentSlice.jsx";

const useFetchStudents = () => {
    const dispatch = useDispatch();

    const fetchGroupedStudents = async () => {
        try {
            const response = await axiosInstance.get(
                "/api/student/get-students-grouped-by-batch",
                { withCredentials: true }
            );
            dispatch(setGroupedStudents(response.data));
        } catch (error) {
            console.error("Error fetching grouped students:", error.message);
        }
    };

    return fetchGroupedStudents;
};

export default useFetchStudents;
