import {useDispatch} from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import {addStudents} from "@/utilities/redux/studentSlice.jsx";

const useFetchStudents =  () => {
    const dispatch = useDispatch();
    const getAllStudents = async () => {
        try {
            const response = await axiosInstance.get(`/api/student/get-all-students-of-institute`,{withCredentials:true});
            dispatch(addStudents(response.data));
        } catch (error) {
            console.log(error.message);
        }
    };
    return getAllStudents
}
export default useFetchStudents;