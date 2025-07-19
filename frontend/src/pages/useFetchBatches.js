import {useDispatch} from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import {addBatches} from "@/utilities/redux/batchSlice.js";

const useFetchBatches =  () => {
    const dispatch = useDispatch();
    const getAllBatches = async () => {
        try {
            const response = await axiosInstance.get(`/api/batch/get-all-batches`,{withCredentials:true});
            dispatch(addBatches(response.data));
        } catch (error) {
            console.error(error.message);
        }
    };
    return getAllBatches
}
export default useFetchBatches;