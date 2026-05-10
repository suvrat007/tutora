import axiosInstance from "@/utilities/axiosInstance.jsx";
import { useDispatch } from "react-redux";
import { setUser } from "@/utilities/redux/userSlice.js";
import { setSubscription } from "@/utilities/redux/subscriptionSlice.js";

const useFetchUser = () => {
    const dispatch = useDispatch();
    const getUser = async () => {
        try {
            const [userRes, subRes] = await Promise.all([
                axiosInstance.get("admin/get", { withCredentials: true }),
                axiosInstance.get("subscription/status", { withCredentials: true }),
            ]);
            dispatch(setUser(userRes.data.data));
            dispatch(setSubscription(subRes.data));
            return userRes.data.data;
        } catch (error) {
            console.error("Failed to fetch user session, clearing user state.");
            return null;
        }
    };
    return getUser;
}
export default useFetchUser;
