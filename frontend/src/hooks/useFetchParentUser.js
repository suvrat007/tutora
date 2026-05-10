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
            console.error("Failed to fetch parent session, clearing parent state.");
            return null;
        }
    };
    return getParentUser;
};

export default useFetchParentUser;
