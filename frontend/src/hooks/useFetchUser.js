import axiosInstance from "@/utilities/axiosInstance.jsx";
import {useDispatch} from "react-redux";
import {setUser} from "@/utilities/redux/userSlice.js";

const useFetchUser = () => {
    const dispatch = useDispatch();
    const getUser = async () => {
        try {
            const response = await axiosInstance.get("admin/get", { withCredentials: true });
            dispatch(setUser(response.data.data));
            return response.data.data;
        } catch (error) {
            console.error("Failed to fetch user session, clearing user state.");
            return null;
        }
    };
    return getUser;
}
export default useFetchUser