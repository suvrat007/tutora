import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { deleteUser } from "./utilities/redux/userSlice.jsx";

const useLogoutAdmin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/api/auth/logout", {}, {
                withCredentials: true,
            });

            dispatch(deleteUser());         // Clear user from Redux
            navigate("/login", { replace: true }); // Redirect to login or landing
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return handleLogout;
};

export default useLogoutAdmin;
