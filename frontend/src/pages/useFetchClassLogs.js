import {useDispatch} from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import {addClassLogs} from "@/utilities/redux/classLogsSlice.js";

const useFetchClassLogs=  () => {
    const dispatch = useDispatch();
    const getAllClassLogs = async () => {
        try {
            const response = await axiosInstance.get(`/api/classLog/getAllClasslogs`,{withCredentials:true});
            dispatch(addClassLogs(response.data));
        } catch (error) {
            console.log(error.message);
        }
    };
    return getAllClassLogs
}
export default useFetchClassLogs;