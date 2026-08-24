import axiosInstance from "@/utilities/axiosInstance.jsx";
import {useDispatch} from "react-redux";
import {setUser} from "@/utilities/redux/userSlice.js";
import {setAuthStatus} from "@/utilities/redux/authStatusSlice.js";

const useFetchUser = () => {
    const dispatch = useDispatch();
    const getUser = async () => {
        try {
            const response = await axiosInstance.get("admin/get", { withCredentials: true });
            dispatch(setUser(response.data.data));  // also flips authStatus to "authenticated"
            return response.data.data;
        } catch (error) {
            const status = error.response?.status;
            // A rejection is the server telling us there's no session. No answer
            // at all (or a proxy 5xx) usually means it's still cold-starting —
            // don't treat that as "logged out", or we sign the admin out for it.
            const rejected = status === 401 || status === 403;
            dispatch(setAuthStatus(rejected ? "unauthenticated" : "unreachable"));
            if (rejected) {
                console.warn("No active admin session.");
            } else {
                console.error("Could not reach the server for the session check.");
            }
            return null;
        }
    };
    return getUser;
}
export default useFetchUser
