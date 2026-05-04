import axios from "axios";
import { useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { addBatches } from "@/utilities/redux/batchSlice.js";

const useFetchBatches = () => {
    const dispatch = useDispatch();
    const getAllBatches = async (signal) => {
        try {
            const response = await axiosInstance.get('batch/get-all-batches', { withCredentials: true, signal });
            dispatch(addBatches(response.data.data));
        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error(error.message);
        }
    };
    return getAllBatches;
};

export default useFetchBatches;