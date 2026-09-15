import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { RESET_APP } from "@/utilities/redux/store.js";
import { clearApiCaches } from "@/utilities/guest/guestTeardown.js";
import toast from 'react-hot-toast';

const useLogoutAdmin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post('auth/logout', {}, {
                withCredentials: true,
            });

            // One reset clears all eleven slices. The previous per-slice list had
            // drifted and was leaving tests, teachers, attendance and feeSummary
            // behind for the next account logged in on this device.
            dispatch({ type: RESET_APP });
            await clearApiCaches();

            navigate("/", { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    };

    return handleLogout;
};

export default useLogoutAdmin;
