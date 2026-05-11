import axiosInstance from "@/utilities/axiosInstance.jsx";
import { useDispatch } from "react-redux";
import { setParentUser } from "@/utilities/redux/parentUserSlice.js";

const useFetchParentUser = () => {
    const dispatch = useDispatch();
    const getParentUser = async () => {
        try {
            const response = await axiosInstance.get("parent/me");
            dispatch(setParentUser(response.data));
            return response.data;
        } catch (error) {
            const status = error.response?.status;
            if (status === 401 || status === 403) return null;
            throw error;
        }
    };
    return getParentUser;
};

export default useFetchParentUser;
